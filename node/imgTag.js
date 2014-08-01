var TagNode = require('./tagNode');
var inherits = require('inherits');

function ImgTag(attrs, isFigure) {
  TagNode.call(this, "img", "", attrs);
  this.isFigure = isFigure;
}
inherits(ImgTag, TagNode);

ImgTag.prototype.getType = function() {
  return "ImgTag";
};

ImgTag.prototype.toHtml = function(options) {

  var html = TagNode.prototype.toHtml.call(this, options);
  if (this.isFigure) {
    html = '<figure>' + html + '</figure>';
  }

  return html;

};

module.exports = ImgTag;
