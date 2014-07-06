const TextNode = require('./textNode').TextNode;
const util = require('util');

var htmlUtil = require('../util/htmlUtil');


// Consistent tag
// fixes/sanitizes its content
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

exports.TagNode = TagNode;