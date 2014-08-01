var BbtagAttrsLexer = require('../../parser/bbtagAttrsLexer');

var should = require('should');

describe("BbtagAttrsLexer", function() {

  beforeEach(function() {
    var title = this.currentTest.title;
    this.currentTest.lexer = new BbtagAttrsLexer(title);
  });

  describe('consumeName', function() {

    it("attrName=", function() {
      var name = this.test.lexer.consumeName();
      name.should.be.eql({ type: 'name', body:'attrName'});
    });

    it("=attrValue", function() {
      var eq = this.test.lexer.consumeEq();
      eq.should.be.eql({ type: 'eq' });
    });

    it("attrValue ", function() {
      var eq = this.test.lexer.consumeValue();
      eq.should.be.eql({ type: 'value', body: 'attrValue' });
    });

  });

});
