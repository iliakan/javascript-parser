
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

exports.makeLabel = function() {
  return (+(Math.random() + '').slice(2)).toString(36);
};

exports.replaceLabels = function(html, labels) {
  var pattern = /<span>LABEL:(\w+)<\/span>|<div>LABEL:(\w+)<\/div>/g;

  return html.replace(pattern, function(match, p1, p2) {
    var label = p1 || p2;
    var content = labels[label];
    delete labels[label];
    return content;
  });
};

