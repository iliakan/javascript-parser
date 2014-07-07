const sanitizeHtml = require('sanitize-html');
const SAFE_TAGS = require('../consts').SAFE_TAGS;

exports.fixHtml = function(html) {
  // fixme: not implemented
  return html;
};

exports.escapeHtmlText = function(text) {
  return text.replace(/&([^#]|#[^0-9]?|#x[^0-9]?|$)/g, '&amp;$1').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

exports.escapeHtmlAttr = function(text) {
  return text.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
};

exports.stripTags = function(text) {
  return text.replace(/<\/?[a-z].*?>/gim, '');
};

exports.sanitize = function(html) {

  return sanitizeHtml(html, {
    allowedTags: SAFE_TAGS,
    allowedAttributes: {
      img: ['src', 'alt'],
      a:   ['href', 'name', 'target', 'title']
    }
  });
};

