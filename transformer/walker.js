const CompositeTag = require('../node/compositeTag').CompositeTag;

function Walker(roots, options) {
  if (roots.length === undefined) roots = [roots];
  this.roots = roots; // node or array
  this.trusted = options.trusted;
}


Walker.prototype.walk = function() {
  var wrapper = new CompositeTag(null, this.roots);
  return this.visitWithChildren(wrapper);
};

Walker.prototype.visitWithChildren = function(node) {
  var shouldWeStop = this.visit(node);

  if (!shouldWeStop && node instanceof CompositeTag) {
    var children = node.getChildren();
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      this.visitWithChildren(child);
    }
  }
};

Walker.prototype.visit = function(node) {
  /* override me */
};

exports.Walker = Walker;