var inherits = require('inherits');
var consts = require('../consts');
var Lexer = require('./lexer');

function BodyLexer(text) {
  Lexer.apply(this, arguments);
}
inherits(BodyLexer, Lexer);

Lexer.prototype.consumeCode = function() {
  if (this.text[this.position] != '`') return null;
  if (this.isWhiteSpaceCode(this.text.charCodeAt(this.position + 1))) return null;

  var startPosition = this.position + 1;
  var position = startPosition;
  // found
  // `\S
  //  ^

  var endPosition;
  while (true) {
    endPosition = this.findCharNoNewline('`', position);
    if (endPosition === null) return null;
    if (this.isWhiteSpaceCode(this.text.charCodeAt(endPosition - 1))) { // skip \s`, search more, for \S`
      position = endPosition + 1;
    } else {
      break;
    }
  }

  if (startPosition == endPosition) {
    // found ``, ignore it
    return null;
  }

  // found
  // `\S...\S`
  //         ^

  this.setPosition(endPosition + 1);
  return {
    type: 'code',
    body: this.text.slice(startPosition, endPosition)
  };
};

Lexer.prototype.consumeComment = function() {
  var commentStartPosition = this.peekString('<!--', this.position);
  if (commentStartPosition === null) return null;

  var commentEndSegment = this.findString('-->', commentStartPosition + 1);
  if (commentEndSegment === null) return null;

  this.setPosition(commentEndSegment.end + 1);
  return {
    type: 'comment',
    body: this.text.slice(commentStartPosition + 1, commentEndSegment.start)
  };
};

