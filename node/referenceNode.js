const CompositeTag = require('./compositeTag').CompositeTag;
const util = require('util');

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
util.inherits(ReferenceNode, CompositeTag);

ReferenceNode.prototype.getType = function() {
  return 'ReferenceNode';
};

exports.ReferenceNode = ReferenceNode;

