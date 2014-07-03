const Parser = require('./parser').Parser;
const BodyLexer = require('./bodylexer').BodyLexer;
const util = require('util');
const TextNode = require('../node/textNode').TextNode;
const TagNode = require('../node/tagNode').TagNode;
const EscapedTag = require('../node/escapedTag').EscapedTag;
const ErrorTag = require('../node/errorTag').ErrorTag;
const UnresolvedLinkNode = require('../node/unresolvedLinkNode').UnresolvedLinkNode;

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
    throw new Error("Must have trusted option")
  }

};

//  Каждый вызов parse возвращает не узел, а массив узлов,
//  например [online] ... [/online] возвращает своё содержимое с учетом вложенных тегов
//  или пустой тег, если экспорт-режим
//  Это должен быть valid html
BodyParser.prototype.parse = function() {
  var buffer = '';
  var children = [];

  while(!this.lexer.isEof()) {

    var nodes = this.parseNodes();

    if (nodes && nodes.length === undefined) {
      nodes = [nodes];
    }

    if (!nodes) {
      nodes = [];
    }

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var type = node.getType();
      if (type == 'comment') {
        buffer += node.toHtml();
      } else if (type == 'text') {
        buffer += node.text;
      } else if (type == 'cut') {
        if (this.options.stopOnCut) {
          break;
        }
      } else {

        if (buffer) {
          children.push(new TextNode(buffer));
          buffer = "";
        }
        children.push(node);
      }

    }

    if (!nodes.length) {
      buffer += this.lexer.consumeChar();
    }

  }

  if (buffer) {
    children.push(new TextNode(buffer));
  }

  return children;
};


BodyParser.prototype.parseNodes = function() {

  var token = this.lexer.consumeLink() ||
    this.lexer.consumeBbtagSelfClose() ||
    this.lexer.consumeBbtagNeedClose() ||
    this.lexer.consumeCode() ||
    this.lexer.consumeBoldItalic() ||
    this.lexer.consumeComment() ||
    this.lexer.consumeVerbatimTag();

  if (token === null) return [];

  switch(token.type) {
  case 'link':
    return this.parseLink(token);
  case 'bold':
    return this.parseBold(token);
  case 'italic':
    return this.parseItalic(token);
  case 'code':
    return this.parseCode(token);
  case 'bbtag':
    return this.parseBbtag(token);
  default:
    throw new Error("Unknown token: " + util.inspect(token));
  }

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
  var href = token.href;
  var title = token.title;


  var protocol = HREF_PROTOCOL_REGEXP.match(href);
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
  return new BodyParser(token.body, this.subOpts()).parseAndWrap("em");
};

BodyParser.prototype.parseCode = function(token) {
  return new EscapedTag("code", token.body);
};

exports.BodyParser = BodyParser;