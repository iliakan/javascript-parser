const TextNode = require('./textNode').TextNode;
const util = require('util');

function TagNode(tag, text, attrs) {
  if (typeof text != "string") {
    throw new Error("Text must be string");
  }

  TextNode.call(this, text);
  this.tag = tag && tag.toLowerCase();
  this.attrs = attrs || {};
}
util.inherits(TagNode, TextNode);

TagNode.prototype.getType = function() {
  return "TagNode";
};

TagNode.prototype.toStructure = function() {
  var structure = TextNode.prototype.toStructure.call(this);
  structure.tag = this.tag;
  if (Object.keys(this.attrs).length) {
    structure.attrs = this.attrs;
  }
  return structure;
};

exports.TagNode = TagNode;