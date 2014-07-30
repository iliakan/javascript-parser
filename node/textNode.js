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

TextNode.prototype.toStructure = function() {
  var structure = Node.prototype.toStructure.call(this);
  structure.text = this.text;
  return structure;
};

module.exports = TextNode;
