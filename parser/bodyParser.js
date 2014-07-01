const TextParser = require('./textParser').TextParser;
const util = require('util');
const TextNode = require('../node/textNode').TextNode;
const consts = require('../consts');

/**
 * Parser is built with raw string analysis, not using regexps,
 * because at the time of writing /y flag was not supported.
 * In other words, one can't test a match at the current position only,
 * RegExp will go on and return nearest match (event if it's not needed).
 * That would lead to slowness.
 *
 * A workaround would be to user ^regexps and take substring tails, but substrings in V8 are slow
 * also they may eat same memory as the original string and actually there's no need in copying things around.
 *
 * Methods consume* return the object with an element and shift this.position
 * Methods peek* try to find a match at the current position, w/o this.position change
 * Methods find* try to find an element on the nearest position, w/o this.position change
 * @constructor
 */
function BodyParser() {
  TextParser.apply(this, arguments);
}
util.inherits(BodyParser, TextParser);


BodyParser.prototype.consumeCode = function() {
  if (this.text[this.position] != '`') return;
  var position = this.position + 1;

  var endPosition = this.findCharNoNewline('`', position);
  if (endPosition === null) return null;

  this.position = endPosition + 1;
  return {
    code: this.text.slice(position, endPosition)
  };
};

BodyParser.prototype.consumeComment = function() {
  var commentStartPosition = this.peekString('<!--', this.position);
  if (commentStartPosition === null) return null;

  var commentEndSegment = this.findString('-->', commentStartPosition + 1);
  if (commentEndSegment === null) return null;

  this.position = commentEndSegment.end + 1;
  return {
    comment: this.text.slice(commentStartPosition + 1, commentEndSegment.start)
  };
};

/**
 * Matches <script>....</script>
 * This function is not perfect.
 *
 * Html can be like this (valid):
 *   <script attr="</script>"> alert(1); </script>
 * It will match
 *   <script attr="</script>
 *
 * The matching can be improved later if needed.
 *
 * Because of the imprecise matching,
 * this method should *not* be used for any safety tests or sanitizing
 */
BodyParser.prototype.consumeVerbatimTag = function() {
  if (this.text[this.position] != '<') return;

  var startPosition = this.position;
  // found:
  //   <
  //    ^
  var position = startPosition + 1;

  for (var i = 0; i < consts.VERBATIM_TAGS.length; i++) {
    var tagName = consts.VERBATIM_TAGS[i];
    var tagNamePosition = this.peekWord(tagName, position, true);
    if (tagNamePosition !== null) break;
  }
  if (tagNamePosition === null) return null;

  // found:
  //   <script
  //         ^

  var closingString = '</' + tagName + '>';

  var closingStringSegment = this.findString(closingString, tagNamePosition + 1, true);
  if (closingStringSegment == null) return null;

  this.position = closingStringSegment.end + 1;

  return {
    verbatim: this.text.slice(startPosition, closingStringSegment.end + 1)
  };
};

BodyParser.prototype.consumeBoldItalic = function() {
  if (this.text[this.position] != '*') return;

  var prevChar = this.text[this.position - 1];
  switch (prevChar) {
  case undefined: // it was the first position
  case ' ':
  case '\n':
  case '\t':
  case '>':
  case '"':
  case "'":
    break; // allow match after these chars
  default:
    return null; // no match after other chars
  }

  var mode = '*'; // italic?
  var position = this.position + 1;
  if (this.text[position] == '*') { // bold?
    mode = '**';
    position++;
  }
  // position is after * or after **

  // testing:
  // **\S
  //   ^
  if (this.isWhiteSpace(this.text[position])) { // must be **\S
    return null;
  }

  // look for nearest star except after a space
  // **blabla*
  //         ^
  var starPosition = position;
  while (true) {
    starPosition = this.findCharNoNewline('*', starPosition);
    if (starPosition === null) return null;

    // ignore stars * after space
    if (this.isWhiteSpace(this.text[starPosition - 1])) {
      starPosition++;
    } else {
      break;
    }
  }

  starPosition++;

  // look for one more star:
  // **blabla**
  //          ^
  if (mode == '**') {
    if (this.text[starPosition] == '*') {
      // found:
      // **blabla**
      //          ^
      this.position = starPosition + 1;
      return {
        bold: this.text.slice(position, starPosition - 1)
      };
    } else {
      // found:
      // **blabla*X
      //          ^
      this.position = starPosition;

      return {
        // step back, found italic
        italic: this.text.slice(position - 1, starPosition)
      }

    }
  } else {
    // found:
    // *blabla*
    //         ^
    this.position = starPosition;
    return {
      italic: this.text.slice(position, starPosition - 1)
    };
  }

};


