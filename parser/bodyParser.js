// circular require BodyParser <- BbtagParser <- BodyParser
// when I require BodyParser it will get the unfinished export
// that's why I assign it here, before require('./bbtagParser')
exports.BodyParser = BodyParser;

const _ = require('lodash');
const StringSet = require('../util/stringSet').StringSet;
const StringMap = require('../util/stringMap').StringMap;
const Parser = require('./parser').Parser;
const SrcResolver = require('./srcResolver').SrcResolver;
const BbtagParser = require('./bbtagParser').BbtagParser;
const BodyLexer = require('./bodylexer').BodyLexer;
const util = require('util');
const TextNode = require('../node/textNode').TextNode;
const TagNode = require('../node/tagNode').TagNode;
const EscapedTag = require('../node/escapedTag').EscapedTag;
const CompositeTag = require('../node/compositeTag').CompositeTag;
const ErrorTag = require('../node/errorTag').ErrorTag;
const CommentNode = require('../node/commentNode').CommentNode;
const ReferenceNode = require('../node/referenceNode').ReferenceNode;
const HeaderTag = require('../node/headerTag').HeaderTag;
const VerbatimText = require('../node/verbatimText').VerbatimText;
const HtmlTransformer = require('../transformer/htmlTransformer').HtmlTransformer;
const TreeWalker = require('../transformer/treeWalker').TreeWalker;
const HREF_PROTOCOL_REG = require('../consts').HREF_PROTOCOL_REG;
const makeAnchor = require('../util/htmlUtil').makeAnchor;
const stripTags = require('../util/htmlUtil').stripTags;
const log = require('../util/log')(module);


/**
 * BodyParser creates node objects from general text.
 * Node attrs will *not* be checked by sanitizers, they can contain anything like `onclick=`
 * This provides maximal freedom to the parser.
 *
 * Parser knows about current trust mode, so it must make sure that these attributes are safe.
 *
 * @constructor
 */
function BodyParser(text, options) {
  if (!options.metadata) {
    options.metadata = {};
  }
  if (!options.metadata.refs) {
    options.metadata.refs = new StringSet();
  }
  if (!options.metadata.libs) {
    options.metadata.libs = new StringSet();
  }
  if (!options.metadata.head) {
    options.metadata.head = [];
  }
  if (!options.metadata.headers) {
    options.metadata.headers = [];
  }
  if (!options.metadata.headersAnchorMap) {
    options.metadata.headersAnchorMap = new StringMap();
  }
  this.taskRenderer = options.taskRenderer; // todo: use me

  Parser.call(this, options);

  this.lexer = new BodyLexer(text);
}

util.inherits(BodyParser, Parser);

BodyParser.prototype.validateOptions = function(options) {

  if (!("trusted" in options)) {
    throw new Error("Must have trusted option");
  }

};

//  Каждый вызов parse возвращает не узел, а массив узлов,
//  например [online] ... [/online] возвращает своё содержимое с учетом вложенных тегов
//  или пустой тег, если экспорт-режим
//  Это должен быть valid html
BodyParser.prototype.parse = function*() {
  var buffer = '';
  var children = [];

  while (!this.lexer.isEof()) {

    var nodes = this.parseNodes();

    if (nodes) {
      nodes = yield nodes;
      if (nodes.length === undefined) {
        nodes = [nodes];
      }

      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];

        if (buffer) {
          children.push(new TextNode(buffer));
          buffer = "";
        }
        children.push(node);
      }

    } else {
      buffer += this.lexer.consumeChar();
    }

  }

  if (buffer) {
    children.push(new TextNode(buffer));
  }

  return children;
};


/**
 * Every parse* method must return a generator (if sync => be generator by itself)
 *
 * @returns tokens array or (most often, for perf reasons) null if no token found
 */
BodyParser.prototype.parseNodes = function() {

  var token = null;

  // perf optimization for most chars
  switch(this.lexer.getChar()) {
  case '[':
    token = this.lexer.consumeLink() || this.lexer.consumeBbtagSelfClose() || this.lexer.consumeBbtagNeedClose();
    break;
  case '`':
    token = this.lexer.consumeCode();
    break;
  case '*':
    token = this.lexer.consumeBold() || this.lexer.consumeItalic();
    break;
  case '<':
    token = this.lexer.consumeComment() || this.lexer.consumeVerbatimTag();
    break;
  case '#':
    token = this.lexer.consumeHeader();
    break;
  }

  if (token === null) return null;

  switch (token.type) {
  case 'link':
    return this.parseLink(token);
  case 'bold':
    return this.parseBold(token);
  case 'italic':
    return this.parseItalic(token);
  case 'code':
    return this.parseCode(token);
  case 'comment':
    return this.parseComment(token);
  case 'bbtag':
    return this.parseBbtag(token);
  case 'verbatim':
    return this.parseVerbatim(token);
  case 'header':
    return this.parseHeader(token);
  default:
    throw new Error("Unexpected token: " + util.inspect(token));
  }

};

