module.exports = BbtagParser;

var StringSet = require('../util/StringSet');
var Parser = require('./parser');
var BodyParser = require('./bodyParser');
var BbtagAttrsParser = require('./bbtagAttrsParser');
var consts = require('../consts');
var inherits = require('inherits');
var _ = require('lodash');
var SourceTag = require('../node/sourceTag');
var TagNode = require('../node/tagNode');
var CutNode = require('../node/cutNode');
var ImgTag = require('../node/imgTag');
var KeyTag = require('../node/keyTag');
var CompositeTag = require('../node/compositeTag');
var EscapedTag = require('../node/escapedTag');
var ErrorTag = require('../node/errorTag');
var VerbatimText = require('../node/verbatimText');
var TextNode = require('../node/textNode');

/**
 * Parser creates node objects from general text.
 * Node attrs will *not* be checked by sanitizers, they can contain anything like `onclick=`
 * This provides maximal freedom to the parser.
 *
 * Parser knows about current trust mode, so it must make sure that these attributes are safe.
 *
 * @constructor
 */
function BbtagParser(token, options) {
  Parser.call(this, options);
  this.name = token.name;
  this.paramsString = token.attrs;
  this.body = token.body;
  this.token = token;

  this.params = this.readParamsString();
}
inherits(BbtagParser, Parser);


BbtagParser.prototype.validateOptions = function(options) {

  if (!("trusted" in options)) {
    throw new Error("Must have trusted option");
  }

};


BbtagParser.prototype.readParamsString = function() {
  var parser = new BbtagAttrsParser(this.paramsString);
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

BbtagParser.prototype.parseOffline = function() {
  if (this.options.export) {
    return new BodyParser(this.body, this.options).parse();
  } else {
    return this.node("");
  }
};

BbtagParser.prototype.parseDemo = function() {

  var attrs = {};
  if (this.params.src) {
    attrs.href = this.normalizeSrc(this.params.src) + '/';
    attrs.target = '_blank';
    return this.node(TagNode, 'a', 'Демо в новом окне', attrs);
  }

  return this.node(TagNode, 'button', "Запустить демо", {"onclick": 'runDemo(this)'});
};

BbtagParser.prototype.normalizeSrc = function(src) {
  if (src[0] == '/') return src;

  if (~src.indexOf('://')) return src;

  return this.resourceRoot + '/' + src;
};


BbtagParser.prototype.parseHead = function() {
  if (this.trusted) {
    if (!this.options.metadata.head) this.options.metadata.head = [];

    this.options.metadata.head.push(this.body);
  }
  return this.node('');
};

// use object for libs, because they are
// (1) unique
// (2) keep order
BbtagParser.prototype.parseLibs = function() {
  if (this.trusted) {
    var lines = this.body.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var lib = lines[i].trim();
      if (!lib) continue;
      if (!this.options.metadata.libs) this.options.metadata.libs = new StringSet();
      this.options.metadata.libs.add(lib);
    }
  }
  return this.node('');
};

BbtagParser.prototype.parseImportance = function() {
  if (this.trusted) {
    this.options.metadata.importance = parseInt(this.paramsString);
  }
  return this.node('');
};

BbtagParser.prototype.parseEdit = function() {
  if (!this.params.src) {
    return this.paramRequiredError('span', 'src');
  }

  var body = this.body;
  if (!body) {
    if (this.params.task) {
      body = 'Открыть исходный документ';
    } else {
      body = 'Открыть в песочнице';
    }
  }

  var attrs = {
    "class": "edit",
    href:    "/play" + this.normalizeSrc(this.params.src)
  };

  return this.node(TagNode, 'a', body, attrs);
};

BbtagParser.prototype.parseCut = function() {
  return this.node(CutNode);
};

BbtagParser.prototype.parseKey = function() {
  return this.node(KeyTag, this.paramsString.trim());
};


BbtagParser.prototype.parseBlock = function() {
  var content = [];

  content.push('<div class="important__header">');
  if (this.params.header) {
    content.push('<span class="important__type"></span><h3 class="important__title">');
    var headerContent = new BodyParser(this.params.header, this.options).parse();
    content.push.apply(content, headerContent);
    content.push('</h3>');
  } else {
    content.push('<span class="important__type">', consts.BBTAG_BLOCK_DEFAULT_TITLE[this.name], '</span>');
  }

  content.push('</div>'); // ../important__header

  content.push('<div class="important__content">');
  content.push.apply(content, new BodyParser(this.body, this.options).parse());
  content.push('</div>');

  content = content.map(function(item) {
    return (typeof item == 'string') ? this.node(item) : item;
  }, this);

  return this.node(CompositeTag, 'div', content, {'class': 'important important_' + this.name});
};


BbtagParser.prototype.parseSource = function() {
  return this.node(SourceTag, this.name, this.body, this.params);
};


