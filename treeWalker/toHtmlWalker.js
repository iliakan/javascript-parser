const TagNode = require('../node/tagNode').TagNode;
const TextNode = require('../node/textNode').TextNode;
const NO_WRAP_TAGS_SET = require('../consts').NO_WRAP_TAGS_SET;
const CompositeTag = require('../node/compositeTag').CompositeTag;
const charTypography = require('../typography/charTypography');
const escapeHtmlAttr = require('../util/htmlUtil').escapeHtmlAttr;
const escapeHtmlText = require('../util/htmlUtil').escapeHtmlText;
const sanitize = require('../util/htmlUtil').sanitize;

function ToHtmlWalker(roots, options) {
  if (roots.length === undefined) roots = [roots];
  this.roots = roots; // node or array
  this.trusted = options.trusted;
}


ToHtmlWalker.prototype.toHtml = function() {
  return this.transformNode(new CompositeTag(null, this.roots));
};

ToHtmlWalker.prototype.transformArray = function(nodes) {
  var labels = {};
  var html = '';

  if (nodes )

  nodes.forEach(function(node) {
    var nodeHtml = this.transformNode(node);
    html += nodeHtml;
  }, this);

  return html;
};

ToHtmlWalker.prototype.transform = function(node) {
  var type = node.getType();
  var method = this['transform' + type[0].toUpperCase() + type.slice(1)];

  if (!method) {
    throw new Error("Unknown node type: " + type);
  }

  return method.call(this, node);
};

ToHtmlWalker.prototype.transformCutNode = function(node) {
  return  "";
};

ToHtmlWalker.prototype.transformNode = function(node) {
  throw new Error("Basic node should not be instantiated and used");
};

ToHtmlWalker.prototype.transformCommentNode = function(node) {
  return  "<!--" + node.text + "-->";
};

ToHtmlWalker.prototype.transformErrorTag = function(node) {
  return this.transformTag(node);
};

ToHtmlWalker.prototype.transformEscapedTag = function(node) {
  var html = escapeHtmlText(node.text);
  html = this.wrapTagAround(node.tag, node.attrs, html);
  return html;
};

ToHtmlWalker.transformUnresolvedLinkNode = function(node) {
  throw new Error("Cannot transform: this node must have been preprocessed and transformed to TagNode");
};

ToHtmlWalker.transformVerbatimText = function(node) {
  var html = node.text;
  if (!this.trusted) {
    html = sanitize(html);
  }
  return html;
};

ToHtmlWalker.prototype.transformCompositeTag = function(node) {
  var labels = {};
  var html = '';
  var children = node.getChildren();
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var childHtml = this.transformNode(child);
    if (node.getType() != 'text') {
      var label = this.makeLabel();
      labels[label] = childHtml;
      if (NO_WRAP_TAGS_SET[node.tag]) {
        childHtml = "<div>LABEL:" + label + "</div>";
      } else {
        childHtml = "<span>LABEL:" + label + "</span>";
      }
    }
    html += childHtml;
  }

  html = this.formatHtml(html);
  html = this.replaceLabels(html, labels);

  if (node.tag) {
    html = this.wrapTagAround(node, html);
  }

  return html;
};

ToHtmlWalker.prototype.transformTagNode = function(node) {
  var html = this.formatHtml(node.text);
  html = this.wrapTagAround(node.tag, node.attrs, html);
  return html;
};

ToHtmlWalker.prototype.transformTextNode = function(node) {
  return node.text;
};

ToHtmlWalker.prototype.makeLabel = function() {
  return (+(Math.random() + '').slice(2)).toString(36);
};

ToHtmlWalker.prototype.replaceLabels = function(html, labels) {
  var pattern = /<span>LABEL:(\w+)<\/span>|<div>LABEL:(\w+)<\/div>/g;

  return html.replace(pattern, function(match, p1, p2) {
    var label = p1 || p2;
    var content = labels[label];
    delete labels[label];
    return content;
  });
};

ToHtmlWalker.prototype.formatHtml = function(html) {
  html = charTypography(html);

  if (!this.trusted) {
    html = sanitize(html);
  }

  return html;
};


ToHtmlWalker.prototype.wrapTagAround = function(tag, attrs, html) {
  var result = "<" + tag;

  for(var name in attrs) {
    name = escapeHtmlAttr(name);
    var value = escapeHtmlAttr(node.attrs[name]);
    result += name + '="' + value +'"';
  }

  result += '>';

  if (tag != 'iframe' && tag != 'img') {
    result += html + '</' + tag + '>';
  }
  return result;
};

exports.ToHtmlWalker = ToHtmlWalker;
