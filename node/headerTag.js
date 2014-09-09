var CompositeTag = require('./compositeTag');
var inherits = require('inherits');

/**
 * HeaderTag comes from # HEADERS
 * I store title unparsed here, for transliteration
 * (fixme: not sure that title is really needed. I could strip-tags from html'ized children instead)
 */
function HeaderTag(level, anchor, children, attrs) {

  if (typeof level != "number") {
    throw new Error("Level must be a number");
  }

  if (typeof anchor != "string") {
    throw new Error("Anchor must be a string");
  }

  if (!anchor) {
    throw new Error("Anchor must not be empty!");
  }

  this.level = level;
  this.anchor = anchor;

  // in toHtml we make <h2><a> ... children ...</a></h2>
  // see                   ^^^
  // so there's no use to assign something like 'h'+level as a tag here,
  // we put children into <a> anyway, so we must not use tag here
  CompositeTag.call(this, null, children, attrs);
}
inherits(HeaderTag, CompositeTag);

HeaderTag.prototype.getType = function() {
  return 'HeaderTag';
};

HeaderTag.prototype.toHtml = function(options) {
  var headerContent = CompositeTag.prototype.toHtml.call(this, options);
  return '<h' + this.level + '>' + headerContent + '</h' + this.level + '>';
};

//
//HeaderTag.prototype.toHtml = function(options) {
//  var headerContent = CompositeTag.prototype.toHtml.call(this, options);
//  var anchor = this.anchor;
//
//  return '<h' + this.level + '><a name="' + anchor + '" href="#' + anchor + '">' +
//    headerContent +
//    '</a></h' + this.level + '>';
//};
//

module.exports = HeaderTag;
