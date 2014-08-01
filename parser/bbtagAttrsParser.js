var Parser = require('./parser');
var inherits = require('inherits');
var BbtagAttrsLexer = require('./bbtagAttrsLexer');

function BbtagAttrsParser(attrs, options) {
  Parser.call(this, options);
  this.lexer = new BbtagAttrsLexer(attrs);
}
inherits(BbtagAttrsParser, Parser);

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
      attrsObject[name.body.toLowerCase()] = true;
      continue;
    }

    // found name=:
    //   name=value
    //        ^
    var value = this.lexer.consumeValue();
    if (!value) { // name= without value?
      attrsObject[name.body.toLowerCase() + '='] = true;
      continue;
    }

    attrsObject[name.body.toLowerCase()] = value.body;
  }

  return attrsObject;
};

module.exports = BbtagAttrsParser;
