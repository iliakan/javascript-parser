const Node = require('./node').Node;
const util = require('util');

/**
 * UnresolvedLinkNode is an unresolved link
 * It should be transformed to TagNode when all [ref]'s are ready
 */
function UnresolvedLinkNode(href, title, options) {
  if (typeof href != "string" || typeof title != 'string') {
    throw new Error("Link and title must be strings");
  }

  Node.call(this, options);
}
util.inherits(UnresolvedLinkNode, Node);

UnresolvedLinkNode.prototype.toHtml = function() {
  throw new Error("Cannot toHtml: This node must be transformed to TagNode");
};

UnresolvedLinkNode.prototype.getType = function() {
  return 'unresolvedLink';
};

exports.UnresolvedLinkNode = UnresolvedLinkNode;