var escapeHtmlAttr = require('./escapeHtmlAttr');

module.exports = function(tag, attrs, html) {
  var result = "<" + tag;

//  console.log(tag, attrs, html);
  for (var name in attrs) {
    name = escapeHtmlAttr(name);
    var value = escapeHtmlAttr(attrs[name]);
    result += ' ' + name + '="' + value + '"';
  }

  result += '>';

  if (tag != 'img') {
    result += html + '</' + tag + '>';
  }
  return result;
};
