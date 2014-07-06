
function Node() {
}

Node.prototype.getType = function() {
  return "Node";
};


Node.prototype.index = function() {
  if (!this.parent) return -1;
  return this.parent.getChildren().indexOf(this);
};

exports.Node = Node;