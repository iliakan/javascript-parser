const fs = require('fs');
const path = require('path');
const thunkify = require('thunkify');
const fsStat = thunkify(fs.stat);
const fsRead = thunkify(fs.read);
const gm = require('gm');
function SrcResolver(src, options) {
  this.src = src;
  this.options = options;
}

SrcResolver.prototype.cleanSrc = function() {
  return this.src.replace(/\.\./g, '').replace(/^\/+|\/+$/, '');
};

// allows only relative urls from resourceFsRoot
// strips dots ... and slashes ^/|/$ from both sides of src
SrcResolver.prototype.getFsPath = function() {
  var src = this.cleanSrc();
  var fsPath = path.join(this.options.resourceFsRoot, src);

  return fsPath;
};

SrcResolver.prototype.getWebPath = function() {
  var src = this.cleanSrc();
  var webPath = path.join(this.options.resourceWebRoot, src);

  return webPath;
};

SrcResolver.prototype.getExamplePath = function() {
  var src = this.cleanSrc();
  return path.join(this.options.resourceWebRoot, src, '');
};

SrcResolver.prototype.readPlunkId = function *() {

  try {
    stat = yield fsStat(this.getFsPath());
    if (!stat.isDirectory()) {
      throw new Error("Not a folder");
    }
  } catch (e) {
    throw new Error("Bad src: could not read directory " + this.src)
  }

  var plnkrPath = path.join(this.getFsPath(), '.plnkr');

  var info;
  try {
    info = yield fsRead(fsPath);
    info = JSON.parse(info);
  } catch (e) {
    throw new Error("Bad src: could not read plunk info " + this.src)
  }

  return info.plunk;
};

SrcResolver.prototype.resolveImage = function *() {

  if (!/\.(png|jpg|gif|jpeg)$/i.test(this.src)) {
    throw new Error("The src should end with png/jpg/gif/jpeg")
  }

  var fsPath = this.getFsPath();

  var stat;

  try {
    stat = yield fsStat(fsPath);
  } catch (e) {
    throw new Error("Bad src: could not read " + this.src)
  }

  if (!stat.isFile()) {
    throw new Error("Bad src: not a file " + this.src);
  }

  var size = yield function(callback) {
    gm(fsPath).size(callback);
  };

  return {
    fsPath: fsPath,
    webPath: this.getWebPath(),
    size: size
  };
};

exports.SrcResolver = SrcResolver;