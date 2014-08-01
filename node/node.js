
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

Node.prototype.toStructure = function(options) {
  var structure = {type: this.getType()};
  if (this.trusted !== undefined && !(options && options.skipTrusted)) {
    structure.trusted = this.trusted;
  }
  return structure;
};

Node.prototype.toString = function() {
  return JSON.stringify(this.toStructure());
};

Node.prototype.toHtml = function(options) {
  throw new Error("Basic node should not be instantiated and used");
};

Node.prototype.isTrusted = function() {
  return this.trusted !== undefined ? this.trusted :
    this.parent ? this.parent.isTrusted() : undefined;
};

Node.prototype.ensureKnowTrusted = function() {
  if (this.isTrusted() === undefined) {
    throw new Error("Must know .trusted");
  }
};

module.exports = Node;
