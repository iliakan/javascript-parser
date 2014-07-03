const BodyParser = require('../../parser/bodyParser').BodyParser;
const path = require('path');
const should = require('should');

describe("BodyParser", function() {

  var options = {
    resourceFsRoot:  path.join(__dirname, 'document'),
    resourceWebRoot: '/document',
    trusted: true
  };

  describe('parse', function() {

    it("*italic* text", function() {
      var parser = new BodyParser(this.test.title, options);
      debugger;
      var result = parser.parse();
      console.log(JSON.stringify(result));
    });

  });

});