const TagNode = require('../node/tagNode').TagNode;
const TextNode = require('../node/textNode').TextNode;
const CompositeTag = require('../node/compositeTag').CompositeTag;

function StructureTransformer(roots) {
  if (roots.length === undefined) roots = [roots];
  this.roots = roots; // node or array
}

StructureTransformer.prototype.toStructure = function() {

  return this.roots.map(function(root) {
    return this.toStructureNode(root);
  }, this);

};

StructureTransformer.prototype.toStructureNode = function(node) {
  var type = node.getType();
  var structure = {type: type};

  if (node instanceof TextNode) {
    if (node.text) structure.text = node.text;
  }

  if (node instanceof TagNode) {
    structure.tag = node.tag;
    if (Object.keys(node.attrs).length) {
      structure.attrs = node.attrs;
    }
  }

  if (node instanceof CompositeTag) {
    delete structure.text;
    structure.children = node.getChildren().map(function(child) {
      return this.toStructureNode(child);
    }, this);
  }

  return structure;
};

exports.StructureTransformer = StructureTransformer;
