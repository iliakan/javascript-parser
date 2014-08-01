var TagNode = require('../node/tagNode');
var TextNode = require('../node/textNode');
var NO_WRAP_TAGS_SET = require('../consts').NO_WRAP_TAGS_SET;
var CompositeTag = require('../node/compositeTag');
var charTypography = require('../typography/charTypography');
var contextTypography = require('../typography/contextTypography');
var escapeHtmlAttr = require('../util/escapeHtmlAttr');
var escapeHtmlText = require('../util/escapeHtmlText');
var sanitize = require('../util/sanitize');
var transliterate = require('../util/transliterate');
var stripIndents = require('../util/source/stripIndents');
var extractHighlight = require('../util/source/extractHighlight');


function HtmlTransformer(root, options) {
  this.root = root; // node or array
  this.trusted = options.trusted;
  this.noContextTypography = options.noContextTypography;
}


HtmlTransformer.prototype.run = function() {
  var result = this.transform(this.root);
  if (!this.noContextTypography) {
    result = contextTypography(result);
  }
  return result;
};


module.exports = HtmlTransformer;
