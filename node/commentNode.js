var TextNode = require('./textNode');
var inherits = require('inherits');

function CommentNode() {
  TextNode.apply(this, arguments);
}
inherits(CommentNode, TextNode);

CommentNode.prototype.getType = function() {
  return "CommentNode";
};

CommentNode.prototype.toHtml = function(options) {
  return  "<!--" + this.text + "-->";
};

module.exports = CommentNode;
