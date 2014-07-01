
function arrToObj(arr) {
  var result = {};
  for (var i = 0; i < arr.length; i++) {
    result[arr[i]] = true;
  }
  return result;
}

// Теги, которые допускаются НЕ в trusted-режиме
const SAFE_TAGS = "a abbr acronym address em i b strong u strike cite blockquote code kbd tt ul ol li dl dt dd br hr pre img figure h1 h2 h3 h4 h5 h6 hgroup p div span sub sup table th td caption tr tbody thead tfoot".split(' ');
const SAFE_TAGS_SET = arrToObj(SAFE_TAGS);

// Теги, которые не нужно оборачивать в <p>
const NO_WRAP_TAGS = "h1 h2 h3 h4 h5 h6 hgroup ol ul li dl dd dt p div blockquote pre br hr canvas table td tr th tbody tfoot caption figure audio canvas embed iframe form fieldset script style object".split(" ");
const NO_WRAP_TAGS_SET = arrToObj(NO_WRAP_TAGS);

const NO_WRAP_TAGS_PAT = new RegExp('(?:' + NO_WRAP_TAGS.join('|') + ')', 'gim');

// not the same as in Ruby (!)
const ATTRS_PAT = /('[^']*'|"[^"]*"|[^'">])*/ig;

const VERBATIM_TAGS = "script style object embed video audio".split(' ');
const VERBATIM_TAGS_SET = arrToObj(VERBATIM_TAGS);

const BBTAGS_SOURCE = "html js txt css http coffee java php ruby scss sql".split(' ');
const BBTAGS_BLOCK = "ponder smart warn".split(' ');

const BBTAGS_NEED_CLOSE = "online offline head edit libs summary quote unsafe_test hide pre compare".split(' ')
  .concat(BBTAGS_SOURCE, BBTAGS_BLOCK);
const BBTAGS_NEED_CLOSE_SET = arrToObj(BBTAGS_NEED_CLOSE);

const BBTAGS_SELF_CLOSE = "cut key demo ref img iframe task example".split(' ');
const BBTAGS_SELF_CLOSE_SET = arrToObj(BBTAGS_SELF_CLOSE);

const BBTAGS_ALL = BBTAGS_NEED_CLOSE.concat(BBTAGS_SELF_CLOSE);

const BOLD_PAT = /\*\*((?=\S)(.*?\S))\*\*(?!\*)(?=\W|$)/gim;

const ITALIC_PAT = /\*((?=\S)(.*?\S))\*(?!\*)(?=\W|$)/gim;

// < script ... </ script >
const VERBATIM_TAGS_PAT = new RegExp('<\\s*' +
    '(' + VERBATIM_TAGS.join('|') + ')' +
    '(?=[^\\w-])([\\s\\S]*?)($|</\\s*\\1\\s*>)', 'gi'); // no multiline (!): $ is text

// matches "text \"embedded quote\" text"
const QUOTED_PAT = /"(?:\\.|[^"\\])*"/gim;
const SQUOTED_PAT = /'(?:\\.|[^'\\])*'/gim;


// матчит одну строку в двойных или одинарных кавычках
// ИЛИ ОДИН символ до ] вне кавычек
// Не много символов, так как [^'"\]]* приведёт
// к смерти от бектрекинга в случае QUOTED_OR_NO_BRACKET_PAT
const QUOTED_OR_NO_BRACKET_PAT = new RegExp(
    QUOTED_PAT.source + '|' + SQUOTED_PAT.source + '|[^\'"\\]]', 'gim'
);

// matches [text](href)
const LINK_PAT = new RegExp(
    '\\[(' + QUOTED_PAT.source + '|' + SQUOTED_PAT.source +
  '|[^\\]]*)\\]\\((' + QUOTED_PAT.source + '|' + SQUOTED_PAT.source + '|[^\\s\\)]*)\\)', 'gim'
);

