const util = require('util');
const Node = require('./node').Node;

/** this was meant to store "metadata", but probably not needed
 * some nodes like [refs] contribute to metadata AND to text, so can't be MetaNodes
 * */
function TaskNode(slug) {
  Node.call(this);
  this.slug = slug;
}
util.inherits(TaskNode, Node);

TaskNode.prototype.isExternal = function() {
  return true;
};

TaskNode.prototype.getType = function() {
  return "TaskNode";
};

exports.TaskNode = TaskNode;