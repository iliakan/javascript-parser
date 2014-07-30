var CompositeTag = require('./compositeTag');
var inherits = require('inherits');

/**
 * ReferenceNode is an unresolved link
 * It should be transformed to TagNode when all [ref]'s are ready
 */
function ReferenceNode(ref, children) {
  if (typeof ref != "string") {
    throw new Error("Ref must be a string");
  }

  this.ref = ref;
  CompositeTag.call(this, "a", children);
}
inherits(ReferenceNode, CompositeTag);

ReferenceNode.prototype.getType = function() {
  return 'ReferenceNode';
};

ReferenceNode.prototype.isExternal = function() {
  return true;
};

module.exports = ReferenceNode;