BodyParser.prototype.consumeLink = function() {
  if (this.text[this.position] != '[') return null;
  var startPosition = this.position;
  var position = startPosition + 1;
  var titleSegment, hrefSegment;

  // match ["..."] or ['...'] or [....]
  var quotedPos = this.peekQuotedString(position);
  if (quotedPos !== null) {
    titleSegment = {start: startPosition + 1, end: quotedPos + 1};
    position = quotedPos;
    if (this.text[++position] != ']') return null;
  } else {
    position = this.findCharNoNewline(']', position);
    if (position === null) return null;
    titleSegment = {start: startPosition + 1, end: position};
  }

  position++;

  // match ("....") or ('....') or (...)
  if (this.text[position] != '(') return null;
  position++;
  var startPosition2 = position;
  var quotedPos = this.peekQuotedString(position);
  if (quotedPos !== null) {
    hrefSegment = {start: startPosition2, end: quotedPos + 1};
    position = quotedPos;
    if (this.text[++position] != ')') return null;
  } else {

    outer:
      while (position < this.text.length) {
        switch (this.text[position]) {
        case "\n":
        case " ":
        case "\t":
          return null; // not allowed in (...) unless in quotes
        case ")":
          break outer;
        }
        position++;
      }

    if (this.text[position] != ')') {
      return null;
    }

    hrefSegment = {start: startPosition2, end: position};
  }

  this.position = position + 1;

  return {
    href:  this.stripQuotes(this.text.slice(hrefSegment.start, hrefSegment.end)),
    title: this.stripQuotes(this.text.slice(titleSegment.start, titleSegment.end))
  };
};


BodyParser.prototype.consumeBbtagSelfClose = function() {
  if (this.text[this.position] != '[') return null;

  var startPosition = this.position;
  var position = startPosition + 1;

  var bbtagName, bbtagAttrsSegment;

  // match [tagName
  for (var i = 0; i < consts.BBTAGS_SELF_CLOSE.length; i++) {
    bbtagName = consts.BBTAGS_SELF_CLOSE[i];
    var bbtagNamePosition = this.peekWord(bbtagName, position);
    if (bbtagNamePosition !== null) break;
  }
  if (bbtagNamePosition === null) return null;

  position = bbtagNamePosition + 1;

  // read attrs up to ]
  var bbtagAttrsPosition = this.peekBbtagAttrs(position);
  if (bbtagAttrsPosition === null) return null;
  bbtagAttrsSegment = {start: position, end: bbtagAttrsPosition};

  this.position = bbtagAttrsPosition + 1;

  return {
    bbtagName:  bbtagName,
    bbtagAttrs: this.text.slice(bbtagAttrsSegment.start, bbtagAttrsSegment.end),
  };

};

BodyParser.prototype.consumeBbtagNeedClose = function() {
  if (this.text[this.position] != '[') return null;

  var startPosition = this.position;
  var position = startPosition + 1;

  var bbtagName, bbtagAttrsSegment;

  // match [tagName
  for (var i = 0; i < consts.BBTAGS_NEED_CLOSE.length; i++) {
    bbtagName = consts.BBTAGS_NEED_CLOSE[i];
    var bbtagNamePosition = this.peekWord(bbtagName, position);
    if (bbtagNamePosition !== null) break;
  }
  if (bbtagNamePosition === null) return null;

  position = bbtagNamePosition + 1;

  // read attrs up to ]
  var bbtagAttrsPosition = this.peekBbtagAttrs(position);
  if (bbtagAttrsPosition === null) return null;

  if (this.text[bbtagAttrsPosition - 1] == '/') {
    // closed "in-place"
    bbtagAttrsSegment = {start: position, end: bbtagAttrsPosition - 1};
    this.position = bbtagAttrsPosition + 1;
    return {
      bbtagName:  bbtagName,
      bbtagAttrs: this.text.slice(bbtagAttrsSegment.start, bbtagAttrsSegment.end),
      bbtagBody:  ''
    };
  }

  bbtagAttrsSegment = {start: position, end: bbtagAttrsPosition};
  position = bbtagAttrsPosition + 1;

  // look for [/closing]

  var closingString = '[/' + bbtagName + ']';
  var closingPositionSegment = this.findString(closingString, position);
  if (closingPositionSegment == null) return null;

  this.position = closingPositionSegment.end + 1;
  return {
    bbtagName:  bbtagName,
    bbtagAttrs: this.text.slice(bbtagAttrsSegment.start, bbtagAttrsSegment.end),
    bbtagBody:  this.text.slice(position, closingPositionSegment.start)
  };

};


