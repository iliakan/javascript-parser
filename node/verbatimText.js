var inherits = require('inherits');
var TextNode = require('./textNode');
var sanitize = require('../util/sanitize');

// Текст, который нужно вернуть без обработки вложенных тегов,
// в виде профильтрованного HTML
function VerbatimText() {
  TextNode.apply(this, arguments);
}
inherits(VerbatimText, TextNode);

VerbatimText.prototype.getType = function() {
  return "VerbatimText";
};

VerbatimText.prototype.toHtml = function(options) {
  this.ensureKnowTrusted();

  var html = this.text;
  if (!this.isTrusted()) {
    html = sanitize(html);
  }
  return html;
};

module.exports = VerbatimText;

