var TagNode = require('./tagNode');
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

module.exports = EscapedTag;
