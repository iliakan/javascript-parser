"use strict";

var path = require('path');

/**
 * Checks that path (related to cwd) is under root and return it in absolute form
 * Does not check that the path exists, only strings manipulations
 * @param pathname only     relative paths are allowed
 * @param options.cwd       starting point for paths like ../../dir
 * @param options.root      result should not get out of root, optional
 * @param options.onlyCheck if true then return given pathname or null
 * @return                  absolute FS path
 */
exports.getSafeFullPath = function(pathname, options) {
  if (pathname[0] == '/') return null;

  var cwd = options.cwd;
  if (cwd[0] != '/') {
    cwd = path.join(process.cwd(), cwd);
  }

  var root = options.root || options.cwd;
  if (root[0] != '/') {
    root = path.join(process.cwd(), root);
  }

  var pathnameAbsolute = path.resolve(cwd, pathname);

  if (pathnameAbsolute.slice(0, root.length + 1) != root + '/') return null;

  return options.onlyCheck ? pathname : pathnameAbsolute;
};