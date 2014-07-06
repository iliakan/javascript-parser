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
const CutNode = require('../node/cutNode').CutNode;
const CompositeTag = require('../node/compositeTag').CompositeTag;
const EscapedTag = require('../node/escapedTag').EscapedTag;
const ErrorTag = require('../node/errorTag').ErrorTag;
const UnresolvedLinkNode = require('../node/unresolvedLinkNode').UnresolvedLinkNode;
const SrcResolver = require('./srcResolver').SrcResolver;
const stripIndents = require('../util/source').stripIndents;
const extractHighlight = require('../util/source').extractHighlight;
const VerbatimText = require('../node/verbatimText').VerbatimText;

/**
 * Parser creates node objects from general text.
 * Node attrs will *not* be checked by sanitizers, they can contain anything like `onclick=`
 * This provides maximal freedom to the parser.
 *
 * Parser knows about current trust mode, so it must make sure that these attributes are safe.
 *
 * @constructor
 */
function BbtagParser(name, paramsString, body, options) {
  Parser.call(this, options);
  this.name = name;
  this.paramsString = paramsString;
  this.body = body;

  this.params = this.readParamsString();
}
util.inherits(BbtagParser, Parser);


BbtagParser.prototype.validateOptions = function(options) {

  if (!("trusted" in options)) {
    throw new Error("Must have trusted option");
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

BbtagParser.prototype.parseOffline = function *() {
  if (this.options.export) {
    return yield new BodyParser(this.body, this.subOpts()).parse();
  } else {
    return new TextNode("");
  }
};

BbtagParser.prototype.parseDemo = function *() {

  var attrs = {};
  if (this.params.src) {
    var resolver = new SrcResolver(this.params.src, this.options);

    attrs.href = resolver.getExamplePath();
    attrs.target = '_blank';
    return new TagNode('a', 'Демо в новом окне', attrs);
  }

  return new TagNode('button', "Запустить демо", {"onclick": 'runDemo(this)'});
};


BbtagParser.prototype.parseHead = function *() {
  if (this.trusted) {
    if (!this.options.metadata.head) this.options.metadata.head = [];

    this.options.metadata.head.push(this.body);
  }
  return new TextNode('');
};

// use object for libs, because they are
// (1) unique
// (2) keep order
BbtagParser.prototype.parseLibs = function *() {
  if (this.trusted) {
    var lines = this.body.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var lib = lines[i].trim();
      if (!lib) continue;
      if (!this.options.metadata.libs) this.options.metadata.libs = {};
      this.options.metadata.libs[lib] = true;
    }
  }
  return new TextNode('');
};

BbtagParser.prototype.parseImportance = function *() {
  if (this.trusted) {
    this.options.metadata.importance = parseInt(this.paramsString);
  }
  return new TextNode('');
};

BbtagParser.prototype.parsePlay = function *() {
  if (!this.params.src) {
    return this.paramRequiredError('span', 'src');
  }

  var resolver = new SrcResolver(this.params.src, this.options);

  var attrs = {
    href: resolver.getExamplePath()
  };

  return new TagNode('a', this.body, attrs);
};

BbtagParser.prototype.parseEdit = function *() {
  if (!this.params.src) {
    return this.paramRequiredError('span', 'src');
  }


  var resolver = new SrcResolver(this.params.src, this.options);

  var plunkId;
  try {
    plunkId = yield resolver.readPlunkId();
  } catch (e) {
    return new ErrorTag('span', 'edit: ' + e.message);
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
    href: "http://plnkr.co/edit/" + plunkId + "?p=preview"
  };

  return new TagNode('a', body, attrs);
};

BbtagParser.prototype.parseCut = function *() {
  return new CutNode();
};

BbtagParser.prototype.parseKey = function *() {
  var results = [];
  var keys = this.paramsString.trim();
  if (keys == "+") {
    return new TagNode('kbd', '+', {'class': 'shortcut'});
  }

  var plusLabel = Math.random();
  keys = keys.replace(/\+\+/g, '+'+plusLabel);
  keys = keys.split('+');

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    results.push(new TextNode((key == plusLabel) ? '+' : key));
    if (i < keys.length - 1) {
      results.push(new TagNode('span','+', {"class": "shortcut__plus"}));
    }
  }

  return new CompositeTag('kbd', results, {"class": "shortcut"});
};

