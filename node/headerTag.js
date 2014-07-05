const CompositeTag = require('./compositeTag').CompositeTag;
const util = require('util');

/**
 * HeaderTag comes from # HEADERS
 * I store title unparsed here, for transliteration
 * (fixme: not sure that title is really needed. I could strip-tags from html'ized children instead)
 */
function HeaderTag(level, title, children, attrs) {
  if (typeof level != "number") {
    throw new Error("Level must be  a number");
  }
  if (typeof title != 'string') {
    throw new Error("Title must be a string");

  }
  this.level = level;
  this.title = title;

  // in toHtmlWalker we make <h2><a> ... children ...</a></h2>
  // see                         ^^^
  // so there's no use to assign something like 'h'+level as a tag here,
  // we put children into <a> anyway
  CompositeTag.call(this, new Array(level+1).join('#'), children, attrs);
}
util.inherits(HeaderTag, CompositeTag);

HeaderTag.prototype.getType = function() {
  return 'HeaderTag';
};

exports.HeaderTag = HeaderTag;
