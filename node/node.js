
function Node() {
}

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

Node.prototype.toHtml = function() {
  return "";
};

Node.prototype.toJSON = function(options) {
  return {type: this.getType()};
};

exports.Node = Node;