// DEPRECATED UNUSED
/*
function SrcResolver(src, options) {
  if (!options.resourceWebRoot) {
    throw new Error("resourceWebRoot is required");
  }

  this.src = src;
  this.options = options;
}

// this must ensure that src is safe and jailed
// as of now, only relative srcs are allowed
SrcResolver.prototype.cleanSrc = function() {
  return this.src.replace(/\.\./g, '').replace(/^\/+|\/+$/, '');
};

SrcResolver.prototype.getWebPath = function() {
  var src = this.cleanSrc();
  return this.options.resourceWebRoot + '/' + src;
};

exports.ResourceResolver = SrcResolver;

  */
