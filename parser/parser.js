var _ = require('lodash');
var CompositeTag = require('../node/compositeTag').CompositeTag;
var Lexer = require('./lexer')

// Обычно при создании парсера опции создаются как sub_opts, чтобы передать текущие опции, расширив их
// Произвольный парсер имеет опции
// :trusted - доверенный режим или обычный юзер
function Parser(options) {
  options = options || {};
  this.validateOptions(options);
  // В каждом парсере будет свой хэш опций
  this.options = options;

  this.trusted = options.trusted;
}

// Проверить наличие нужных опций
//
// Каждый парсер переопределит это, как считает нужным
// Как правило, в переопределённом методе не нужно вызывать super,
// Так будет понятно, что именно нужно парсеру
Parser.prototype.validateOptions = function(options) {

  if ("trusted" in options) {
    throw new Error("Must have :trusted")
  }

};

Parser.prototype.subOpts = function(mergeOptions) {
  return _.assign({}, this.options, mergeOptions || {});
};

Parser.prototype.parse = function() {
  throw new Error("Not implemented");
};

Parser.prototype.getClass = function() {
  return 'Parser';
};

Parser.prototype.toStructure = function() {
  return _.assign({}, this.options, {parser: this.getClass()});
};

Parser.prototype.parseAndWrap = function(tag, attrs, options) {
  return new CompositeTag(tag, this.parse(), attrs, options);
};

exports.Parser = Parser;