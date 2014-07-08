const CompositeTag = require('./compositeTag').CompositeTag;
const util = require('util');

/**
 * HeaderTag comes from # HEADERS
 * I store title unparsed here, for transliteration
 * (fixme: not sure that title is really needed. I could strip-tags from html'ized children instead)
 */
function HeaderTag(level, anchor, children, attrs) {
  if (typeof level != "number") {
    throw new Error("Level must be  a number");
  }
  this.level = level;
  this.anchor = anchor;

  // in toHtmlWalker we make <h2><a> ... children ...</a></h2>
  // see                         ^^^
  // so there's no use to assign something like 'h'+level as a tag here,
  // we put children into <a> anyway, so we must not use tag here
  CompositeTag.call(this, null, children, attrs);
}
util.inherits(HeaderTag, CompositeTag);

HeaderTag.prototype.getType = function() {
  return 'HeaderTag';
};

exports.HeaderTag = HeaderTag;
