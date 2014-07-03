const BodyParser = require('../../parser/bodyParser').BodyParser;
const ToStructureWalker = require('../../treeWalker/toStructureWalker').ToStructureWalker;
const path = require('path');
const should = require('should');
const util = require('util');

function show(result) {
  console.log(util.inspect(toStructure(result), {depth: 10}));
}

function toStructure(result) {
  return new ToStructureWalker(result).toStructure();
}

describe("BodyParser", function() {

  var options = {
    resourceFsRoot:  path.join(__dirname, 'document'),
    resourceWebRoot: '/document',
    trusted:         true
  };

  describe('parse', function() {

    it("*italic* text", function *() {
      var parser = new BodyParser(this.test.title, options);
      var result = yield parser.parse();
      var structure = new ToStructureWalker(result).toStructure();
      structure.should.be.eql([
          {
            type:     'composite',
            tag:      'em',
            children: [
              { type: 'text', text: 'italic' }
            ]
          },
          {
            type: 'text',
            text: ' text'
          }
        ]
      );
    });

    it("[img src='html6.jpg'] text", function *() {
      var parser = new BodyParser(this.test.title, options);
      var result = yield parser.parse();
      var structure = new ToStructureWalker(result).toStructure();
      structure.should.be.eql([
        {
          type: 'tag',
          tag: 'img',
          attrs: {
            src: '/document/html6.jpg', width: 256, height: 256
          }
        },
        { type: 'text', text: ' text' }
      ]);
    });



    it("[online] text *in* [/online] out", function *() {
      var parser = new BodyParser(this.test.title, options);
      var result = yield parser.parse();
      toStructure(result).should.be.eql([
          { type: 'text', text: ' text ' },
          { type:     'composite',
            tag:      'em',
            children: [
              { type: 'text', text: 'in' }
            ]
          },
          { type: 'text', text: '  out' }
        ]
      )
    });

  });

});