BbtagParser.prototype.parseRef = function *() {
  if (!this.params.id) {
    return this.paramRequiredError('span', 'id');
  }

  var id = this.params.id;

  if (!this.options.metadata.refs) this.options.metadata.refs = {};
  if (this.options.metadata.refs[id]) {
    return new ErrorTag('div', 'ref: ссылка ' + id + ' уже есть');
  }

  this.options.metadata.refs[id] = true;

  return new TagNode('a', '', {"name": id});

};

BbtagParser.prototype.parseBlock = function *() {
  var content = yield new BodyParser(this.body, this.subOpts()).parse();

  content = [new CompositeTag('div', content, {'class': 'important__content'})];

  var children;
  if (this.params.header) {
    var headerContent =  yield new BodyParser(this.params.header, this.subOpts()).parse();
    children = [
      new TagNode('span', '', {'class': 'important__type'}),
      new CompositeTag('h3', headerContent, {'class': 'important__title'})
    ];
  } else {
    children = [
      new TagNode('span', consts.BBTAG_BLOCK_DEFAULT_TITLE[this.name], {'class': 'important__type'})
    ];
  }

  content.unshift(new CompositeTag('div', children, {'class' : 'important__header'}));

  return new CompositeTag('div', content, {'class':'important important_'+this.name});
};


BbtagParser.prototype.parseSource = function *() {

  var prismLanguageMap = {
    html: 'markup',
    js: 'javascript',
    txt: 'none',
    coffee: 'coffeescript'
  };

  var prismLanguage = prismLanguageMap[this.name] || this.name;

  var attrs =  {
        'class': "language-" + prismLanguage + " line-numbers",
        "data-trusted": (this.trusted && !this.params.untrusted) ? '1' : '0'
  };

  var body = this.body;

  if (this.params.src) {
    var resolver = new SrcResolver(this.params.src, this.options);

    try {
      body = yield resolver.readFile();
    } catch (e) {
      return new ErrorTag('div', e.message);
    }

  }

  // strip first empty lines
  body = stripIndents(body);

  var highlight = extractHighlight(body);
  if (highlight.block) {
    attrs['data-highlight-block'] = highlight.block;
  }
  if (highlight.inline) {
    attrs['data-highlight-inline'] = highlight.inline;
  }
  body = highlight.text;

  if (this.params.height) {
    attrs['data-demo-height'] = this.params.height;
  }

  if (this.params.autorun) {
    attrs['data-autorun'] = '1';
  }
  if (this.params.refresh) {
    attrs['data-refresh'] = '1';
  }
  if (this.params.run) {
    attrs['data-run'] = '1';
  }
  if (this.params.demo) {
    attrs['data-demo'] = '1';
  }

  if (this.params.hide) {
    attrs['data-hide'] = (this.params.hide === true) ? "" : this.params.hide;
    attrs['class'] += 'hide';
  }

  return new EscapedTag('pre', body, attrs);
};


BbtagParser.prototype.parseSummary = function *() {
  var summary = yield new BodyParser(this.body, this.subOpts()).parse();
  summary = new CompositeTag('div', summary, {'class' : 'summary__content'});

  return new CompositeTag('div', [summary], {'class': 'summary'});
};

BbtagParser.prototype.parseIframe = function *() {
  if (!this.params.src) {
    return this.paramRequiredError('div', 'src');
  }

  var attrs = {
    'class': 'result__iframe',
    'data-trusted': this.trusted ? '1' : '0'
  };

  if (this.params.height) {
    attrs['data-demo-height'] = this.params.height;
  }

  var resolver = new SrcResolver(this.params.src, this.options);

  try {
    attrs.src = yield resolver.getExamplePath();
    if (this.params.play) {
      attrs['data-play'] = yield resolver.readPlunkId();
    }
  } catch (e) {
    return new ErrorTag('div', 'iframe: ' + e.message);
  }

  if (this.params.link) {
    attrs['data-external'] = 1;
  }

  if (this.params.zip) {
    attrs['data-zip'] = 1;
  }

  return new TagNode('iframe', '', attrs);

};

