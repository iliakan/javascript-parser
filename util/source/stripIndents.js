
// strip first empty lines
function stripFirstLines(text) {
  return text.replace(/$(^[ \t]*\n)*/gim, '');
}

var stripPattern = /^\s*(?=[^\s]+)/mg;

// same as Ruby strip_heredoc + strip first lines and rtrim
module.exports = function(text) {

  text = stripFirstLines(text).replace(/\s+$/, '');
  if (!text) return '';

  var indentLen = text.match(stripPattern)
    .reduce(function (min, line) {
      return Math.min(min, line.length);
    }, Infinity);

  var indent = new RegExp('^\\s{' + indentLen + '}', 'mg');
  return indentLen > 0 ? text.replace(indent, '') : text;
};
