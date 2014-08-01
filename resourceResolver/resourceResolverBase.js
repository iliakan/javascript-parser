//var path = require('path');
//
//function ResourceResolverBase(src, options) {
//
//  if (!options.root) {
//    throw new Error("root is required");
//  }
//
//  if (options.root[0] != '/') {
//    throw new Error("root must be absolute, like '/article'");
//  }
//
//  this.src = src;
//  this.options = options;
//}
//
//// this must ensure that src is safe and jailed
//// as of now, only relative srcs are allowed
//ResourceResolverBase.prototype.cleanSrc = function() {
//  return this.src.replace(/\.\./g, '').replace(/^\/+|\/+$/, '');
//};
//
//ResourceResolverBase.prototype.getWebPath = function() {
//  var src = this.cleanSrc();
//  var webPath = this.options.root + '/' + src;
//
//  return webPath;
//};
//
//SrcResolver.prototype.readPlunkId = function* () {
//  var stat;
//
//  try {
//    stat = yield fsStat(this.getFsPath());
//    if (!stat.isDirectory()) {
//      throw new Error("Bad src: not a folder " + this.src);
//    }
//  } catch (e) {
//    throw new Error("Bad src: could not read directory " + this.src);
//  }
//
//  var plnkrPath = path.join(this.getFsPath(), '.plnkr');
//
//  var info;
//  try {
//    info = yield fsReadFile(plnkrPath, 'utf-8');
//    info = JSON.parse(info);
//  } catch (e) {
//    throw new Error("Bad src: could not read plunk info " + this.src);
//  }
//
//  return info.plunk;
//};
//
//SrcResolver.prototype.readFile = function* () {
//  try {
//    return yield fsReadFile(this.getFsPath(), 'utf-8');
//  } catch(e) {
//    console.error(e.stack);
//    throw new Error("Bad src: could not read file " + this.src +
//      (process.env.NODE_ENV == 'development' ? " [from " + this.getFsPath()+"]" : "")
//    );
//  }
//};
//
//SrcResolver.prototype.resolveImage = function *(withSize) {
//
//  if (!/\.(png|jpg|gif|jpeg|svg)$/i.test(this.src)) {
//    throw new Error("Bad src: should end with png/jpg/gif/jpeg/svg");
//  }
//
//  var fsPath = this.getFsPath();
//
//  var stat;
//
//  try {
//    stat = yield fsStat(fsPath);
//  } catch (e) {
//    throw new Error("Bad src: could not read " + this.src +
//        (process.env.NODE_ENV == 'development' ? " [from " + this.getFsPath()+"]" : "")
//    );
//  }
//
//  if (!stat.isFile()) {
//    throw new Error("Bad src: not a file " + this.src);
//  }
//
//  var data = {
//    fsPath: fsPath,
//    webPath: this.getWebPath()
//  };
//
//  if (withSize) {
//    var size;
//    if (/\.svg$/i.test(this.src)) {
//      size = yield function(callback) {
//        // GraphicsMagick fails with `gm identify my.svg`
//        gm(fsPath).options({imageMagick: true}).identify('{"width":%w,"height":%h}', callback);
//      };
//
//      size = JSON.parse(size); // warning: no error processing
//    } else {
//      size = yield imageSize(fsPath);
//    }
//    data.size = size;
//  }
//
//  return data;
//};
//
//
//exports.ResourceResolver = SrcResolver;
