const util = require('util');
const TextNode = require('./textNode').TextNode;

function CommentNode() {
  TextNode.apply(this, arguments);
}
util.inherits(CommentNode, TextNode);

CommentNode.prototype.getType = function() {
  return "comment";
};

CommentNode.prototype.getClass = function() {
  return "CommentNode";
};

CommentNode.prototype.toHtml = function() {
  return "<!--" + this.text + "-->";
};