/**
 * Matches <script>....</script>
 * This function does not exactly follow the spec
 * @see http://www.w3.org/TR/html-markup/syntax.html#syntax-attribute-value
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
Lexer.prototype.consumeVerbatimTag = function() {
  if (this.text[this.position] != '<') return null;

  var startPosition = this.position;
  // found:
  //   <
  //    ^
  var position = startPosition + 1;

  var tagName, tagNamePosition;
  for (var i = 0; i < consts.VERBATIM_TAGS.length; i++) {
    tagName = consts.VERBATIM_TAGS[i];
    tagNamePosition = this.peekWord(tagName, position, true);
    if (tagNamePosition !== null) break;
  }
  if (tagNamePosition === null) return null;

  // found:
  //   <script
  //         ^

  var closingString = '</' + tagName + '>';

  var closingStringSegment = this.findString(closingString, tagNamePosition + 1, true);
  if (closingStringSegment === null) return null;

  this.position = closingStringSegment.end + 1;

  return {
    type: 'verbatim',
    body: this.text.slice(startPosition, closingStringSegment.end + 1)
  };
};

Lexer.prototype.consumeImg = function() {
  if (this.text[this.position] != '<') return null;

  var startPosition = this.position;
  // found:
  //   <
  //    ^
  var position = startPosition + 1;

  var tagNamePosition = this.peekWord('img', position, true);
  if (tagNamePosition === null) return null;

  position = tagNamePosition + 1;
  // found:
  //   <img
  //      ^
  var closingPosition = this.findChar('>', position);
  if (closingPosition === null) return null;

  // found:
  //   <img  >
  //         ^


  var isFigure = this.atLineStart(startPosition) && this.atLineEndTrim(closingPosition + 1);


  this.setPosition(closingPosition + 1);

  return {
    type:     'bbtag',
    name:     'img',
    attrs:    this.text.slice(
        tagNamePosition + 1,
      (this.text[closingPosition - 1] == '/') ? closingPosition - 1 : closingPosition
    ),
    isFigure: isFigure,
    body:     ''
  };

};


Lexer.prototype.consumeBold = function() {
  if (this.text[this.position] != '*') return null;
  if (this.text[this.position + 1] != '*') return null;

  var prevChar = this.text[this.position - 1];
  switch (prevChar) {
  case undefined: // it was the first position
  case ' ':
  case '\n':
  case '\t':
  case '>':
//  case '"': fixme: why need this?
//  case "'": fixme: why need this?
    break; // allow match after these chars
  default:
    return null; // no match after other chars
  }

  var position = this.position + 2;
  // position is after **

  // testing:
  // **\S
  //   ^
  if (this.isWhiteSpaceCode(this.text.charCodeAt(position))) { // must be **\S
    return null;
  }

  // look for nearest star except after a space
  // **blabla**
  //         ^
  var starPosition = position;
  while (true) {
    starPosition = this.findCharNoNewline('*', starPosition);
    if (starPosition === null) return null;

    if (this.isWhiteSpaceCode(this.text.charCodeAt(starPosition - 1))) {
      starPosition++;
      continue;
    }

    if (this.text[starPosition + 1] != '*' || starPosition == position + 1) {
      starPosition++;
      continue;
    }

    // ignore stars followed by a wordly char
    if (this.isWordlyCode(this.text.charCodeAt(starPosition + 2)) ||
      this.text[starPosition + 2] == '*') {
      starPosition++;
      continue;
    }

    break;

  }


  // found the nearest star except after a space followed by another start and then not wordly char
  // **blabla**
  //         ^
  this.setPosition(starPosition + 2);

  return {
    type: 'bold',
    body: this.text.slice(position, starPosition)
  };

};


Lexer.prototype.consumeItalic = function() {
  if (this.text[this.position] != '*') return null;

  var prevChar = this.text[this.position - 1];
  switch (prevChar) {
  case undefined: // it was the first position
  case ' ':
  case '\n':
  case '\t':
  case '>':
    break; // allow match after these chars
  default:
    return null; // no match after other chars
  }

  var position = this.position + 1;
  // position is after *

  // testing:
  // *\S
  //  ^
  if (this.isWhiteSpaceCode(this.text.charCodeAt(position))) { // must be **\S
    return null;
  }

  // look for nearest star except after a space
  // *blabla*
  //        ^
  var starPosition = position;
  while (true) {
    starPosition = this.findCharNoNewline('*', starPosition);
    if (starPosition === null) return null;

    // ignore after space
    if (this.isWhiteSpaceCode(this.text.charCodeAt(starPosition - 1))) {
      starPosition++;
      continue;
    }

    // ignore stars followed by a wordly char
    if (this.isWordlyCode(this.text.charCodeAt(starPosition + 1)) ||
      this.text[starPosition + 1] == '*') {
      starPosition++;
      continue;
    }

    if (starPosition == position) {
      starPosition++;
      continue;
    }

    break;
  }

  this.setPosition(starPosition + 1);

  return {
    type: 'italic',
    body: this.text.slice(position, starPosition)
  };

};


Lexer.prototype.consumeItalic = function() {
  return this.consumeCharEmphasis('*', 'italic');
};

Lexer.prototype.consumeStrike = function() {
  return this.consumeCharEmphasis('~', 'strike');
};


Lexer.prototype.consumeCharEmphasis = function(star, type) {
  if (this.text[this.position] != star) return null;

  var prevChar = this.text[this.position - 1];
  switch (prevChar) {
  case undefined: // it was the first position
  case ' ':
  case '\n':
  case '\t':
  case '>':
    break; // allow match after these chars
  default:
    return null; // no match after other chars
  }

  var position = this.position + 1;
  // position is after *

  // testing:
  // *\S
  //  ^
  if (this.isWhiteSpaceCode(this.text.charCodeAt(position))) { // must be **\S
    return null;
  }

  // look for nearest star except after a space
  // *blabla*
  //        ^
  var starPosition = position;
  while (true) {
    starPosition = this.findCharNoNewline(star, starPosition);
    if (starPosition === null) return null;

    // ignore after space
    if (this.isWhiteSpaceCode(this.text.charCodeAt(starPosition - 1))) {
      starPosition++;
      continue;
    }

    // ignore stars followed by a wordly char
    if (this.isWordlyCode(this.text.charCodeAt(starPosition + 1)) ||
      this.text[starPosition + 1] == star) {
      starPosition++;
      continue;
    }

    if (starPosition == position) {
      starPosition++;
      continue;
    }

    break;
  }

  this.setPosition(starPosition + 1);

  return {
    type: type,
    body: this.text.slice(position, starPosition)
  };

};


Lexer.prototype.consumeHeader = function() {
  if (!this.atLineStart(this.position) || this.text[this.position] !== '#') {
    return null;
  }

  var startPosition = this.position;

  var position = startPosition;
  while (this.text[position] === '#') {
    position++;
  }

  var level = position - startPosition;

  var titlePosition = position;
  while (position < this.text.length) {
    if (this.text[position] == '\n') break;
    position++;
  }

  this.setPosition(position);

  var title = this.text.slice(titlePosition, position).trim();
  var anchor = "";
  title = title.replace(/\[#([\w-]+)\]\s*$/, function(match, p1) {
    anchor = p1;
    return '';
  }).trim();

  return {
    type:   'header',
    level:  level,
    anchor: anchor,
    title:  title
  };

};

Lexer.prototype.consumeLink = function() {
  if (this.text[this.position] !== '[') return null;
  var startPosition = this.position;
  var position = startPosition + 1;
  var titleSegment, hrefSegment, quotedPos;

  // match ["..."] or ['...'] or [....]
  quotedPos = this.peekQuotedString(position);
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
  quotedPos = this.peekQuotedString(position);
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

  var href = this.stripQuotes(this.text.slice(hrefSegment.start, hrefSegment.end));
  var title = this.stripQuotes(this.text.slice(titleSegment.start, titleSegment.end));

  if (!href && !title) return null;

  this.setPosition(position + 1);

  return {
    href:  href,
    title: title,
    type:  'link'
  };
};

Lexer.prototype.consumeChar = function() {
  return this.text[this.position++];
};


Lexer.prototype.consumeSource = function() {
  if (!this.atLineStart(this.position) || this.peekString('```', this.position) === null) return null;

  var position = this.position + 3;
  // found
  // ```
  //    ^

  var languagePositionStart = position;
  var languagePositionEnd = this.peekStringOneOf(consts.BBTAGS_SOURCE, languagePositionStart);

  if (languagePositionEnd === null) return null;

  languagePositionEnd++;
  position = languagePositionEnd;
  // found
  // ```js
  //      ^


  // skip spaces after language
  while (this.text[position] != '\n' && position < this.text.length) {
    if (!this.isWhiteSpaceCode(this.text.charCodeAt(position))) {
      return null;
    }
    position++;
  }
  if (position == this.text.length) return null;

  position++;
  // found
  // ```js  \n
  //
  // ^


  // get comment //+ run

  /* jshint -W084 */
  var attrsStartPosition, attrsEndPosition, p;
  if (attrsStartPosition = this.peekString('//+ ', position)) {
    attrsEndPosition = this.findChar('\n', attrsStartPosition);
    if (attrsEndPosition !== null) position = attrsEndPosition + 1;
  } else if (attrsStartPosition = this.peekString('#+ ', position)) {
    attrsEndPosition = this.findChar('\n', attrsStartPosition);
    if (attrsEndPosition !== null) position = attrsEndPosition + 1;
  } else if (attrsStartPosition = this.peekString('/*+ ', position)) {
    p = this.findChar('\n', attrsStartPosition);
    if (p !== null && this.text[p - 2] == '*' && this.text[p - 1] == '/') {
      attrsEndPosition = p - 2;
      position = p + 1;
    }
  } else if (attrsStartPosition = this.peekString('<!--+ ', position)) {
    p = this.findChar('\n', attrsStartPosition);
    if (p !== null && this.text[p - 3] == '-' && this.text[p - 2] == '-' && this.text[p - 1] == '>') {
      attrsEndPosition = p - 3;
      position = p + 1;
    }
  }
  if (attrsEndPosition) {
    attrsStartPosition++; // attributes actually start on the next char after `//+ `
  }


  // found
  // ```js
  // //+ run  (optionally)
  //
  // ^

  // now consume body
  var bodyStartPosition = position;
  while (position < this.text.length) {
    if (this.atLineStart(position) &&
      this.peekString('```', position) !== null &&
      ~["\n", undefined].indexOf(this.text[position+3])) { // newline or text end after ```
      break;
    }

    position++;
  }

  if (position == this.text.length) return null;


  // found
  // ```js
  // //+ run  (optionally)
  //   alert(1);
  // ```
  //    ^
  var bodyEndPosition = position - 1;

  // this may be end of text OR right after closing ```, at newline
  position = position + 3;

  // if not end of text, one more step to skip \n
  if (position < this.text.length) position++;

  this.setPosition(position);

  return {
    type:  'bbtag',
    name:  this.text.slice(languagePositionStart, languagePositionEnd),
    attrs: attrsEndPosition ? this.text.slice(attrsStartPosition, attrsEndPosition) : '',
    body:  this.text.slice(bodyStartPosition, bodyEndPosition)
  };

};

