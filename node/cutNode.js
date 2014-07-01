const util = require('util');
const Node = require('./node').Node;

function CutNode() {
  Node.apply(this, arguments);
}
util.inherits(CutNode, Node);

CutNode.prototype.getType = function() {
  return "cut";
};

exports.CutNode = CutNode;