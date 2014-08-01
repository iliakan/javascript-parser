var inherits = require('inherits');
var TagNode = require('./tagNode');

function ErrorTag(tag, text) {
  TagNode.call(this, tag, text, {'class': 'format_error'});
  this.trusted = true;
}
inherits(ErrorTag, TagNode);

ErrorTag.prototype.getType = function() {
  return "ErrorTag";
};

module.exports = ErrorTag;