BbtagParser.prototype.parseQuote = function *() {
  var children = yield new BodyParser(this.body, this.subOpts()).parse();

  if (this.params.author) {
    children.push( new TagNode('div', this.params.author, {'class':'quote-author'}) );
  }

  var result = new CompositeTag('div', children, {'class':'quote-author'});
  return new CompositeTag('div', [result], {'class': 'quote'});
};

BbtagParser.prototype.parseHide = function *() {
  var content = yield new BodyParser(this.body, this.subOpts()).parse();

  var children = [
      new CompositeTag('div', content, {"class": "hide-content"})
  ];

  if (this.params.text) {
    var text = yield new BodyParser(this.params.text, this.subOpts()).parse();

    /*jshint scripturl:true*/
    children.unshift(new CompositeTag('a', text,  {"class": "hide-link", "href": "javascript:;"}));
  }

  return new CompositeTag('div', children, {"class": "hide-close"});
};

BbtagParser.prototype.parsePre = function *() {
  return new VerbatimText(this.body);
};

BbtagParser.prototype.parseCompare = function *() {
  var pros = new CompositeTag('ul', [], {"class": "balance__list"});
  var cons = new CompositeTag('ul', [], {"class": "balance__list"});

  var parts = this.body.split(/\n+/);
  for (var i = 0; i < parts.length; i++) {
    var item = parts[i];
    if (!item) continue;
    var content = yield new BodyParser(item.slice(1), this.subOpts()).parse();
    if (item[0] == '+') {
      pros.appendChild( new CompositeTag('li', content, {'class':'plus'}) );
    } else if (item[0] == '-') {
      cons.appendChild( new CompositeTag('li', content, {'class':'minus'}) );
    } else {
      return new ErrorTag('div', 'compare items should start with either + or -');
    }
  }

  var balance = new CompositeTag('div', [], {'class': 'balance__content'});

  var balanceAttrs = {
    'class': 'balance'
  };

  var title = pros.hasChildren() && cons.hasChildren();
  if (!title) {
    balanceAttrs['class'] += ' balance_single';
  }

  if (pros.hasChildren()) {
    if (title) pros.prependChild( new TagNode('h3', 'Достоинства', {'class' : 'balance__title'}));
    balance.appendChild( new CompositeTag('div', [pros], {'class':'balance__pluses'}));
  }

  if (cons.hasChildren()) {
    if (title) cons.prependChild( new TagNode('h3', 'Недостатки', {'class' : 'balance__title'}));
    balance.appendChild( new CompositeTag('div', [cons], {'class':'balance__minuses'}));
  }
  return new CompositeTag('div', [balance], balanceAttrs);
};


BbtagParser.prototype.parseTask = function *() {
  if (!this.params.id) {
    return this.paramRequiredError('div', 'id');
  }

  return new TagNode('div', "TASK " + this.params.id);
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
  return new ErrorTag.new(errorTag, this.name + ": attribute required " + paramName);
};

BbtagParser.prototype.parseImg = function *() {
  if (!this.params.src) {
    return this.paramRequiredError('div', 'src');
  }

  var attrs = this.trusted ? _.clone(this.params) : {"src" : this.params.src };

  var resolver = new SrcResolver(this.params.src, this.options);

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
  if (!this.params.src) {
    return this.paramRequiredError('div', 'src');
  }

  var attrs = {
    'class': 'result__iframe',
    'data-trusted': this.trusted ? '1' : '0'
  };

  attrs['data-demo-height'] = this.params.height || 350;

  var resolver = new SrcResolver(this.params.src, this.options);

  var plunkId;
  try {
    plunkId = yield resolver.readPlunkId();
  } catch (e) {
    return new ErrorTag('div', 'example: ' + e.message);
  }

  attrs.src = "http://embed.plnkr.co/" + plunkId + "/preview";

  attrs['data-src'] = resolver.getExamplePath();

  if (this.params.zip) {
    attrs['data-zip'] = "1";
  }

  return new TagNode("iframe", "", attrs);
};



