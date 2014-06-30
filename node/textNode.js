const Node = require('./node').Node;
const util = require('util');

//var htmlUtil = require('lib/htmlUtil');

function TextNode(text, options) {
  Node.call(this, options);
  this.text = text;
}
util.inherits(TextNode, Node);

TextNode.prototype.getType = function() {
  return "text";
};

TextNode.prototype.getClass = function() {
  return "TextNode";
};

TextNode.prototype.selfAppliedTypography = function() {
  return false;
};

TextNode.prototype.toHtml = function() {
  return this.text;
};

TextNode.prototype.toStructure = function(options) {
  var structure = Node.prototype.toStructure.call(this);
  structure.text = this.text;
  return structure;
};


exports.TextNode = TextNode;