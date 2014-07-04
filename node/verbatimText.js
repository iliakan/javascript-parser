const util = require('util');
const TextNode = require('./textNode').TextNode;
const htmlUtil = require('../util/htmlUtil');

// Текст, который нужно вернуть без обработки вложенных тегов,
// в виде профильтрованного HTML
function VerbatimText() {
  TextNode.apply(this, arguments);
}
util.inherits(VerbatimText, TextNode);

VerbatimText.prototype.getType = function() {
  return "VerbatimText";
};

exports.VerbatimText = VerbatimText;