const BBTAG_SELF_CLOSE_PAT = new RegExp(
    '\\[(' + BBTAGS_SELF_CLOSE.join('|') +
  ')(?=[^\\w-])((' + QUOTED_OR_NO_BRACKET_PAT.source + ')*)\\]', 'gim'
);

// сначала матчим [js/], а затем [js]...[/js]
// именно такой порядок, так как
// QUOTED_OR_NO_BRACKET_PAT сначала пытается матчить [js...] (съесть всё до ]) - не выходит
// поэтому он отступает назад и ест всё до /]
// если бы сначала матчили [js]...[/js], то QUOTED_OR_NO_BRACKET_PAT добавлял бы в attrs /
const BBTAG_NEED_CLOSE_EMPTY_PAT = new RegExp(('         \
\\[                                                     \
    (' + BBTAGS_NEED_CLOSE.join('|') + ')(?=[^\\w-])    \
    ((' + QUOTED_OR_NO_BRACKET_PAT.source + ')*)        \
/\\]').replace(/\s/g, ''), 'gim');

const BBTAG_NEED_CLOSE_BODY_PAT = new RegExp(('          \
\\[                                                     \
    (' + BBTAGS_NEED_CLOSE.join('|') + ')(?=[^\\w-])    \
    ((' + QUOTED_OR_NO_BRACKET_PAT.source + ')*)        \
\\]                                                     \
([.\\n]*?)                                              \
\\[/\\1\\]').replace(/\s/g, ''), 'gim');

const BBTAG_BLOCK_DEFAULT_TITLE = {
  smart: 'На заметку:',
  ponder: 'Вопрос:',
  warn: 'Важно:'
};

const HREF_PROTOCOL_PAT = /^([^\/#]*?)(?:\:|&#0*58|&#x0*3a)/gim;


module.exports = {
  SAFE_TAGS: SAFE_TAGS,
  SAFE_TAGS_SET: SAFE_TAGS_SET,
  NO_WRAP_TAGS: NO_WRAP_TAGS,
  NO_WRAP_TAGS_SET: NO_WRAP_TAGS_SET,
  NO_WRAP_TAGS_PAT: NO_WRAP_TAGS_PAT,
  ATTRS_PAT: ATTRS_PAT,
  VERBATIM_TAGS: VERBATIM_TAGS,
  VERBATIM_TAGS_SET: VERBATIM_TAGS_SET,
  BBTAGS_SOURCE: BBTAGS_SOURCE,
  BBTAGS_BLOCK: BBTAGS_BLOCK,
  BBTAGS_NEED_CLOSE: BBTAGS_NEED_CLOSE,
  BBTAGS_SELF_CLOSE: BBTAGS_SELF_CLOSE,
  BBTAGS_ALL: BBTAGS_ALL,
  BOLD_PAT: BOLD_PAT,
  ITALIC_PAT: ITALIC_PAT,
  VERBATIM_TAGS_PAT: VERBATIM_TAGS_PAT,
  QUOTED_PAT: QUOTED_PAT,
  SQUOTED_PAT: SQUOTED_PAT,
  QUOTED_OR_NO_BRACKET_PAT: QUOTED_OR_NO_BRACKET_PAT,
  LINK_PAT: LINK_PAT,
  BBTAGS_NEED_CLOSE_SET: BBTAGS_NEED_CLOSE_SET,
  BBTAGS_SELF_CLOSE_SET: BBTAGS_SELF_CLOSE_SET,
  BBTAG_SELF_CLOSE_PAT: BBTAG_SELF_CLOSE_PAT,
  BBTAG_NEED_CLOSE_EMPTY_PAT: BBTAG_NEED_CLOSE_EMPTY_PAT,
  BBTAG_NEED_CLOSE_BODY_PAT: BBTAG_NEED_CLOSE_BODY_PAT,
  BBTAG_BLOCK_DEFAULT_TITLE: BBTAG_BLOCK_DEFAULT_TITLE,
  HREF_PROTOCOL_PAT: HREF_PROTOCOL_PAT
};

