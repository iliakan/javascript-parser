var inherits = require('inherits');
var consts = require('../consts');
var Lexer = require('./lexer');

function BbtagAttrsLexer(text) {
  Lexer.apply(this, arguments);
}
inherits(BbtagAttrsLexer, Lexer);

Lexer.prototype.consumeName = function() {
  var startPosition = this.position;

  var quotedPos = this.peekQuotedString(startPosition);
  if (quotedPos !== null) {
    this.position = quotedPos + 1;
    return {
      type: 'name',
      body: this.stripQuotes(this.text.slice(startPosition, this.position))
    };
  }

  var position = startPosition;
  while(position < this.text.length && this.isWordlyCode(this.text.charCodeAt(position))) {
    position++;
  }

  if (position == startPosition) return null;

  this.position = position;
  return {
    type: 'name',
    body: this.text.slice(startPosition, position)
  };

};

Lexer.prototype.consumeChar = function() {
  return this.text[this.position++];
};

Lexer.prototype.consumeEq = function() {
  if (this.text[this.position] == '=') {
    this.position++;
    return {
      type: 'eq'
    };
  }
  return null;
};

Lexer.prototype.consumeValue = function() {
  var startPosition = this.position;

  var quotedPos = this.peekQuotedString(startPosition);
  if (quotedPos !== null) {
    this.position = quotedPos + 1;
    return {
      type: 'value',
      body: this.stripQuotes(this.text.slice(startPosition, this.position))
    };
  }

  var position = startPosition;

  while (position < this.text.length && !this.isWhiteSpaceCode(this.text.charCodeAt(position))) {
    position++;
  }

  if (position == startPosition) {
    return null;
  }

  this.position = position;

  return {
    type: 'value',
    body: this.text.slice(startPosition, this.position)
  };
};


module.exports = BbtagAttrsLexer;
