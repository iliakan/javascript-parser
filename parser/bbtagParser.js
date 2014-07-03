exports.BbtagParser = BbtagParser;

const Parser = require('./parser').Parser;
const BodyParser = require('./bodyParser').BodyParser;
const BbtagAttrsParser = require('./bbtagAttrsParser').BbtagAttrsParser;
const consts = require('../consts');
const util = require('util');
const path = require('path');
const _ = require('lodash');
const TextNode = require('../node/textNode').TextNode;
const TagNode = require('../node/tagNode').TagNode;
const EscapedTag = require('../node/escapedTag').EscapedTag;
const ErrorTag = require('../node/errorTag').ErrorTag;
const UnresolvedLinkNode = require('../node/unresolvedLinkNode').UnresolvedLinkNode;
const SrcResolver = require('./srcResolver').SrcResolver;

/**
 * Parser creates node objects from general text.
 * Node attrs will *not* be checked by sanitizers, they can contain anything like `onclick=`
 * This provides maximal freedom to the parser.
 *
 * Parser knows about current trust mode, so it must make sure that these attributes are safe.
 *
 * @constructor
 */
function BbtagParser(name, attrsString, body, options) {
  Parser.call(this, options);
  this.name = name;
  this.attrsString = attrsString;
  this.body = body;

  this.attrs = this.readAttrsString(attrsString);
}
util.inherits(BbtagParser, Parser);


BbtagParser.prototype.validateOptions = function(options) {

  if (!("trusted" in options)) {
    throw new Error("Must have trusted option")
  }

  // if we need [img src="my.png"], we read my.png from *this folder* to retreive it's size
  if (!options.resourceFsRoot) {
    throw new Error("Must have resourceFsRoot option: filesystem dir to read resources from");
  }

  // if we need
  if (!options.resourceWebRoot) {
    throw new Error("Must have resourceWebRoot option: web dir to reference resources");
  }

};


BbtagParser.prototype.readAttrsString = function(attrsString) {
  var parser = new BbtagAttrsParser(attrsString);
  return parser.parse();
};

BbtagParser.prototype.parse = function() {

  if (consts.BBTAGS_BLOCK_SET[this.name]) {
    return this.parseBlock();
  }

  if (consts.BBTAGS_SOURCE_SET[this.name]) {
    return this.parseSource();
  }

  var methodName = 'parse' + this.name[0].toUpperCase() + this.name.slice(1);
  var method = this[methodName];

  if (!method) {
    throw new Error("Unknown bbtag: " + this.name);
  }

  return method.call(this);

};

BbtagParser.prototype.parseOffline = function *() {
  if (this.options.export) {
    return yield new BodyParser(this.body, this.subOpts()).parse();
  } else {
    return new TextNode("");
  }
};

BbtagParser.prototype.parseDemo = function *() {

  var attrs = {};
  if (this.attrs.src) {
    var resolver = new SrcResolver(attrs.src, this.options);

    attrs.href = resolver.getExamplePath();
    attrs.target = '_blank';
    return new TagNode('a', 'Демо в новом окне', attrs);
  }

  return new TagNode('button', "Запустить демо", {"onclick": 'runDemo(this)'});
};


BbtagParser.prototype.parseOnline = function *() {
  if (!this.options.export) {
    var parser = new BodyParser(this.body, this.subOpts());
    return yield parser.parse();
  } else {
    return new TextNode("");
  }
};

BbtagParser.prototype.paramRequiredError = function(errorTag, paramName) {
  return new ErrorTag.new(errorTag, this.name + ": attribute required " + paramName)
};

BbtagParser.prototype.parseImg = function *() {
  if (!this.attrs.src) {
    return this.paramRequiredError('div', 'src');
  }

  var attrs = this.trusted ? _.clone(this.attrs) : {"src" : this.attrs.src }

  var resolver = new SrcResolver(attrs.src, this.options);

  var imageInfo;
  try {
    imageInfo = yield resolver.resolveImage();
  } catch (e) {
    return new ErrorTag('div', e.message);
  }

  attrs.width = imageInfo.size.width;
  attrs.height = imageInfo.size.height;
  attrs.src = imageInfo.webPath;

  return new TagNode('img', '', attrs);
};


BbtagParser.prototype.parseExample = function *() {
  if (!this.attrs.src) {
    return this.paramRequiredError('div', 'src');
  }

  var attrs = {
    'class': 'result__iframe',
    'data-trusted': this.trusted ? '1' : '0'
  };

  attrs['data-demo-height'] = this.params.height || 350;

  var resolver = new SrcResolver(this.attrs.src, this.options);

  var plunkId;
  try {
    plunkId = yield resolver.readPlunkId();
  } catch (e) {
    return new ErrorTag('div', e.message);
  }

  attrs.src = "http://embed.plnkr.co/" + plunkId + "/preview";

  attrs['data-src'] = resolver.getExamplePath();

  if (this.attrs.zip) {
    attrs['data-zip'] = "1";
  }

  return new TagNode("iframe", "", attrs);
};



