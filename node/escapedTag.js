var TagNode = require('./tagNode');
var escapeHtmlText = require('../util/escapeHtmlText');
var wrapTagAround = require('../util/wrapTagAround');
var inherits = require('inherits');

// Тег, содержимое которого нужно полностью заэкранировать
// Все теги внутри эскейпятся, так что вложенный HTML заведомо безопасен
function EscapedTag() {
  TagNode.apply(this, arguments);
}
inherits(EscapedTag, TagNode);

EscapedTag.prototype.getType = function() {
  return "EscapedTag";
};

EscapedTag.prototype.toHtml = function(options) {
  var html = escapeHtmlText(this.text);
  html = wrapTagAround(this.tag, this.attrs, html);
  return html;
};

module.exports = EscapedTag;
