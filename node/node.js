
function Node() {
}

Node.prototype.getType = function() {
  return "Node";
};

// requires external processing, cannot be transformed
Node.prototype.isExternal = function() {
  return false;
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

module.exports = Node;
