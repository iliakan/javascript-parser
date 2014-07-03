const BodyParser = require('../../parser/bodyParser').BodyParser;
const ToStructureWalker = require('../../treeWalker/toStructureWalker').ToStructureWalker;
const path = require('path');
const should = require('should');
const util = require('util');

describe("BodyParser", function() {

  var options = {
    resourceFsRoot:  path.join(__dirname, 'document'),
    resourceWebRoot: '/document',
    trusted: true
  };

  describe('parse', function() {

    it("*italic* text", function() {
      var parser = new BodyParser(this.test.title, options);
      var result = parser.parse();
      var structure = new ToStructureWalker(result).toStructure();
      structure.should.be.eql([
          {
            type: 'composite',
            tag: 'em',
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

  });

});