BodyParser.prototype.parseHeader = function* (token) {
  const titleNode = yield new BodyParser(token.title, this.subOpts()).parseAndWrap();
  var level = token.level;

  // There should be no ()[#references] inside header text,
  // because we may need to extract title/navigation from the content
  // and we'd like to do that without having to use DB for refs
  // ...anyway, reference inside a header has *no use*
  const checkWalker = new TreeWalker(titleNode);
  var foundReference = false;
  checkWalker.walk(function*(node) {
    if (node instanceof ReferenceNode) {
      foundReference = node;
    }
  });

  if (foundReference) {
    return new ErrorTag('div', "Reference " + foundReference.title + " is not allowed within a #Header");
  }


  // ---- Проверить уровень ----
  // Уровень ограничен 3, так как
  // во-первых, 3 должно быть достаточно
  // во-вторых, при экспорте h3 становится h5
  if (level > 3) {
    return new ErrorTag('div', "Header " + token.title + " is nested too deep (max 3)");
  }

  const headers = this.options.metadata.headers;

  if (headers.length === 0 && level != 1) {
    return new ErrorTag('div', "Первый заголовок должен иметь уровень 1, а не " + level);
  }

  if (headers.length > 0) {
    var prevLevel = headers[headers.length-1][0];
    if (level > prevLevel + 1) {
      return new ErrorTag('div', "Неправильная вложенность заголовка " + token.title + ": уровень " + level + " после " + prevLevel);
    }
  }

  /*
  // сдвинуть заголовки для экспорта
  if (this.options.headerLevelShift) {
    level += this.options.headerLevelShift;
  }
  */

  // проверить, нет ли уже заголовка с тем же названием
  // при фиксированном anchor к нему нельзя добавить -1 -2 -3
  // так что это ошибка
  if (token.anchor) {
    if (this.options.metadata.refs.has(token.anchor)) {
      return new ErrorTag('div', '[#' + token.anchor + '] already exists');
    }
  }

  // Проверить якорь, при необходимости добавить anchor-1, anchor-2
  var anchor = token.anchor || makeAnchor(token.title);

  const headersAnchorMap = this.options.metadata.headersAnchorMap;

  if(headersAnchorMap.has(anchor)) {
    // если якорь взят из заголовка - не имею права его менять (это reference), жёсткая ошибка
    if (token.anchor) {
      return new ErrorTag('div', '[#' + token.anchor + '] used in another header');
    }
    // иначе просто добавляю -2, -3 ...
    headersAnchorMap.set(anchor, headersAnchorMap.has(anchor) + 1);
    anchor = anchor + '-' + headersAnchorMap.get(anchor);
  } else {
    headersAnchorMap.set(anchor, 1);
  }

  // получим HTML заголовка для метаданных
  const htmlTransformer = new HtmlTransformer(titleNode, this.options);
  const titleHtml = (yield htmlTransformer.run()).trim();

  // ------- Ошибок точно нет, можно запоминать заголовок и reference ------

  headers.push([level, titleHtml, anchor]);

  // ---- сохранить reference ---
  if (token.anchor) {
    this.options.metadata.refs.add(anchor);
  }

  // в заголовок отдаём не уже полученный HTML, а titleNode,
  // чтобы внешний анализатор мог поискать в них ошибки
  return new HeaderTag(level, anchor, titleNode.getChildren());
};


/**
 * The parser is synchronous, we don't query DB here.
 *
 * Links in the form [](task/my-task) or [](mylesson) require title from DB
 * links in the form [](#ref) require reference from DB
 *  [ref] *may* exist later in this document, so we need parse it full before resolving
 * FIXME: move all link processing into second pass (single place)
 */
BodyParser.prototype.parseLink = function*(token) {
  var href = token.href || token.title; // [http://ya.ru]() is fine
  var title = token.title; // [](http://ya.ru) is fine, but [](#test) - see below

  var protocol = href.match(HREF_PROTOCOL_REG);
  if (protocol) {
    protocol = protocol[1].trim();
  }

  var titleParsed = yield new BodyParser(title, this.subOpts()).parse();

  // external link goes "as is"
  if (protocol) {
    if (!this.trusted && !~["http", "ftp", "https", "mailto"].indexOf(protocol.toLowerCase())) {
      return new ErrorTag("span", "Protocol " + protocol + " is not allowed");
    }

    return new CompositeTag("a", titleParsed, {href: href});
  }

  if (href[0] == '/') {
    // absolute link with title goes "as is", without title - we'll try to resolve the title
    if (!title) {
      return new ReferenceNode(href, titleParsed);
    }
    return new CompositeTag("a", titleParsed, {href: href});
  }

  if (href[0] == '#') { // Reference, need second pass to resolve it
    return new ReferenceNode(href, titleParsed);
  }

  // relative link
  var resolver = new SrcResolver(href, this.options);
  return new CompositeTag("a", titleParsed, {href: resolver.getWebPath()});
};

BodyParser.prototype.parseBbtag = function(token) {
  return new BbtagParser(token.name, token.attrs, token.body, this.subOpts()).parse();
};

BodyParser.prototype.parseBold = function(token) {
  return new BodyParser(token.body, this.subOpts()).parseAndWrap("strong");
};

BodyParser.prototype.parseItalic = function(token) {
  var parser = new BodyParser(token.body, this.subOpts());
  return parser.parseAndWrap("em");
};

BodyParser.prototype.parseCode = function* (token) {
  return new EscapedTag("code", token.body);
};

BodyParser.prototype.parseComment = function* (token) {
  return new CommentNode(token.body);
};

BodyParser.prototype.parseVerbatim = function*(token) {
  return new VerbatimText(token.body);
};
