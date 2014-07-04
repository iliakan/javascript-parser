const util = require('util');
const TagNode = require('./tagNode').TagNode;

function ErrorTag(tag, text) {
  TagNode.call(this, tag, text, {'class': 'format_error'});
}
util.inherits(ErrorTag, TagNode);

ErrorTag.prototype.getType = function() {
  return "ErrorTag";
};

exports.ErrorTag = ErrorTag;