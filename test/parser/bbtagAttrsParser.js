var BbtagAttrsParser = require('../../parser/bbtagAttrsParser');

var should = require('should');

describe("BbtagAttrsParser", function() {

  beforeEach(function() {
    var title = this.currentTest.title;
    this.currentTest.result = new BbtagAttrsParser(title).parse();
  });


  describe('parse', function() {

    it("name=value", function() {
      this.test.result.should.be.eql({ name: 'value' });
    });

    it("name='value with spaces'", function() {
      this.test.result.should.be.eql({ name: 'value with spaces' });
    });

    it("name=\"value with spaces\"", function() {
      this.test.result.should.be.eql({ name: 'value with spaces' });
    });

    it("name1 name2", function() {
      this.test.result.should.be.eql({ name1: true, name2: true });
    });

    it("hide 'something heavy'", function() {
      this.test.result.should.be.eql({ hide: true, 'something heavy': true });
    });

  });

});
