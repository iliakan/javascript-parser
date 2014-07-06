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

exports.TextNode = TextNode;