const Parser = require('./parser').Parser;
const util = require('util');
const TextNode = require('../node/textNode').TextNode;

function TextParser(text, options) {
  Parser.call(this, options);
  this.text = text;
}

util.inherits(TextParser, Parser);

//  Каждый вызов parse_nodes возвращает либо один узел (div с содержимым),
//  либо массив узлов, например [online] ... [/online] возвращает своё содержимое с учетом вложенных тегов
//  или пустую строку, если экспорт-режим
//  Это должен быть valid html
TextParser.prototype.parse = function() {
  this.buffer = '';
  var children = [];

  this.position = 0;

  while(this.position < this.text.length) {
    this.nextChar = this.text[this.position];

    var nodes = this.parseNodes() || [];

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var type = node.getType();
      if (type == 'comment') {
        this.buffer += node.toHtml();
      } else if (type == 'text') {
        this.buffer += node.text;
      } else if (type == 'cut') {
        if (options.stopOnCut) {
          break;
        }
      } else {

        if (this.buffer) {
          children.push(new TextNode(this.buffer));
          this.buffer = "";
        }
        children.push(node);
      }
    }

    if (!nodes.length) {
      this.buffer = this.nextChar;
      this.position++;
    }

  }

  if (this.buffer) {
    children.push(new TextNode(this.buffer));
  }

  return children;
};

TextParser.prototype.position = 0;

TextParser.prototype.parseNode = function() {
  throw new Error("Not implemented");
};

exports.TextParser = TextParser;