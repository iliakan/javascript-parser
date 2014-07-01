const util = require('util');
const TagNode = require('./tagNode').TagNode;
const htmlUtil = require('../htmlUtil');

// Тег, содержимое которого нужно полностью заэкранировать
// Все теги внутри эскейпятся, так что вложенный HTML заведомо безопасен
function EscapedTag() {
  TagNode.call(this, arguments);
}
util.inherits(ErrorTag, TagNode);

EscapedTag.prototype.getType = function() {
  return "escaped";
};

EscapedTag.prototype.toHtml = function() {
  var html = htmlUtil.escapeHtmlText(this.text);
  html = this.wrapTagAround(html);
  return html;
};
exports.EscapedTag = EscapedTag;
