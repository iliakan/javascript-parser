var inherits = require('inherits');
var consts = require('../consts');

var FAILURE_FIND_STRING = 'FAILURE_FIND_STRING';
var FAILURE_FIND_STRING_NO_CASE = 'FAILURE_FIND_STRING_NO_CASE';
var FAILURE_FIND_CHAR = 'FAILURE_FIND_CHAR';
var FAILURE_FIND_CHAR_NO_NEWLINE = 'FAILURE_FIND_CHAR_NO_NEWLINE';

/**
 * Lexer knows how to consume tokens.
 * Parser must call BodyLexer's methods to search right tokens in right context.
 *
 * The BodyLexer is built with raw string analysis, not using regexps,
 * because at the time of writing /y flag was not supported.
 * In other words, one can't test a match at the current position only,
 * RegExp will go on and return nearest match (event if it's not needed).
 * That would lead to slowness.
 *
 * A workaround would be to user ^regexps and take substring tails, but substrings in V8 are slow
 * also they may eat same memory as the original string and actually there's no need in copying things around.
 *
 * Besides that, raw strings are faster and allow more control.
 *
 * Methods consume* return the object with an token and shift this.position
 * Methods peek* try to find a match at the current position, w/o this.position change
 * Methods find* try to find a match at the nearest position, w/o this.position change
 *
 * @constructor
 */
function Lexer(text) {
  this.text = text;
  this.length = text.length;
  this.position = 0;

  // all failures are remembered not to search the same twice
  // helps to evade n^2 complexity in simple cases like [[[[[[[[[[[[[[ & consumeLink()
  // format:
  //   failures[function][string] = {start: ..., end: }
  // if the next search starts between "start" & "end"-stringLength, it fails instantly

  this.failures = {};
  this.failures[FAILURE_FIND_STRING] = {};
  this.failures[FAILURE_FIND_STRING_NO_CASE] = {};
  this.failures[FAILURE_FIND_CHAR] = {};
  this.failures[FAILURE_FIND_CHAR_NO_NEWLINE] = {};
}

/**
 * Takes optionally quoted "string" or 'string'
 * Strips quotes from ends && replaces \char -> char
 *
 * Can be easily modified to allow \n, but no one needs it right now
 */
Lexer.prototype.stripQuotes = function(string) {
  if (string[0] == '"' && string[string.length - 1] == '"') {
    return string.slice(1, -1).replace(/\\(.)/g, '$1');
  }
  if (string[0] == "'" && string[string.length - 1] == "'") {
    return string.slice(1, -1).replace(/\\(.)/g, '$1');
  }

  return string;
};

Lexer.prototype.getChar = function() {
  return this.text[this.position];
};

/**
 * match string at current position
 */
Lexer.prototype.peekString = function(string, startPosition, noCase) {
  var i = 0;
  if (noCase) {
    string = string.toLowerCase();
  }

  while (i < string.length) {
    var char = this.text[startPosition + i];
    if (noCase) char = char.toLowerCase();
    if (char !== string[i]) return null;
    i++;
  }
  return startPosition + i - 1;
};

/**
 * match string at current position not followed by a wordly char
 */
Lexer.prototype.peekWord = function(string, startPosition, noCase) {
  var position = this.peekString(string, startPosition, noCase);
  if (!position) return null;

  if (this.isWordlyCode(this.text.charCodeAt(position + 1))) {
    return null; // wordly char follows, no match
  }
  return position;
};


/**
 * Every consume* shifts this.position and puts old position to this.prevPosition
 * Here I return the last consumed text
 */
Lexer.prototype.getLastConsumedText = function() {
  return this.text.slice(this.prevPosition, this.position);
};

Lexer.prototype.setPosition = function(newPosition) {
  this.prevPosition = this.position;
  this.position = newPosition;
};

/**
 * match one of strings in array at current position
 */
Lexer.prototype.peekStringOneOf = function(array, startPosition, noCase) {
  for (var i = 0; i < array.length; i++) {
    var string = array[i];
    var position = this.peekString(string, startPosition, noCase);
    if (position !== null) return position;
  }

  return null;
};


/**
 * match "quoted strings" or 'squoted strings' or chars (ex:\n) up to ]
 */
Lexer.prototype.peekBbtagAttrs = function(startPosition) {
  var position = startPosition;

  while (position < this.text.length) {
    if (this.text[position] === "\n") return null; // no \n in attrs are allowed
    if (this.text[position] === ']') return position;

    var quotedPos = this.peekQuotedString(position);
    if (quotedPos !== null) {
      position = quotedPos + 1;
    } else {
      position++;
    }
  }

  return null;
};

