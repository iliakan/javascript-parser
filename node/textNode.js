var Node = require('./node');
var inherits = require('inherits');

function TextNode(text) {
  Node.call(this);
  this.text = text;
}
inherits(TextNode, Node);

TextNode.prototype.getType = function() {
  return "TextNode";
};

TextNode.prototype.toStructure = function(options) {
  var structure = Node.prototype.toStructure.call(this, options);
  structure.text = this.text;
  return structure;
};

TextNode.prototype.toHtml = function() {
  return this.text;
};

module.exports = TextNode;
