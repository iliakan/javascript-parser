/**
 * Flexible logging wrapper around windston
 *
 * usage:
 *  var log = require('lib/log')(module)
 *  log.debug("Winston %s", "syntax");
 *
 * enabling debug directly in the code:
 *  log.debugOn();
 * enabling debug for paths from CLI:
 *  DEBUG=path node app
 * where path is calculated from the project root (where package.json resides)
 * example:
 *  DEBUG=models/* node app
 *  DEBUG=models/*,lib/* node app
 * exclusion:
 *  DEBUG=-models/user,models/* node app (to log all models except user)
 */

var winston = require('winston');
var path = require('path');
var fs = require('fs');

var names = [], skips = [];

(process.env.DEBUG || '')
  .split(/[\s,]+/)
  .forEach(function(name) {
    name = name.replace('*', '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      names.push(new RegExp('^' + name + '$'));
    }
  });

function findProjectRoot() {

  var dir = __dirname;
  while (!fs.existsSync(path.join(dir, 'package.json'))) {
    dir = path.dirname(dir);
  }

  return path.normalize(dir);
}

var projectRoot = findProjectRoot();

function getLogLevel(module) {

  var modulePath = module.filename.slice(projectRoot.length + 1); // models/user.js
  modulePath = modulePath.replace(/\.js$/, ''); // models.user

  var logLevel = 'info';

  var isSkipped = skips.some(function(re) {
    return re.test(modulePath);
  });

  if (!isSkipped) {
    var isIncluded = names.some(function(re) {
      return re.test(modulePath);
    });

    if (isIncluded) logLevel = 'debug';
  }

  return logLevel;
}

function getLogger(module) {

  var showPath = module.filename.split('/').slice(-2).join('/');

  var logLevel = getLogLevel(module);
  var logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        level: logLevel,
        label: showPath
      })
    ]
  });

  logger.debugOn = function() {
    Object.keys(this.transports).forEach(function(key) {
      logger.transports[key].level = 'debug';
    }, this);
  };

  return logger;
}

module.exports = getLogger;