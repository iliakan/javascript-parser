var CompositeTag = require('../node/compositeTag');

/**
 * Takes single root node, not array of nodes, because it may need to transform on top-level
 * @param root
 * @constructor
 */
function TreeWalkerSync(root) {
  this.root = root; // node or array
}

TreeWalkerSync.prototype.walk = function(visitCallback) {
  this.visitWithChildren(this.root, visitCallback);
};

TreeWalkerSync.prototype.visitWithChildren = function(node, visitCallback) {

  var replacementNode = visitCallback(node);

  if (replacementNode) {
    node.parent.replaceChild(replacementNode, node);
    node = replacementNode;
  }

  if (node instanceof CompositeTag) {
    var children = node.getChildren();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      this.visitWithChildren(child, visitCallback);
    }
  }
};

module.exports = TreeWalkerSync;
