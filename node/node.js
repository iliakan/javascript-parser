
function Node() {
}

Node.prototype.getType = function() {
  return "Node";
};


Node.prototype.index = function() {
  if (!this.parent) return -1;
  return this.parent.getChildren().indexOf(this);
};

Node.prototype.toStructure = function() {
  return {type: this.getType()};
};

Node.prototype.toString = function() {
  return JSON.stringify(this.toStructure());
};

exports.Node = Node;