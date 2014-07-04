const Node = require('./node').Node;
const util = require('util');

/**
 * UnresolvedLinkNode is an unresolved link
 * It should be transformed to TagNode when all [ref]'s are ready
 */
function UnresolvedLinkNode(href, title, options) {
  if (typeof href != "string" || typeof title != 'string') {
    throw new Error("Link and title must be strings");
  }

  Node.call(this, options);
}
util.inherits(UnresolvedLinkNode, Node);

UnresolvedLinkNode.prototype.getType = function() {
  return 'UnresolvedLinkNode';
};

exports.UnresolvedLinkNode = UnresolvedLinkNode;

/*
часть трансформации
 var protocol = consts.HREF_PROTOCOL_REGEXP.match(href);
 if (protocol) {
 protocol = protocol[1].trim();
 }

 // external link goes "as is"
 if (protocol) {
 if (!this.trusted && !~["http", "ftp", "https", "mailto"].indexOf(protocol.toLowerCase())) {
 return new ErrorTag("span", "Protocol " + protocol + " is not allowed");
 }

 return new TagNode("a", title, {href: href});
 }

 // absolute link - goes "as is"
 if (href[0] == '/') {
 return new TagNode("a", title, {href: href});
 }

 */