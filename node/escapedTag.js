const util = require('util');
const TagNode = require('./tagNode').TagNode;
const htmlUtil = require('../util/htmlUtil');

// Тег, содержимое которого нужно полностью заэкранировать
// Все теги внутри эскейпятся, так что вложенный HTML заведомо безопасен
function EscapedTag() {
  TagNode.call(this, arguments);
}
util.inherits(EscapedTag, TagNode);

EscapedTag.prototype.getType = function() {
  return "EscapedTag";
};

exports.EscapedTag = EscapedTag;
