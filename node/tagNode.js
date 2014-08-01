var TextNode = require('./textNode');
var inherits = require('inherits');
var sanitize = require('../util/sanitize');
var wrapTagAround = require('../util/wrapTagAround');
var charTypography = require('../typography/charTypography');

function TagNode(tag, text, attrs) {
  if (typeof text != "string") {
    throw new Error("Text must be string");
  }

  TextNode.call(this, text);
  this.tag = tag && tag.toLowerCase();
  this.attrs = attrs || {};
}
inherits(TagNode, TextNode);

TagNode.prototype.getType = function() {
  return "TagNode";
};

TagNode.prototype.toStructure = function(options) {
  var structure = TextNode.prototype.toStructure.call(this, options);
  structure.tag = this.tag;
  if (Object.keys(this.attrs).length) {
    structure.attrs = this.attrs;
  }
  return structure;
};


TagNode.prototype.formatHtml = function(html) {
  html = charTypography(html);

  this.ensureKnowTrusted();

  if (!this.isTrusted()) {
    html = sanitize(html);
  }

  return html;
};

TagNode.prototype.toHtml = function(options) {
  var html = this.formatHtml(this.text);
  html = wrapTagAround(this.tag, this.attrs, html);
  return html;
};

module.exports = TagNode;
