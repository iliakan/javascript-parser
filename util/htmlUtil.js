const sanitizeHtml = require('sanitize-html');
const SAFE_TAGS = require('../consts').SAFE_TAGS;
const transliterate = require('./transliterate');

exports.makeAnchor = function(title) {
  var anchor = title.trim()
    .replace(/<\/?[a-z].*?>/gim, '')  // strip tags, leave /<DIGIT/ like: "IE<123"
    .replace(/[ \t\n!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~]/g, '-') // пунктуация, пробелы -> дефис
    .replace(/[^a-zа-яё0-9-]/gi, '') // убрать любые символы, кроме [слов цифр дефиса])
    .replace(/-+/gi, '-') // слить дефисы вместе
    .replace(/^-|-$/g, ''); // убрать дефисы с концов

  //anchor = transliterate(anchor);
  anchor = anchor.toLowerCase();

  return anchor;
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

