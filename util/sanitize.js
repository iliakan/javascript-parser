var sanitizeHtml = require('sanitize-html');
var SAFE_TAGS = require('../consts').SAFE_TAGS;

module.exports = function(html) {

  return sanitizeHtml(html, {
    allowedTags: SAFE_TAGS,
    allowedAttributes: {
      img: ['src', 'alt'],
      a:   ['href', 'name', 'target', 'title']
    }
  });
};

