
function Node(options) {
  this.validateOptions(options);
  this.trusted = options.trusted;
  this.options = options;
}

// Проверяет опции, чтобы не было чего-то лишнего (для ясности), а всё нужное - было
// :parent в опциях нет, он ставится CompositeNode
Node.prototype.validateOptions = function() {
  // no op
};


/*
 если узел в toHtml сам применяет типографские фильтры и санитайзит, то true
 в этом случае внешний узел перед типографией заменяет его на метку

 без типографики идёт только "пользовательский текст", который сам себя не санитайзит,
 так как сам по себе может быть неверен, нужно смотреть снаружи:
 [<div>, ТЭГ, </div>]
*/
Node.prototype.selfAppliedTypography = function() {
  throw new Error("Unknown");
};

Node.prototype.getType = function() {
  return "node";
};


Node.prototype.getClass = function() {
  return "Node";
};


/*
  trusted - берём от ближайшего родителя (любой узел может поменять его в иерархии на другой)
  При генерации содержимого узел sanitize'ит своё тело unless trusted?,
  но сам тег и опции, которые генерирует класс узла, не проходят sanitize никогда
 */
Node.prototype.isTrusted = function() {
  return this.trusted === undefined ? this.parent.trusted : this.trusted;
};

Node.prototype.toHtml = function() {
  return "";
};

Node.prototype.toStructure = function(options) {
  var hash = {node: this.getClass()};
  if (options.withOptions) {
    hash.options = this.options;
  }
  if (this.trusted !== undefined) {
    hash.trusted = this.trusted;
  }
  return hash;
};

exports.Node = Node;