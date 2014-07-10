const CompositeTag = require('../node/compositeTag').CompositeTag;

/**
 * Takes single root node, not array of nodes, because it may need to transform on top-level
 * @param root
 * @constructor
 */
function TreeWalker(root) {
  this.root = root; // node or array
}

TreeWalker.prototype.walk = function* (visitCallback) {
  if (!isGeneratorFunction(visitCallback)) {
    throw new Error("Walker must be generator");
  }

  yield this.visitWithChildren(this.root, visitCallback);
};

TreeWalker.prototype.visitWithChildren = function* (node, visitCallback) {

  var replacementNode = yield visitCallback(node);

  if (replacementNode) {
    node.parent.replaceChild(replacementNode, node);
    node = replacementNode;
  }

  if (node instanceof CompositeTag) {
    var children = node.getChildren();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      yield this.visitWithChildren(child, visitCallback);
    }
  }
};


function isGeneratorFunction(obj) {
  return obj && obj.constructor && 'GeneratorFunction' == obj.constructor.name;
}

exports.TreeWalker = TreeWalker;