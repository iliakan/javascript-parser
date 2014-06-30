/**
 Типографер для замены символов и спецпоследовательностей,
 работает точечно, 
 (возможно нужно запускать до jsdom, так как некоторые последовательности типа -> <- могут ему не понравиться)
*/

function processCopymarks(text) {
  text = text.replace(/\([сСcC]\)(?=[^\.\,\;\:])/ig, '©');

  text = text.replace(/\(r\)/ig, '<sup>®</sup>');

  text = text.replace(/\(tm\)|\(тм\)/ig, '™');

  text = text.replace(/\(p\)/ig, '℗');

  return text;
}

function processHellip(text) {
  return text.replace(/.../g, '…');
}

function processPlusmin(text) {
  return text.replace(/[^+]\+\-/gi, '±');
}

function processDash(text) {
  return text.replace(/(\s|;)\-(\s)/gi, '$1–$2');
}

function processEmdash(text) {
  return text.replace(/(\s|;)\-\-(\s)/gi, '$1—$2');
}

function processArrows(text) {
  return text.replace(/<-/gi, '←').replace(/(\s)->/gi, '$1→');
}

// ie < 10, ie<10 -> ie&lt;10
function processLoneLt(text) {
  return text.replace(/<(?=[\s\d])/gi, '&lt;');
}


/* TODO:
  def replace_smiles(html)
  SMILES.each do |(regexp, file, alt)|
  html = html.gsub(regexp, %(<img src="/files/smiles/#{file}" alt="#{alt}">))
  end
*/


function charTypography(html) {
  html = processPlusmin(html);
  html = processArrows(html);
  html = processLoneLt(html);
  html = processCopymarks(html);
  html = processHellip(html);
  html = processDash(html);
  html = processEmdash(html);
  //html = replace_smiles(html);
  return html;
}

module.exports = charTypography;