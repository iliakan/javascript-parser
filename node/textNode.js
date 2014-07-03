const Node = require('./node').Node;
const util = require('util');

//var htmlUtil = require('lib/htmlUtil');

function TextNode(text) {
  Node.call(this);
  this.text = text;
}
util.inherits(TextNode, Node);

TextNode.prototype.getType = function() {
  return "text";
};

TextNode.prototype.selfAppliedTypography = function() {
  return false;
};

TextNode.prototype.toHtml = function() {
  return this.text;
};


exports.TextNode = TextNode;