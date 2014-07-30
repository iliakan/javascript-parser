var inherits = require('inherits');
var Node = require('./node');

function CutNode() {
  Node.apply(this, arguments);
}
inherits(CutNode, Node);

CutNode.prototype.getType = function() {
  return "CutNode";
};

module.exports = CutNode;
