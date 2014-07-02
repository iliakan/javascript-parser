
function Node(options) {
  options = options || {};
  this.validateOptions(options);
  this.options = options;
}

// Проверяет опции, чтобы не было чего-то лишнего (для ясности), а всё нужное - было
Node.prototype.validateOptions = function(options) {
  return; // throw in case of an error!
};


/*
 если узел в toHtml сам санитайзит (и применяет типографию?), то true
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
  var hash = {type: this.getType()};
  if (options.withOptions) {
    hash.options = this.options;
  }
  if (this.trusted !== undefined) {
    hash.trusted = this.trusted;
  }
  return hash;
};

exports.Node = Node;