Lexer.prototype.consumeBbtagSelfClose = function() {
  if (this.text[this.position] != '[') return null;

  var startPosition = this.position;
  var position = startPosition + 1;

  var bbtagName, bbtagNamePosition, bbtagAttrsSegment;

  // match [tagName
  for (var i = 0; i < consts.BBTAGS_SELF_CLOSE.length; i++) {
    bbtagName = consts.BBTAGS_SELF_CLOSE[i];
    bbtagNamePosition = this.peekWord(bbtagName, position);
    if (bbtagNamePosition !== null) break;
  }
  if (bbtagNamePosition === null) return null;

  position = bbtagNamePosition + 1;

  // read attrs up to ]
  var bbtagAttrsPosition = this.peekBbtagAttrs(position);
  if (bbtagAttrsPosition === null) return null;
  bbtagAttrsSegment = {start: position, end: bbtagAttrsPosition};

  this.setPosition(bbtagAttrsPosition + 1);

  return {
    type:  'bbtag',
    name:  bbtagName,
    attrs: this.text.slice(bbtagAttrsSegment.start, bbtagAttrsSegment.end),
    body:  ''
  };

};

Lexer.prototype.consumeBbtagNeedClose = function() {
  if (this.text[this.position] != '[') return null;

  var startPosition = this.position;
  var position = startPosition + 1;

  var bbtagName, bbtagNamePosition, bbtagAttrsSegment;

  // match [tagName
  for (var i = 0; i < consts.BBTAGS_NEED_CLOSE.length; i++) {
    bbtagName = consts.BBTAGS_NEED_CLOSE[i];
    bbtagNamePosition = this.peekWord(bbtagName, position);
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
    this.setPosition(bbtagAttrsPosition + 1);
    return {
      type:  'bbtag',
      name:  bbtagName,
      attrs: this.text.slice(bbtagAttrsSegment.start, bbtagAttrsSegment.end),
      body:  ''
    };
  }

  bbtagAttrsSegment = {start: position, end: bbtagAttrsPosition};
  position = bbtagAttrsPosition + 1;

  // look for [/closing]

  var closingString = '[/' + bbtagName + ']';
  var closingPositionSegment = this.findString(closingString, position);
  if (closingPositionSegment === null) return null;

  this.setPosition(closingPositionSegment.end + 1);
  return {
    type:  'bbtag',
    name:  bbtagName,
    attrs: this.text.slice(bbtagAttrsSegment.start, bbtagAttrsSegment.end),
    body:  this.text.slice(position, closingPositionSegment.start)
  };

};

module.exports = BodyLexer;
