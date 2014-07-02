const Parser = require('./parser').Parser;
const BodyParser = require('./bodyParser').BodyParser;
const BbtagAttrsParser = require('./bbtagAttrsParser').BbtagAttrsParser;
const consts = require('../consts');
const util = require('util');
const TextNode = require('../node/textNode').TextNode;
const TagNode = require('../node/tagNode').TagNode;
const EscapedTag = require('../node/escapedTag').EscapedTag;
const ErrorTag = require('../node/errorTag').ErrorTag;
const UnresolvedLinkNode = require('../node/unresolvedLinkNode').UnresolvedLinkNode;

/**
 * Parser creates node objects from general text.
 * Node attrs will *not* be checked by sanitizers, they can contain anything like `onclick=`
 * This provides maximal freedom to the parser.
 *
 * Parser knows about current trust mode, so it must make sure that these attributes are safe.
 *
 * @constructor
 */
function BbtagParser(name, attrs, body, options) {
  Parser.call(this, options);
  this.name = name;
  this.attrs = attrs;
  this.body = body;

  this.params = this.parseAttrs(attrs);
}

util.inherits(BbtagParser, Parser);

BbtagParser.prototype.parseAttrs = function() {
  var parser = new BbtagAttrsParser(this.attrs);
  return parser.parse();
};

BbtagParser.prototype.parse = function() {

  if (consts.BBTAGS_BLOCK_SET[this.name]) {
    return this.parseBlock();
  }

  if (consts.BBTAGS_SOURCE_SET[this.name]) {
    return this.parseSource();
  }

  var methodName = 'parse' + name[0].toUpperCase() + name.slice(1);
  var method = this[methodName];

  if (!method) {
    throw new Error("Unknown bbtag: " + this.name);
  }

  return method.call(this);

};

BbtagParser.prototype.parseOffline = function() {
  if (this.options.export) {
    return new BodyParser(this.body, this.subOpts()).parse();
  } else {
    return new TextNode("");
  }
};


BbtagParser.prototype.parseOnline = function() {
  if (!this.options.export) {
    return new BodyParser(this.body, this.subOpts()).parse();
  } else {
    return new TextNode("");
  }
};

BbtagParser.prototype.paramRequired = function(errorTag, paramName) {
  return new ErrorTag.new(errorTag, this.name + ": attribute required " + paramName)
};

BbtagParser.prototype.parseExample = function() {
  if (!this.params['src']) {
    return this.paramRequired('div', 'src');
  }

  // TODO
};
/*
  this.
    def bbtag_example
      return param_required(:div, "src") unless @params['src']

      options = {
          'class' => 'result__iframe',
          'data-trusted' => @trusted ? '1' : '0'
      }

      if @params['height']
        options['data-demo-height'] = @params['height']
      else
        options['data-demo-height'] = '350'
      end

      #options['src'] = prefix_relative_src(@params['src']) + "/"

      begin
        plunk_id = read_plunk_id(@params['src'])
        options['data-play'] = plunk_id
      rescue => e
        return Node::ErrorTag.new(:div, "#{@bbtag}: нет такой песочницы #{@params['src']}")
      end

      options['src'] = "http://embed.plnkr.co/#{plunk_id}/preview"

      options['data-zip'] = "1" if @params['zip']

      Node::Tag.new(:iframe, "", options)

    end

def bbtag_offline
if top.export
  BodyParser.new(@text, sub_opts).parse
else
Node::Text.new("")
end
end

  */