const Node = require('./node').Node;
const TextNode = require('./textNode').TextNode;
const TagNode = require('./tagNode').TagNode;
const util = require('util');
const NO_WRAP_TAGS_SET = require('../consts').NO_WRAP_TAGS_SET;

var htmlUtil = require('../util/htmlUtil');

function CompositeTag(tag, children, attrs) {
  if (tag !== null && typeof tag != 'string') {
    throw new Error("Tag must be either null or a string");
  }
  if (children.slice === undefined) {
    throw new Error("Children must be array or array-like");
  }

  TagNode.call(this, tag, '', attrs);
  this._children = [];
  this.appendChildren(children);
}
util.inherits(CompositeTag, TagNode);

CompositeTag.prototype.getType = function() {
  return "CompositeTag";
};

/**
 * запрещёна модификация через @children, чтобы быть уверенными,
 * что все операции изменения детей идут через методы объекта,
 * которые ставят новым детям parent
 * кроме того, дубликат нужен для перемещения в новый узел (@see node_spec "Node moves children")
 */
CompositeTag.prototype.getChildren = function() {
  return this._children.slice();
};

CompositeTag.prototype.hasChildren = function() {
  return this._children.length > 0;
};

CompositeTag.prototype.appendChildren = function(children) {
  for (var i = 0; i < children.length; i++) {
    this.appendChild(children[i]);
  }
};

CompositeTag.prototype.appendChild = function(child) {
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

CompositeTag.prototype.replaceChild = function(newChild, oldChild) {
  var oldChildIdx = this._children.indexOf(oldChild);
  if (oldChildIdx == -1) {
    throw new Error("Cannot replace: oldChild does not exist");
  }

  this.adoptChild(newChild);
  this._children.splice(oldChildIdx, 1, newChild);
  oldChild.parent = null;
};

CompositeTag.prototype.insertBefore = function(child, ref) {
  var refIdx = this._children.indexOf(ref);
  if (refIdx == -1) {
    throw new Error("Cannot insert: ref is not among children");
  }
  this.adoptChild(child);
  this._children.splice(refIdx, 0, child);
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

exports.CompositeTag = CompositeTag;