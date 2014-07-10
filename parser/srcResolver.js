const fs = require('fs');
const path = require('path');
const thunkify = require('thunkify');
const fsStat = thunkify(fs.stat);
const fsReadFile = thunkify(fs.readFile);
const gm = require('gm');
const imageSize = thunkify(require('image-size'));
function SrcResolver(src, options) {
  if (!options.resourceFsRoot) {
    throw new Error("resourceFsRoot is required");
  }

  if (!options.resourceWebRoot) {
    throw new Error("resourceWebRoot is required");
  }
//  console.log(options);
//throw new Error();
  this.src = src;
  this.options = options;
}

// this must ensure that src is safe and jailed
// as of now, only relative srcs are allowed
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
  var stat;

  try {
    stat = yield fsStat(this.getFsPath());
    if (!stat.isDirectory()) {
      throw new Error("Not a folder");
    }
  } catch (e) {
    throw new Error("Bad src: could not read directory " + this.src);
  }

  var plnkrPath = path.join(this.getFsPath(), '.plnkr');

  var info;
  try {
    info = yield fsReadFile(plnkrPath, 'utf-8');
    info = JSON.parse(info);
  } catch (e) {
    throw new Error("Bad src: could not read plunk info " + this.src);
  }

  return info.plunk;
};

SrcResolver.prototype.readFile = function *() {
  try {
    return yield fsReadFile(this.getFsPath(), 'utf-8');
  } catch(e) {
    console.error(e.stack);
    throw new Error("Bad src: could not read file " + this.src +
      (process.env.NODE_ENV == 'development' ? " [from " + this.getFsPath()+"]" : "")
    );
  }
};

SrcResolver.prototype.resolveImage = function *(withSize) {

  if (!/\.(png|jpg|gif|jpeg|svg)$/i.test(this.src)) {
    throw new Error("Bad src: should end with png/jpg/gif/jpeg/svg");
  }

  var fsPath = this.getFsPath();

  var stat;

  try {
    stat = yield fsStat(fsPath);
  } catch (e) {
    throw new Error("Bad src: could not read " + this.src +
        (process.env.NODE_ENV == 'development' ? " [from " + this.getFsPath()+"]" : "")
    );
  }

  if (!stat.isFile()) {
    throw new Error("Bad src: not a file " + this.src);
  }

  const data = {
    fsPath: fsPath,
    webPath: this.getWebPath()
  };

  if (withSize) {
    var size;
    if (/\.svg$/i.test(this.src)) {
      size = yield function(callback) {
        // GraphicsMagick fails with `gm identify my.svg`
        gm(fsPath).options({imageMagick: true}).identify('{"width":%w,"height":%h}', callback);
      };

      size = JSON.parse(size);
    } else {
      size = yield imageSize(fsPath);
    }
    data.size = size;
  }

  return data;
};


exports.SrcResolver = SrcResolver;