var gm = require('gm');
var thunkify = require('thunkify');
var fs = require('fs');
var fsStat = thunkify(fs.stat);
var util = require('util');
var path = require('path');
var co = require('co');


function *parse () {
  var fsPath = path.join(__dirname, 'document', 'html6.jpg');

  return parseImg(fsPath);
}

var parseImg = function *(fsPath) {

  try {
    stat = yield fsStat(fsPath);
  } catch (e) {
    throw new Error("Bad src: could not read")
  }

  if (!stat.isFile()) {
    throw new Error("Bad src: not a file");
  }

  var size = yield function(callback) {
    gm(fsPath).size(callback);
  };

  return {
    size: size
  };
};


co(function *() {
  var res = yield parse();
  res = yield res;

  return res;
})(function(err, res) {
  console.log(err, res);
});