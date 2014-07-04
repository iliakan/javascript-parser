const TextNode = require('./textNode').TextNode;
const util = require('util');
const charTypography = require('../typography/charTypography');

var htmlUtil = require('../util/htmlUtil');


// Consistent tag
// fixes/sanitizes its content
function TagNode(tag, text, attrs) {
  if (typeof text != "string") {
    throw new Error("Text must be string");
  }

  TextNode.call(this, text);
  this.tag = tag.toLowerCase();
  this.attrs = attrs || {};
}
util.inherits(TagNode, TextNode);

TagNode.prototype.getType = function() {
  return "TagNode";
};

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


TagNode.prototype.wrapTagAround = function(html) {
  var result = "<" + this.tag;

  for(var name in this.attrs) {
    name = htmlUtil.escapeHtmlAttr(name);
    var value = htmlUtil.escapeHtmlAttr(this.attrs[name]);
    result += name + '="' + value +'"';
  }

  result += '>' + html + '</' + this.tag + '>';
  return result;
};

exports.TagNode = TagNode;