const TextNode = require('./textNode').TextNode;
const util = require('util');
const charTypography = require('../typography/charTypography');

var htmlUtil = require('../htmlUtil');


// Consistent tag
// fixes/sanitizes its content
function TagNode(tag, text, attrs, options) {
  if (typeof text != "string") {
    throw new Error("Text must be string");
  }

  TextNode.call(this, text, options);
  this.tag = tag.toLowerCase();
  this.attrs = attrs || {};
}
util.inherits(TagNode, TextNode);

TagNode.prototype.selfAppliedTypography = function() {
  return true;
};

TagNode.prototype.toHtml = function() {
  var html = this.formatHtml(this.text);
  html = this.wrapTagAround(html);
  return html;
};

TagNode.prototype.formatHtml = function(html) {
  html = charTypography(html);

  if (!this.isTrusted()) {
    html = htmlUtil.sanitize(html);
  }

  return html;
};

TagNode.prototype.toStructure = function() {
  var structure = TextNode.prototype.toStructure.apply(this, arguments);
  structure.tag = this.tag;
};

TagNode.prototype.wrapTagAround = function(html) {
  var result = "<" + this.tag;

  for(var name in this.attrs) {
    name = (name == "className") ? "class" : htmlUtil.escapeHtmlAttr(name);
    var value = htmlUtil.escapeHtmlAttr(this.attrs[name]);
    result += name + '="' + value +'"';
  }

  result += '>' + html + '</' + this.tag + '>';
  return result;
};

exports.TagNode = TagNode;