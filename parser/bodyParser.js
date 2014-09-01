// circular require BodyParser <- BbtagParser <- BodyParser
// when I require BodyParser it will get the unfinished export
// that's why I assign it here, before require('./bbtagParser')
module.exports = BodyParser;

var inherits = require('inherits');
var _ = require('lodash');
var assert = require('assert');
var StringSet = require('../util/stringSet');
var StringMap = require('../util/stringMap');
var Parser = require('./parser');
var BbtagParser = require('./bbtagParser');
var BodyLexer = require('./bodyLexer');
var ReferenceNode = require('../node/referenceNode');
var TagNode = require('../node/tagNode');
var EscapedTag = require('../node/escapedTag');
var CompositeTag = require('../node/compositeTag');
var BbtagAttrsParser = require('./bbtagAttrsParser');
var ErrorTag = require('../node/errorTag');
var CommentNode = require('../node/commentNode');
var HeaderTag = require('../node/headerTag');
var VerbatimText = require('../node/verbatimText');
var TreeWalkerSync = require('../transformer/treeWalkerSync');
var HREF_PROTOCOL_REG = require('../consts').HREF_PROTOCOL_REG;
var makeAnchor = require('../util/makeAnchor');
var TextNode = require('../node/textNode');

/**
 * BodyParser creates node objects from general text.
 * Node attrs will *not* be checked by sanitizers, they can contain anything like `onclick=`
 * This provides maximal freedom to the parser.
 *
 * Parser knows about current trust mode, so it must make sure that these attributes are safe.
 *
 * Parser builds a tree structure, parsing all text and if needed, transforming it on the fly,
 * so that a traversal may reach all descendants.
 *
 * The final node.toHtml call MAY generate more text, but MAY NOT generate more nodes in the process.
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

  Parser.call(this, options);

  this.lexer = new BodyLexer(text);
}

inherits(BodyParser, Parser);

BodyParser.prototype.validateOptions = function(options) {

  if (!("trusted" in options)) {
    throw new Error("Must have trusted option");
  }

};

//  Каждый вызов parse возвращает не узел, а массив узлов,
//  например [online] ... [/online] возвращает своё содержимое с учетом вложенных тегов
//  или пустой тег, если экспорт-режим
//  Это должен быть valid html
BodyParser.prototype.parse = function() {
  var buffer = '';
  var children = [];

  while (!this.lexer.isEof()) {

    var nodes = this.parseNodes();

    if (nodes) {

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
 * @returns tokens array or (most often, for perf reasons) null if no token found
 */
BodyParser.prototype.parseNodes = function() {

  var token = null;

  // perf optimization for most chars
  switch (this.lexer.getChar()) {
  case '[':
    token = this.lexer.consumeLink() || this.lexer.consumeBbtagSelfClose() || this.lexer.consumeBbtagNeedClose();
    break;
  case '`':
    token = this.lexer.consumeSource() || this.lexer.consumeCode();
    break;
  case '~':
    token = this.lexer.consumeStrike();
    break;
  case '*':
    token = this.lexer.consumeBold() || this.lexer.consumeItalic();
    break;
  case '<':
    token = this.lexer.consumeImg() || this.lexer.consumeComment() || this.lexer.consumeVerbatimTag();
    break;
  case '#':
    token = this.lexer.consumeHeader();
    break;
  }

  if (token === null) return null;

  var methodName = 'parse' + token.type[0].toUpperCase() + token.type.slice(1);
  if (!this[methodName]) {
    throw new Error("Unknown token: " + JSON.stringify(token));
  }

  var node = this[methodName](token);

  return node;
};

/**
 * This does several things
 * 1) Parses header (must not contain external stuff)
 * 2) Checks header structure (and builds headers array)
 * @param token
 * @returns {*}
 */
