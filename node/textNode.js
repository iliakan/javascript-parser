const Node = require('./node').Node;
const util = require('util');

function TextNode(text) {
  Node.call(this);
  this.text = text;
}
util.inherits(TextNode, Node);

TextNode.prototype.getType = function() {
  return "TextNode";
};

TextNode.prototype.toStructure = function() {
  var structure = Node.prototype.toStructure.call(this);
  structure.text = this.text;
  return structure;
};

exports.TextNode = TextNode;