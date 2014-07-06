const util = require('util');
const Node = require('./node').Node;

/** this was meant to store "metadata", but probably not needed
 * some nodes like [refs] contribute to metadata AND to text, so can't be MetaNodes
 * */
function MetaNode(metaType, metaInfo) {
  Node.call(this);
  this.metaType = metaType;
  this.metaInfo = metaInfo;
}
util.inherits(MetaNode, Node);

MetaNode.prototype.getType = function() {
  return "MetaNode";
};

exports.MetaNode = MetaNode;