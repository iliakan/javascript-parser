const util = require('util');
const TagNode = require('./tagNode').TagNode;

function ErrorTag(tag, text) {
  TagNode.call(this, tag, text, {className: 'format_error'}, {});
}
util.inherits(ErrorTag, TagNode);

ErrorTag.prototype.getType = function() {
  return "error";
};

exports.ErrorTag = ErrorTag;