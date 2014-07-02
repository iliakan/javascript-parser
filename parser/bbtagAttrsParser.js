const Parser = require('./parser').Parser;
const util = require('util');
const BbtagAttrsLexer = require('./bbtagAttrsLexer').BbtagAttrsLexer;

function BbtagAttrsParser(attrs, options) {
  Parser.call(this, options);
  this.lexer = new BbtagAttrsLexer(attrs);
}
util.inherits(BbtagAttrsParser, Parser);

BbtagAttrsParser.prototype.parse = function() {

  var attrsObject = {};

  while (!this.lexer.isEof()) {
    // try to find:
    //   name=value
    // ^
    var name = this.lexer.consumeName();
    if (!name) {
      this.lexer.consumeChar();
      continue;
    }

    // found name:
    //   name=value
    //       ^
    var eq = this.lexer.consumeEq();
    if (!eq) {
      // found name w/o value:
      //   name
      //       ^
      attrsObject[name.body] = true;
      continue;
    }

    // found name=:
    //   name=value
    //        ^
    var value = this.lexer.consumeValue();
    if (!value) { // name= without value?
      attrsObject[name.body + '='] = true;
      continue;
    }

    attrsObject[name.body] = value.body;
  }

  return attrsObject;
};

exports.BbtagAttrsParser = BbtagAttrsParser;