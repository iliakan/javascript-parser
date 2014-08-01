var inherits = require('inherits');
var TagNode = require('./tagNode');
var wrapTagAround = require('../util/wrapTagAround');

function KeyTag(text) {
  TagNode.call(this, "kbd", text, {"class": "shortcut"});
}
inherits(KeyTag, TagNode);

KeyTag.prototype.getType = function() {
  return "KeyTag";
};

KeyTag.prototype.toHtml = function(options) {

  var results = [];
  var keys = this.text;

  if (keys == "+") {
    return wrapTagAround(this.tag, this.attrs, '+');
  }

  var plusLabel = Math.random();
  keys = keys.replace(/\+\+/g, '+' + plusLabel);
  keys = keys.split('+');

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    results.push((key == plusLabel) ? '+' : key);
    if (i < keys.length - 1) {
      results.push('<span class="shortcut__plus">+</span>');
    }
  }

  return wrapTagAround(this.tag, this.attrs, results.join(''));
};

module.exports = KeyTag;