/**
 * Returns true if position is exactly after \n or first in text
 */
Lexer.prototype.atLineStart = function(position) {
  return position === 0 || this.text[position - 1] === '\n';
};

/**
 * Returns true is position is exactly at \n or maybe after spaces \s*?\n or at end of text \s*$
 */
Lexer.prototype.atLineEndTrim = function(position) {
  while(position < this.text.length) {
    if (this.text[position] == "\n") return true;

    if (this.isWhiteSpaceCode(this.text.charCodeAt(position))) {
      position++; // try next
    } else {
      return false;
    }

  }

  // end of text, counts as line end too
  return true;
};


/**
 * Find string, return segment
 */
Lexer.prototype.findString = function(string, startPosition, noCase) {
  var position = startPosition;

  var failure = this.failures[noCase ? FAILURE_FIND_STRING : FAILURE_FIND_STRING_NO_CASE][string];
  if (failure && position >= failure.start && position <= failure.end - string.length) {
    // the search from this position will fail for same reasons as it failed for the earlier position
    return null;
  }

  while (position < this.text.length) {
    var endPosition = this.peekString(string, position, noCase);
    if (endPosition !== null) {
      return {
        start: position, end: endPosition
      };
    }
    position++;
  }

  // failed to match from startPosition :(
  this.failures[noCase ? FAILURE_FIND_STRING : FAILURE_FIND_STRING_NO_CASE][string] = {
    start: startPosition,
    end: position
  };

  return null;
};


/**
 * Find char while looking for attrs
 * Limited by attrs length and newline
 */
Lexer.prototype.findCharNoNewline = function(char, startPosition) {
  var position = startPosition;
  var failure = this.failures[FAILURE_FIND_CHAR_NO_NEWLINE][char];
  if (failure && position >= failure.start && position <= failure.end) {
    return null;
  }

  while (position < this.length) {
    switch(this.text[position]) {
    case char:
      return position;
    case "\n":
      this.failures[FAILURE_FIND_CHAR_NO_NEWLINE][char] = {
        start: startPosition,
        end: position
      };
      return null;
    }
    position++;
  }

  // failed to find char up to position
  this.failures[FAILURE_FIND_CHAR_NO_NEWLINE][char] = {
    start: startPosition,
    end: position
  };

  return null;
};


/**
 * Find nearest character
 */
Lexer.prototype.findChar = function(char, startPosition) {
  var position = startPosition;
  var failure = this.failures[FAILURE_FIND_CHAR][char];
  if (failure && position >= failure.start && position <= failure.end) {
    return null;
  }

  while (position < this.text.length) {
    if (this.text[position] == char) {
      return position;
    }
    position++;
  }

  this.failures[FAILURE_FIND_CHAR][char] = {
    start: startPosition,
    end: position
  };
  return null;
};

/**
 * Find "string" or 'string' on current position
 * \n is not allowed inside quotes
 * \" and \' (or \anything) is allowed inside quotes
 */
Lexer.prototype.peekQuotedString = function(startPosition) {
  var position = startPosition;

  var quote = this.text[position];
  if (quote != '"' && quote != "'") return null;
  position++;

  while (position < this.text.length && this.text[position] != quote) {
    if (this.text[position] == "\n") return null; // no \n allowed in quotes
    position += (this.text[position] == '\\') ? 2 : 1;
  }

  return this.text[position] == quote ? position : null;
};

Lexer.prototype.isEof = function() {
  if (this.position > this.text.length) {
    console.log(this.text);
    throw new Error("Position out of text: " + this.position + " / " + this.text.length);
  }
  return this.position === this.text.length;
};

// 4 times faster than /\s/.test(char)
// same as [ \n\t]
Lexer.prototype.isWhiteSpaceCode = function(charCode) {
  switch (charCode) {
  case 0x20:
  case 0x0A:
  case 0x09:
    return true;
  default:
    return false;
  }
};

// same as [\w-]
Lexer.prototype.isWordlyCode = function(charCode) {
  return charCode >= 0x61 && charCode <= 0x7A || // a..z
    charCode >= 0x41 && charCode <= 0x5A || // A..Z
    charCode >= 0x30 && charCode <= 0x39 || // 0..9
    charCode == 0x2d || // -
    charCode == 0x5f; // _
};

module.exports = Lexer;
