// circular require BodyParser <- BbtagParser <- BodyParser
// when I require BodyParser it will get the unfinished export
// that's why I assign it here, before require('./bbtagParser')
exports.BodyParser = BodyParser;

const Parser = require('./parser').Parser;
const BbtagParser = require('./bbtagParser').BbtagParser;
const BodyLexer = require('./bodylexer').BodyLexer;
const util = require('util');
const TextNode = require('../node/textNode').TextNode;
const TagNode = require('../node/tagNode').TagNode;
const EscapedTag = require('../node/escapedTag').EscapedTag;
const ErrorTag = require('../node/errorTag').ErrorTag;
const CommentNode = require('../node/commentNode').CommentNode;
const UnresolvedLinkNode = require('../node/unresolvedLinkNode').UnresolvedLinkNode;
const HeaderTag = require('../node/headerTag').HeaderTag;
const VerbatimText = require('../node/verbatimText').VerbatimText;
const HREF_PROTOCOL_REG = require('../consts').HREF_PROTOCOL_REG;

/**
 * Parser creates node objects from general text.
 * Node attrs will *not* be checked by sanitizers, they can contain anything like `onclick=`
 * This provides maximal freedom to the parser.
 *
 * Parser knows about current trust mode, so it must make sure that these attributes are safe.
 *
 * @constructor
 */
function BodyParser(text, options) {
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
        var type = node.getType();

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

 // return null;

  var token = null;
  // perf optimization for most chars
  switch(this.lexer.getChar()) {
  case '[':
    token = this.lexer.consumeLink()
      || this.lexer.consumeBbtagSelfClose()
      || this.lexer.consumeBbtagNeedClose();
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

  console.log(token.type);
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
  return new HeaderTag(token.level, yield new BodyParser(token.title, this.subOpts()).parse());
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
  var href = token.href;
  var title = token.title;

  var protocol = HREF_PROTOCOL_REG.match(href);
  if (protocol) {
    protocol = protocol[1].trim();
  }

  // external link goes "as is"
  if (protocol) {
    if (!this.trusted && !~["http", "ftp", "https", "mailto"].indexOf(protocol.toLowerCase())) {
      return new ErrorTag("span", "Protocol " + protocol + " is not allowed");
    }

    return new TagNode("a", title, {href: href});
  }

  // absolute link - goes "as is"
  if (href[0] == '/') {
    return new TagNode("a", title, {href: href});
  }

  // relative link, need second pass to resolve it
  return new UnresolvedLinkNode(href, title);
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