BbtagParser.prototype.parseSummary = function() {
  var summary = new BodyParser(this.body, this.options).parse();

  var content = this.node(CompositeTag, 'div', summary, {'class': "summary__content"});

  return this.node(CompositeTag, 'div', [content], {'class': 'summary'});
};

BbtagParser.prototype.parseIframe = function() {
  if (!this.params.src) {
    return this.paramRequiredError('div', 'src');
  }

  var attrs = {
    'class':        'result__iframe',
    'data-trusted': this.trusted ? '1' : '0'
  };

  if (this.params.height) {
    attrs['data-demo-height'] = this.params.height;
  }

  attrs.src = this.normalizeSrc(this.params.src) + '/';
  if (this.params.play) {
    attrs['data-play'] = "1";
  }

  if (this.params.link) {
    attrs['data-external'] = 1;
  }

  if (this.params.zip) {
    attrs['data-zip'] = 1;
  }

  return this.node(TagNode, 'iframe', '', attrs);

};

BbtagParser.prototype.parseQuote = function() {
  var children = new BodyParser(this.body, this.options).parse();

  if (this.params.author) {
    children.push(this.node(TagNode, 'div', this.params.author, {'class': 'quote-author'}));
  }

  var result = this.node(CompositeTag, 'div', children, {'class': 'quote-author'});
  return this.node(CompositeTag, 'div', [result], {'class': 'quote'});
};

BbtagParser.prototype.parseHide = function() {
  var content = new BodyParser(this.body, this.options).parse();

  var children = [
    this.node(CompositeTag, 'div', content, {"class": "hide-content"})
  ];

  if (this.params.text) {
    var text = new BodyParser(this.params.text, this.options).parse();

    /*jshint scripturl:true*/
    children.unshift(this.node(CompositeTag, 'a', text, {"class": "hide-link", "href": "javascript:;"}));
  }

  return this.node(CompositeTag, 'div', children, {"class": "hide-close"});
};

BbtagParser.prototype.parsePre = function() {
  return this.node(VerbatimText, this.body);
};

BbtagParser.prototype.parseCompare = function() {
  var pros = this.node(CompositeTag, 'ul', [], {"class": "balance__list"});
  var cons = this.node(CompositeTag, 'ul', [], {"class": "balance__list"});

  var parts = this.body.split(/\n+/);
  for (var i = 0; i < parts.length; i++) {
    var item = parts[i];
    if (!item) continue;
    var content = new BodyParser(item.slice(1), this.options).parse();
    if (item[0] == '+') {
      pros.appendChild(this.node(CompositeTag, 'li', content, {'class': 'plus'}));
    } else if (item[0] == '-') {
      cons.appendChild(this.node(CompositeTag, 'li', content, {'class': 'minus'}));
    } else {
      return new ErrorTag('div', 'compare items should start with either + or -');
    }
  }

  var balance = this.node(CompositeTag, 'div', [], {'class': 'balance__content'});

  var balanceAttrs = {
    'class': 'balance'
  };

  var title = pros.hasChildren() && cons.hasChildren();
  if (!title) {
    balanceAttrs['class'] += ' balance_single';
  }

  if (pros.hasChildren()) {
    if (title) pros.prependChild(this.node(TagNode, 'h3', 'Достоинства', {'class': 'balance__title'}));
    balance.appendChild(this.node(CompositeTag, 'div', [pros], {'class': 'balance__pluses'}));
  }

  if (cons.hasChildren()) {
    if (title) cons.prependChild(this.node(TagNode, 'h3', 'Недостатки', {'class': 'balance__title'}));
    balance.appendChild(this.node(CompositeTag, 'div', [cons], {'class': 'balance__minuses'}));
  }
  return this.node(CompositeTag, 'div', [balance], balanceAttrs);
};

BbtagParser.prototype.parseOnline = function() {
  if (!this.options.export) {
    var parser = new BodyParser(this.body, this.options);
    return parser.parse();
  } else {
    return this.node("");
  }
};

BbtagParser.prototype.paramRequiredError = function(errorTag, paramName) {
  return new ErrorTag(errorTag, this.name + ": attribute required " + paramName);
};

BbtagParser.prototype.parseImg = function() {

  if (!this.params.src) {
    return this.paramRequiredError('div', 'src');
  }

  var attrs = this.trusted ? _.clone(this.params) : _.pick(this.params, ['src', 'width', 'height']);

  attrs.src = this.normalizeSrc(attrs.src);

  return this.node(ImgTag, attrs, this.token.isFigure);
};


BbtagParser.prototype.parseExample = function() {
  if (!this.params.src) {
    return this.paramRequiredError('div', 'src');
  }

  var attrs = {
    'class':        'result__iframe',
    'data-trusted': this.trusted ? '1' : '0'
  };

  attrs['data-demo-height'] = this.params.height || 350;

  attrs['data-src'] = this.normalizeSrc(this.params.src);

  attrs.src = "/example" + attrs['data-src'];

  if (this.params.zip) {
    attrs['data-zip'] = "1";
  }

  return this.node(TagNode, "iframe", "", attrs);
};