/**
 * Takes optionally quoted "string" or 'string'
 * Strips quotes from ends && replaces \char -> char
 *
 * Can be easily modified to allow \n, but no one needs it right now
 */
BodyParser.prototype.stripQuotes = function(string) {
  if (string[0] == '"' && string[string.length - 1] == '"') {
    return string.slice(1, -1).replace(/\\(.)/g, '$1');
  }
  if (string[0] == "'" && string[string.length - 1] == "'") {
    return string.slice(1, -1).replace(/\\(.)/g, '$1');
  }

  return string;
};

/**
 * match string at current position
 */
BodyParser.prototype.peekString = function(string, startPosition, noCase) {
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
BodyParser.prototype.peekWord = function(string, startPosition, noCase) {
  var position = this.peekString(string, startPosition, noCase);
  if (!position) return null;

  var nextCharCode = this.text.charCodeAt(position + 1);
  if (
    nextCharCode >= 0x61 && nextCharCode <= 0x7A || // a..z
    nextCharCode >= 0x41 && nextCharCode <= 0x5A || // A..Z
    nextCharCode == 0x2d // -
    ) {
    return null; // wordly char follows, no match
  }
  return position;
};

/**
 * match one of strings in array at current position
 */
BodyParser.prototype.peekStringOneOf = function(array, startPosition, noCase) {
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
BodyParser.prototype.peekBbtagAttrs = function(startPosition) {
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
 * Find string, return segment
 */
BodyParser.prototype.findString = function(string, startPosition, latinNoCase) {
  var position = startPosition;
  while (position < this.text.length) {
    var endPosition = this.peekString(string, position, latinNoCase);
    if (endPosition !== null) {
      return {
        start: position, end: endPosition
      };
    }
    position++;
  }
  return null;
};


/**
 * Find char while looking for attrs
 * Limited by attrs length and newline
 */
BodyParser.prototype.findCharNoNewline = function(char, startPosition) {
  var position = startPosition;
  while (position < this.text.length && this.text[position] != char) {
    if (this.text[position] == "\n") return null; // no \n in attrs allowed
    position++;
  }

  return (this.text[position] == char) ? position : null;
};


/**
 * Find nearest character
 */
BodyParser.prototype.findChar = function(char, startPosition) {
  var position = startPosition;
  while (position < this.text.length && this.text[position] != char) {
    position++;
  }

  return (this.text[position] == char) ? position : null;
};

/**
 * Find "string" or 'string' on current position
 * \n is not allowed inside quotes
 * \" and \' (or \anything) is allowed inside quotes
 */
BodyParser.prototype.peekQuotedString = function(startPosition) {
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

BodyParser.prototype.isEof = function() {
  return this.position === this.text.length;
};

// 4 times faster than /\s/.test(char)
BodyParser.prototype.isWhiteSpace = function(char) {
  switch (char) {
  case ' ':
  case '\n':
  case '\t':
    return true;
  default:
    return false;
  }
};


/**
 * Run the search with n^2 complexity
 * For every [ it will seek ]
 * n times + n-1 times + n-2 times + ... = n(n+1)/2 times
 * @param times
 */
BodyParser.rapeMe = function(times) {
  var str = new Array(times + 1).join('[');
  var parser = new BodyParser(str);
  parser.consumeLink();
};

exports.BodyParser = BodyParser;

BodyParser.rapeMe(1000000);