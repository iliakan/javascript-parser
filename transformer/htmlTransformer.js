const TagNode = require('../node/tagNode').TagNode;
const TextNode = require('../node/textNode').TextNode;
const NO_WRAP_TAGS_SET = require('../consts').NO_WRAP_TAGS_SET;
const CompositeTag = require('../node/compositeTag').CompositeTag;
const charTypography = require('../typography/charTypography');
const escapeHtmlAttr = require('../util/htmlUtil').escapeHtmlAttr;
const escapeHtmlText = require('../util/htmlUtil').escapeHtmlText;
const sanitize = require('../util/htmlUtil').sanitize;
const transliterate = require('../util/transliterate');

function HtmlTransformer(roots, options) {
  if (roots.length === undefined) roots = [roots];
  this.roots = roots; // node or array
  this.trusted = options.trusted;
}


HtmlTransformer.prototype.toHtml = function() {
  return this.transform(new CompositeTag(null, this.roots));
};

HtmlTransformer.prototype.transform = function(node) {
  var type = node.getType();
  var method = this['transform' + type[0].toUpperCase() + type.slice(1)];

  if (!method) {
    throw new Error("Unknown node type: " + type);
  }

  return method.call(this, node);
};

HtmlTransformer.prototype.transformCutNode = function(node) {
  return  "";
};

HtmlTransformer.prototype.transformHeaderTag = function(node) {
  var headerContent = this.transformCompositeTag(node);
  var anchor = this.makeHeaderAnchor(headerContent);

  return '<h' + node.level + '><a name="' + anchor + '" href="#' + anchor + '">' +
    headerContent +
    '</a></h' + node.level + '>';
};

HtmlTransformer.prototype.transformNode = function(node) {
  throw new Error("Basic node should not be instantiated and used");
};

HtmlTransformer.prototype.makeHeaderAnchor = function(headerContent) {
  var anchor = headerContent.trim()
    .replace(/<\/?[a-z].*?>/gim, '')  // strip tags, leave IE<7
    .replace(/[ \t\n!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]/g, '-') // пунктуация, пробелы -> дефис
    .replace(/[^a-zа-яё0-9-]/gi, '') // убрать любые символы, кроме [слов цифр дефиса])
    .replace(/-+/gi, '-') // слить дефисы вместе
    .replace(/^-|-$/g, '') // убрать дефисы с концов

  anchor = transliterate(anchor).toLowerCase();

  return anchor;
};

HtmlTransformer.prototype.transformCommentNode = function(node) {
  return  "<!--" + node.text + "-->";
};

HtmlTransformer.prototype.transformErrorTag = function(node) {
  return this.transformTagNode(node);
};

HtmlTransformer.prototype.transformEscapedTag = function(node) {
  var html = escapeHtmlText(node.text);
  html = this.wrapTagAround(node.tag, node.attrs, html);
  return html;
};

HtmlTransformer.transformUnresolvedLinkNode = function(node) {
  throw new Error("Cannot transform: this node must have been preprocessed and transformed to TagNode");
};

HtmlTransformer.transformVerbatimText = function(node) {
  var html = node.text;
  if (!this.trusted) {
    html = sanitize(html);
  }
  return html;
};

HtmlTransformer.prototype.transformCompositeTag = function(node) {
  var labels = {};
  var html = '';
  var children = node.getChildren();
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var childHtml = this.transform(child);
    if (child.getType() != 'text') {
      var label = this.makeLabel();
      labels[label] = childHtml;
      if (NO_WRAP_TAGS_SET[child.tag]) {
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
    html = this.wrapTagAround(node.tag, node.attrs, html);
  }

  return html;
};

HtmlTransformer.prototype.transformTagNode = function(node) {
  var html = this.formatHtml(node.text);
  html = this.wrapTagAround(node.tag, node.attrs, html);
  return html;
};

HtmlTransformer.prototype.transformTextNode = function(node) {
  return node.text;
};

HtmlTransformer.prototype.makeLabel = function() {
  return (+(Math.random() + '').slice(2)).toString(36);
};

HtmlTransformer.prototype.replaceLabels = function(html, labels) {
  var pattern = /<span>LABEL:(\w+)<\/span>|<div>LABEL:(\w+)<\/div>/g;

  return html.replace(pattern, function(match, p1, p2) {
    var label = p1 || p2;
    var content = labels[label];
    delete labels[label];
    return content;
  });
};

HtmlTransformer.prototype.formatHtml = function(html) {
  html = charTypography(html);
  if (!this.trusted) {
    html = sanitize(html);
  }

  return html;
};


HtmlTransformer.prototype.wrapTagAround = function(tag, attrs, html) {
  var result = "<" + tag;

  for (var name in attrs) {
    name = escapeHtmlAttr(name);
    var value = escapeHtmlAttr(attrs[name]);
    result += ' ' + name + '="' + value + '"';
  }

  result += '>';

  if (tag != 'iframe' && tag != 'img') {
    result += html + '</' + tag + '>';
  }
  return result;
};

exports.HtmlTransformer = HtmlTransformer;
