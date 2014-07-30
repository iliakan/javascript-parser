var _ = require('lodash');
var CompositeTag = require('../node/compositeTag');

// Обычно при создании парсера опции создаются как sub_opts, чтобы передать текущие опции, расширив их
// Произвольный парсер имеет опции
// :trusted - доверенный режим или обычный юзер
function Parser(options) {
  options = options || {};
  this.validateOptions(options);
  this.options = options;
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

Parser.prototype.subOpts = function(mergeOptions) {
  return _.assign({}, this.options, mergeOptions || {});
};

Parser.prototype.parse = function* () {
  throw new Error("Not implemented");
};

Parser.prototype.parseAndWrap = function *(tag, attrs) {
  return new CompositeTag(tag, yield this.parse(), attrs);
};

module.exports = Parser;
