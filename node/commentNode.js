var util = require('util');
var TextNode = require('./textNode');
var inherits = require('inherits');

function CommentNode() {
  TextNode.apply(this, arguments);
}
inherits(CommentNode, TextNode);

CommentNode.prototype.getType = function() {
  return "CommentNode";
};

module.exports = CommentNode;
