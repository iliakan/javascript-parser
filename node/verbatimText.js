var inherits = require('inherits');
var TextNode = require('./textNode');

// Текст, который нужно вернуть без обработки вложенных тегов,
// в виде профильтрованного HTML
function VerbatimText() {
  TextNode.apply(this, arguments);
}
inherits(VerbatimText, TextNode);

VerbatimText.prototype.getType = function() {
  return "VerbatimText";
};

module.exports = VerbatimText;

