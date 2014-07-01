const Node = require('./node').Node;
const TextNode = require('./textNode').TextNode;
const TagNode = require('./tagNode').TagNode;
const util = require('util');
const charTypography = require('../typography/charTypography');
const NO_WRAP_TAGS_SET = require('../consts').NO_WRAP_TAGS_SET;

var htmlUtil = require('../htmlUtil');

function CompositeTag(tag, children, attrs, options) {
  if (tag !== null && !Array.isArray(tag)) {
    throw new Error("Tag must not be array");
  }

  TagNode.call(this, tag, '', attrs, options);
  this._children = [];
  this.addChildren(children);
}
util.inherits(CompositeTag, TagNode);

/**
 * запрещёна модификация через @children, чтобы быть уверенными,
 * что все операции изменения детей идут через методы объекта,
 * которые ставят новым детям parent
 * кроме того, дубликат нужен для перемещения в новый узел (@see node_spec "Node moves children")
 */
CompositeTag.prototype.children = function() {
  return this._children.slice();
};

CompositeTag.prototype.hasChildren = function() {
  return this._children.length > 0;
};

CompositeTag.prototype.addChildren = function(children) {
  for (var i = 0; i < children.length; i++) {
    this.addChild(children[i]);
  }
};

CompositeTag.prototype.addChild = function(child) {
  this.adoptChild(child);
  this._children.push(child);
};

CompositeTag.prototype.adoptChildren = function(children) {
  for (var i = 0; i < children.length; i++) {
    this.adoptChild(children[i]);
  }
};

CompositeTag.prototype.adoptChild = function(child) {
  if (! (child instanceof Node)) {
    throw new Error("Not a node");
  }

  if (child.parent) {
    child.parent.removeChild(child);
  }

  child.parent = this;
};

CompositeTag.prototype.removeChild = function(child) {
  var idx = this._children.indexOf(child);
  if (idx == -1) return;

  child.parent = null;
  this._children.splice(idx, 1);
};

CompositeTag.prototype.prependChildren = function(children) {
  this.adoptChildren(children);
  this._children.unshift.apply(this._children, children);
};

CompositeTag.prototype.prependChild = function(child) {
  this.adoptChild(child);
  this._children.unshift(child);
};

CompositeTag.prototype.toStructure = function(options) {
  var structure = TagNode.prototype.toStructure.apply(this, arguments);
  delete structure.text;
  structure.children = this._children.map(function(child) {
    return child.toStructure(options);
  });
  return structure;
};

CompositeTag.prototype.toHtml = function() {
  var labels = {};
  var html = '';

  for (var i = 0; i < this._children.length; i++) {
    var node = this._children[i];
    var nodeHtml = node.toHtml();
    if (node.selfAppliedTypography()) {
      var label = htmlUtil.makeLabel();
      labels[label] = nodeHtml;
      if (NO_WRAP_TAGS_SET[this.tag]) {
        nodeHtml = "<div>LABEL:" + label + "</div>";
      } else {
        nodeHtml = "<span>LABEL:" + label + "</span>";
      }
    }
    html += nodeHtml;
  }

  html = this.formatHtml(html);
  html = htmlUtil.replaceLabels(html, labels);

  if (this.tag) {
    html = this.wrapTagAround(html);
  }

  return html;
};

exports.CompositeTag = CompositeTag;