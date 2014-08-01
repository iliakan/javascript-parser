var inherits = require('inherits');
var TagNode = require('./tagNode');

function ErrorTag(tag, text) {
  TagNode.call(this, tag, text, {'class': 'format_error'});
}
inherits(ErrorTag, TagNode);

ErrorTag.prototype.getType = function() {
  return "ErrorTag";
};

module.exports = ErrorTag;