BodyParser.prototype.parseHeader = function(token) {
  var p = new BodyParser(token.title, this.options);
  var titleNode = p.parseAndWrap();

  var level = token.level;

  // There should be no ()[#references] or other external nodes inside header text,
  // because we may need to extract title/navigation from the content
  // and we'd like to do that without having to use DB for refs
  // ...anyway, reference inside a header has *no use*
  var checkWalker = new TreeWalkerSync(titleNode);
  checkWalker.walk(function(node) {
    if (node.isExternal()) {
      return new TextNode(''); // kill external nodes!
    }
  }.bind(this));

  // ---- Проверить уровень ----
  // Уровень ограничен 3, так как
  // во-первых, 3 должно быть достаточно
  // во-вторых, при экспорте h3 становится h5
  if (level > 3) {
    return new ErrorTag('div', "Заголовок " + token.title + " слишком глубоко вложен (более чем 3 уровня)");
  }

  var headers = this.options.metadata.headers;

  if (headers.length === 0 && level != 1) {
    return new ErrorTag('div', "Первый заголовок должен иметь уровень 1, а не " + level);
  }

  if (headers.length > 0) {
    var prevLevel = headers[headers.length - 1].level;
    if (level > prevLevel + 1) {
      return new ErrorTag('div', "Некорректная вложенность заголовков (уровень " + level + " после " + prevLevel + ")");
    }
  }

  // проверить, нет ли уже заголовка с тем же названием
  // при фиксированном anchor к нему нельзя добавить -1 -2 -3
  // так что это ошибка
  if (token.anchor) {
    if (this.options.metadata.refs.has(token.anchor)) {
      return new ErrorTag('div', '[#' + token.anchor + '] уже существует');
    }
  }

  // Проверить якорь, при необходимости добавить anchor-1, anchor-2
  var anchor = token.anchor || makeAnchor(token.title);

  var headersAnchorMap = this.options.metadata.headersAnchorMap;

  if (headersAnchorMap.has(anchor)) {
    // если якорь использовался ранее, обычно к нему прибавляется номер,
    // но если он явно [#назначен] в заголовке - не имею права его менять, жёсткая ошибка
    if (token.anchor) {
      return new ErrorTag('div', '[#' + token.anchor + '] используется в другом заголовке');
    }
    // иначе просто добавляю -2, -3 ...
    headersAnchorMap.set(anchor, headersAnchorMap.has(anchor) + 1);
    anchor = anchor + '-' + headersAnchorMap.get(anchor);
  } else {
    headersAnchorMap.set(anchor, 1);
  }

  // получим HTML заголовка для метаданных
  var titleHtml = titleNode.toHtml({contextTypography: true}).trim();

  // ------- Ошибок точно нет, можно запоминать заголовок и reference ------

  headers.push({ level: level, title: titleHtml, anchor: anchor});

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
BodyParser.prototype.parseLink = function(token) {
  var href = token.href || token.title; // [http://ya.ru]() is fine
  var title = token.title; // [](http://ya.ru) is fine, but [](#test) - see below

  var protocol = href.replace(/[\x00-\x20]/g, '').match(HREF_PROTOCOL_REG);
  if (protocol) {
    protocol = protocol[1].trim();
  }

  var titleParsed = new BodyParser(title, this.options).parse();

  // external link goes "as is"
  if (protocol) {
    if (!this.trusted && !~["http", "ftp", "https", "mailto"].indexOf(protocol.toLowerCase())) {
      return new ErrorTag("span", "Protocol " + protocol + " is not allowed");
    }

    return new CompositeTag("a", titleParsed, {href: href});
  }

  if (href[0] == '/') {
    // absolute link with title goes "as is", without title - we'll try to resolve the title on 2nd pass
    if (!title) {
      return new ReferenceNode(href, titleParsed);
    }
    return new CompositeTag("a", titleParsed, {href: href});
  }

  if (href[0] == '#') { // Reference, need second pass to resolve it
    return new ReferenceNode(href, titleParsed);
  }

  // relative link
  return new ErrorTag("span", "относительные ссылки могут быть легко ломаться, используйте #метки или абсолютные URL вместо " + href);
};

/*
 BodyParser.prototype.parseLink = function(token) {
 var href = token.href || token.title; // [http://ya.ru]() is fine
 var title = token.title || token.href; // [](http://ya.ru) is fine too

 var protocol = href.replace(/[\x00-\x20]/g, '').match(HREF_PROTOCOL_REG);
 if (protocol) {
 protocol = protocol[1].trim();
 }

 var titleParsed = new BodyParser(title, this.options).parse();

 // external link goes "as is"
 if (protocol) {
 if (!this.trusted && !~["http", "ftp", "https", "mailto"].indexOf(protocol.toLowerCase())) {
 return new ErrorTag("span", "Протокол " + protocol + " не разрешён");
 }

 return new CompositeTag("a", titleParsed, {href: href});
 }

 if (href[0] == '/' || href[0] == '#') {
 return new CompositeTag("a", titleParsed, {href: href});
 }

 // relative link
 if (this.options.resourceWebRoot) {
 var resolver = new SrcResolver(href, this.options);
 return new CompositeTag("a", titleParsed, {href: resolver.getWebPath()});
 } else {
 return new ErrorTag("span", "относительная ссылка в материале без точного URL: " + href);
 }
 };
 */
BodyParser.prototype.parseBbtag = function(token) {
  return new BbtagParser(token, this.options).parse();
};

BodyParser.prototype.parseBold = function(token) {
  return new BodyParser(token.body, this.options).parseAndWrap("strong");
};

BodyParser.prototype.parseItalic = function(token) {
  var parser = new BodyParser(token.body, this.options);
  return parser.parseAndWrap("em");
};

BodyParser.prototype.parseStrike = function(token) {
  var parser = new BodyParser(token.body, this.options);
  return parser.parseAndWrap("strike");
};

BodyParser.prototype.parseCode = function(token) {
  return new EscapedTag("code", token.body);
};

BodyParser.prototype.parseComment = function(token) {
  return new CommentNode(token.body);
};

BodyParser.prototype.parseVerbatim = function(token) {
  return new VerbatimText(token.body);
};
