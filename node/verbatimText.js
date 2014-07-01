const util = require('util');
const TextNode = require('./textNode').TextNode;
const htmlUtil = require('../htmlUtil');

// Текст, который нужно вернуть без обработки вложенных тегов,
// в виде профильтрованного HTML
function VerbatimText() {
  TextNode.apply(this, arguments);
}
util.inherits(VerbatimText, TextNode);

VerbatimText.prototype.getType = function() {
  return "verbatim";
};

VerbatimText.prototype.selfAppliedTypography = function() {
  return true;
};

VerbatimText.prototype.toHtml = function() {
  var html = this.text;
  if (!this.isTrusted()) {
    html = htmlUtil.sanitize(html);
  }
  return html;
};

exports.VerbatimText = VerbatimText;

