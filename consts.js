
function arrToObj(arr) {
  var result = {};
  for (var i = 0; i < arr.length; i++) {
    result[arr[i]] = true;
  }
  return result;
}

// Теги, которые допускаются НЕ в trusted-режиме
var SAFE_TAGS = "a abbr acronym address em i b strong u strike cite blockquote code kbd tt ul ol li dl dt dd br hr pre img figure h1 h2 h3 h4 h5 h6 hgroup p div span sub sup table th td caption tr tbody thead tfoot".split(' ');
var SAFE_TAGS_SET = arrToObj(SAFE_TAGS);

// Теги, которые не нужно оборачивать в <p>
var NO_WRAP_TAGS = "h1 h2 h3 h4 h5 h6 hgroup ol ul li dl dd dt p div blockquote pre br hr canvas table td tr th tbody tfoot caption figure audio canvas embed iframe form fieldset script style object".split(" ");
var NO_WRAP_TAGS_SET = arrToObj(NO_WRAP_TAGS);

var NO_WRAP_TAGS_REG = new RegExp('(?:' + NO_WRAP_TAGS.join('|') + ')', 'gim');

// not the same as in Ruby (!)
var ATTRS_REG = /('[^']*'|"[^"]*"|[^'">])*/ig;

var VERBATIM_TAGS = "script style object embed video audio pre".split(' ');
var VERBATIM_TAGS_SET = arrToObj(VERBATIM_TAGS);

var BBTAGS_SOURCE = "html js txt css http coffee java php ruby scss sql".split(' ');
var BBTAGS_SOURCE_SET = arrToObj(BBTAGS_SOURCE);

var BBTAGS_BLOCK = "ponder smart warn".split(' ');
var BBTAGS_BLOCK_SET = arrToObj(BBTAGS_BLOCK);

var BBTAGS_NEED_CLOSE = "online offline head edit libs summary quote unsafe_test hide pre compare".split(' ')
  .concat(BBTAGS_SOURCE, BBTAGS_BLOCK);
var BBTAGS_NEED_CLOSE_SET = arrToObj(BBTAGS_NEED_CLOSE);

var BBTAGS_SELF_CLOSE = "cut importance key demo ref iframe example".split(' ');
var BBTAGS_SELF_CLOSE_SET = arrToObj(BBTAGS_SELF_CLOSE);

var BBTAGS_ALL = BBTAGS_NEED_CLOSE.concat(BBTAGS_SELF_CLOSE);

var BBTAG_BLOCK_DEFAULT_TITLE = {
  smart: 'На заметку:',
  ponder: 'Вопрос:',
  warn: 'Важно:'
};

var HREF_PROTOCOL_REG = /^([^\/#]*?)(?:\:|&#0*58|&#x0*3a)/;


module.exports = {
  SAFE_TAGS: SAFE_TAGS,
  SAFE_TAGS_SET: SAFE_TAGS_SET,
  NO_WRAP_TAGS: NO_WRAP_TAGS,
  NO_WRAP_TAGS_SET: NO_WRAP_TAGS_SET,
  NO_WRAP_TAGS_REG: NO_WRAP_TAGS_REG,
  ATTRS_REG: ATTRS_REG,
  VERBATIM_TAGS: VERBATIM_TAGS,
  VERBATIM_TAGS_SET: VERBATIM_TAGS_SET,
  BBTAGS_SOURCE: BBTAGS_SOURCE,
  BBTAGS_SOURCE_SET: BBTAGS_SOURCE_SET,
  BBTAGS_BLOCK: BBTAGS_BLOCK,
  BBTAGS_BLOCK_SET: BBTAGS_BLOCK_SET,
  BBTAGS_NEED_CLOSE: BBTAGS_NEED_CLOSE,
  BBTAGS_SELF_CLOSE: BBTAGS_SELF_CLOSE,
  BBTAGS_ALL: BBTAGS_ALL,
  BBTAGS_NEED_CLOSE_SET: BBTAGS_NEED_CLOSE_SET,
  BBTAGS_SELF_CLOSE_SET: BBTAGS_SELF_CLOSE_SET,
  BBTAG_BLOCK_DEFAULT_TITLE: BBTAG_BLOCK_DEFAULT_TITLE,
  HREF_PROTOCOL_REG: HREF_PROTOCOL_REG
};

