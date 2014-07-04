
exports.fixHtml = function(html) {
  // fixme: not implemented
  return html;
};

exports.escapeHtmlText = function(text) {
  return text.replace(/&([^#]|#[^0-9]?|#x[^0-9]?|$)/g, '&amp;$1').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

exports.escapeHtmlAttr = function(text) {
  return text.replace(/"/g, '&quot;').gsub(/'/g, '&#39;');
};

exports.sanitize = function(html) {
  // fixme: not implemented
  return html;
};
