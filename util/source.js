
// strip first empty lines
function stripFirstLines(text) {
  return text.replace(/$(^[ \t]*\n)*/gim, '');
}

var stripPattern = /^\s*(?=[^\s]+)/mg;

// same as Ruby strip_heredoc + strip first lines and rtrim
exports.stripIndents = function(text) {
  text = stripFirstLines(text).replace(/\s+$/, '');
  var indentLen = text.match(stripPattern)
    .reduce(function (min, line) {
      return Math.min(min, line.length)
    }, Infinity);

  var indent = new RegExp('^\\s{' + indentLen + '}', 'mg')
  return indentLen > 0
    ? text.replace(indent, '')
    : text
};

exports.extractHighlight = function(text) {
  text += "\n";
  var r = {block: [], inline: []};
  var last = null;
  var newText = [];

  text.split("\n").forEach(function(line) {
    if (/^\s*\*!\*\s*$/.test(line)) { // only *!*
      if (last) {
        newText.push(line);
      } else {
        last = newText.length;
      }
    } else if (/^\s*\*\/!\*\s*$/.test(line)) { // only */!*
      if (last !== null) {
        r.block.push(last + '-' + (newText.length-1))
        last = null;
      } else {
        newText.push(line);
      }
    } else if (/\s*\*!\*\s*$/.test(line)) { // ends with *!*
      r.block.push(newText.length + '-' + newText.length);
      line = line.replace(/\s*\*!\*\s*$/g, '');
      newText.push(line);
    } else {
      newText.push("");
      var offset = 0;
      while(true) {
        var fromPos = line.indexOf('*!*');
        var toPos = line.indexOf('*/!*');
        if (fromPos != -1 && toPos != -1) {
          r.inline.push( (newText.length-1) + ':' + (offset+fromPos) + '-' + (offset+toPos-3) );
          newText[newText.length-1] += line.slice(0, toPos+4).replace(/\*\/?!\*/g, '');
          offset += toPos - 3;
          line = line.slice(toPos+4);
        } else {
          newText[newText.length-1] += line;
          break;
        }
      }
    }
  });

  if (last) {
    r.block.push( last + '-' + (newText.length-1) );
  }

  return {
    block: r.block.join(','),
    inline: r.inline.join(','),
    text: newText.join("\n").replace(/\s+$/, '')
  };

};
