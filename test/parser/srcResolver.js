/* moved to async transformers

var SrcResolver = require('.././srcResolver').ResourceResolver;
var should = require('should');
var path = require('path');

describe("ResourceResolver", function() {

  var options = {
    resourceFsRoot:  path.join(__dirname, 'document'),
    resourceWebRoot: '/document'
  };

  var srcResolver = new SrcResolver("html6.jpg", options);

  describe("getFsPath", function() {

    it("returns file path from resourceFsRoot", function() {
      var fsPath = srcResolver.getFsPath();
      fsPath.should.be.eql(path.join(__dirname, 'document', 'html6.jpg'));
    });

  });

  describe("getWebPath", function() {

    it("returns file path from resourceWebRoot", function() {
      var webPath = srcResolver.getWebPath();
      webPath.should.be.eql(path.join('/document', 'html6.jpg'));
    });

  });

  describe("resolveImage", function() {

    it("returns image size", function* () {
      var image = yield srcResolver.resolveImage(true);
      image.size.should.be.eql({ width: 256, height: 256 });
    });

    it("throws if no such file", function* () {
      var resolver = new SrcResolver("no-such-file.jpg", options);
      var caught = false;
      try {
        yield resolver.resolveImage(true);
      } catch(e) {
        caught = true;
      }
      if (!caught) throw new Error("Must be error");
    });

  });

});

  */
