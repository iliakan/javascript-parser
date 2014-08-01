var EscapedTag = require('./escapedTag');
var inherits = require('inherits');
var stripIndents = require('../util/source/stripIndents');
var extractHighlight = require('../util/source/extractHighlight');
var escapeHtmlText = require('../util/escapeHtmlText');
var wrapTagAround = require('../util/wrapTagAround');

// Тег, содержимое которого нужно полностью заэкранировать
// Все теги внутри эскейпятся, так что вложенный HTML заведомо безопасен
function SourceTag(name, text, src, params) {
  EscapedTag.call(this, 'pre', text);
  this.name = name;
  this.src = src;
  this.params = params;
}
inherits(SourceTag, EscapedTag);

SourceTag.prototype.getType = function() {
  return "SourceTag";
};

SourceTag.prototype.isExternal = function() {
  return this.src && !this.isLoaded;
};

SourceTag.prototype.setTextFromSrc = function(text) {
  this.text = text;
  this.isLoaded = true;
};

// on this stage the tag either contains this.src OR the resolved text
SourceTag.prototype.toHtml = function(options) {

  this.ensureKnowTrusted();

  var text = this.isExternal() ? ('Содержимое файла ' + this.src) : this.text;

  var prismLanguageMap = {
    html:   'markup',
    js:     'javascript',
    coffee: 'coffeescript'
  };

  var prismLanguage = prismLanguageMap[this.name] || this.name;

  var attrs = {
    'class':        "language-" + prismLanguage + " line-numbers",
    "data-trusted": (this.isTrusted() && !this.params.untrusted) ? '1' : '0'
  };

  if (this.params.height) {
    attrs['data-demo-height'] = this.params.height;
  }

  if (this.params.autorun) {
    attrs['data-autorun'] = '1';
  }
  if (this.params.refresh) {
    attrs['data-refresh'] = '1';
  }
  if (this.params.run) {
    attrs['data-run'] = '1';
  }
  if (this.params.demo) {
    attrs['data-demo'] = '1';
  }

  if (this.params.hide) {
    attrs['data-hide'] = (this.params.hide === true) ? "" : this.params.hide;
    attrs['class'] += ' hide';
  }

  // strip first empty lines
  text = stripIndents(text);

  var highlight = extractHighlight(text);

  if (highlight.block) {
    attrs['data-highlight-block'] = highlight.block;
  }
  if (highlight.inline) {
    attrs['data-highlight-inline'] = highlight.inline;
  }
  text = highlight.text;

  var html = escapeHtmlText(text);
  html = wrapTagAround(this.tag, attrs, html);

  return html;
};

module.exports = SourceTag;
