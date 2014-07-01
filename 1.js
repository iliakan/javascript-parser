
var char = "*";

var isWhiteSpace = function(char) {
  switch (char) {
  case ' ':
  case '\n':
  case '\t':
    return true;
  default:
    return false;
  }
};


for(var i=0; i<1e7; i++) {
  /\s/.test(char);
}


for(var i=0; i<1e7; i++) {
  isWhiteSpace(char);
}