var _ = require('lodash');
var CompositeTag = require('../node/compositeTag');
var TextNode = require('../node/textNode');

// Обычно при создании парсера опции создаются как sub_opts, чтобы передать текущие опции, расширив их
// Произвольный парсер имеет опции
// :trusted - доверенный режим или обычный юзер
function Parser(options) {
  options = options || {};
  this.validateOptions(options);
  this.options = options;
  this.resourceRoot = options.resourceRoot;
  this.trusted = options.trusted;
}

// Проверить наличие нужных опций
//
// Каждый парсер переопределит это, как считает нужным
// Как правило, в переопределённом методе не нужно вызывать super,
// Так будет понятно, что именно нужно парсеру
Parser.prototype.validateOptions = function(options) {
  // throw if something's wrong
};

Parser.prototype.node = function(Constructor/*, args */) {

  var node;

  /* slow
  if (typeof Constructor == "string") {
    node = new TextNode(Constructor);
  } else {
    // jshint -W082
    var args = Array.prototype.slice.call(arguments, 1);
    function F() {
      return Constructor.apply(this, args);
    }

    F.prototype = Constructor.prototype;
    node = new F();
  }
  */


  if (typeof Constructor == "string") {
    node = new TextNode(Constructor);
  } else {
    var args = Array.prototype.slice.call(arguments, 1);
    var node = Object.create(Constructor.prototype);
    Constructor.apply(node, args);
  }

  node.trusted = this.trusted;
  return node;
};

Parser.prototype.parse = function() {
  throw new Error("Not implemented");
};

Parser.prototype.parseAndWrap = function(tag, attrs) {
  return this.node(CompositeTag, tag, this.parse(), attrs);
};

module.exports = Parser;
