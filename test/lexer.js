const Lexer = require('../parser/Lexer').Lexer;

const should = require('should');

describe("Lexer", function() {

  beforeEach(function() {
    var title = this.currentTest.title;
    this.currentTest.parser = new Lexer(title);
  });

  describe('consumeBbtagNeedClose', function() {

    it("[js]body[/js]", function() {
      var bbtag = this.test.parser.consumeBbtagNeedClose();
      bbtag.should.be.eql({ bbtagName: 'js', bbtagAttrs: '', bbtagBody: 'body' });
      this.test.parser.isEof().should.be.true;
    });

    it("[js attrs]body[/js]", function() {
      var bbtag = this.test.parser.consumeBbtagNeedClose();
      bbtag.should.be.eql({ bbtagName: 'js', bbtagAttrs: ' attrs', bbtagBody: 'body' });
      this.test.parser.isEof().should.be.true;
    });

    it("[js '[]']body[/js]", function() {
      var bbtag = this.test.parser.consumeBbtagNeedClose();
      bbtag.should.be.eql({ bbtagName: 'js', bbtagAttrs: " '[]'", bbtagBody: 'body' });
      this.test.parser.isEof().should.be.true;
    });

    it("[js/]", function() {
      var bbtag = this.test.parser.consumeBbtagNeedClose();
      bbtag.should.be.eql({ bbtagName: 'js', bbtagAttrs: "", bbtagBody: '' });
      this.test.parser.isEof().should.be.true;
    });

  });

  describe('consumeBbtagSelfClose', function() {

    it("[task]", function() {
      var bbtag = this.test.parser.consumeBbtagSelfClose();
      bbtag.should.be.eql({ bbtagName: 'task', bbtagAttrs: '' });
      this.test.parser.isEof().should.be.true;
    });

    it("[task attrs]body[/task]", function() {
      var bbtag = this.test.parser.consumeBbtagSelfClose();
      bbtag.should.be.eql({ bbtagName: 'task', bbtagAttrs: ' attrs' });
      this.test.parser.position.should.eql(12);
    });

  });

  describe('consumeLink', function() {

    it("[text](href)", function() {
      var bbtag = this.test.parser.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'text' });
      this.test.parser.isEof().should.be.true;
    });

    it("[many words](href)", function() {
      var bbtag = this.test.parser.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'many words' });
      this.test.parser.isEof().should.be.true;
    });

    it('[many words](words not allowed)', function() {
      var bbtag = this.test.parser.consumeLink();
      should.not.exist(bbtag);
      this.test.parser.position.should.eql(0);
    });

    it('[many words]("anything ()")', function() {
      var bbtag = this.test.parser.consumeLink();
      bbtag.should.be.eql({ href: 'anything ()', title: 'many words' });
      this.test.parser.isEof().should.be.true;
    });

    it('[no href]', function() {
      var bbtag = this.test.parser.consumeLink();
      should.not.exist(bbtag);
      this.test.parser.position.should.eql(0);
    });

    it('["quoted string"](href)', function() {
      var bbtag = this.test.parser.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'quoted string' });
      this.test.parser.isEof().should.be.true;
    });

    it('["quoted []"](href)', function() {
      var bbtag = this.test.parser.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'quoted []' });
      this.test.parser.isEof().should.be.true;
    });

    it('["quoted \\"[]\\""](href)', function() {
      var bbtag = this.test.parser.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'quoted "[]"' });
      this.test.parser.isEof().should.be.true;
    });

    
  });

  describe("consumeCode", function() {

    it('`my code`', function() {
      this.test.parser.consumeCode().should.be.eql({ code: 'my code' });
      this.test.parser.isEof().should.be.true;
    });

  });

  describe("consumeComment", function() {

    it('<!--comment-->', function() {
      this.test.parser.consumeComment().should.be.eql({ comment: 'comment' });
      this.test.parser.isEof().should.be.true;
    });

    it('<!---->', function() {
      this.test.parser.consumeComment().should.be.eql({ comment: '' });
      this.test.parser.isEof().should.be.true;
    });

    it('<!--->', function() {
      should.not.exist(this.test.parser.consumeComment());
      this.test.parser.position.should.eql(0);
    });

  });

  describe("consumeVerbatimTag", function() {

    it('<script>test</script>', function() {
      this.test.parser.consumeVerbatimTag().should.be.eql(
        {verbatim: this.test.title}
      );
    });

  });

  describe("consumeBoldItalic", function() {

    it('*italic*', function() {
      this.test.parser.consumeBoldItalic().should.be.eql({italic: 'italic'});
      this.test.parser.isEof().should.be.true;
    });

    it('*italic*', function() {
      this.test.parser.consumeBoldItalic().should.be.eql({italic: 'italic'});
      this.test.parser.isEof().should.be.true;
    });

    it("'*' (*) '**' (**)", function() {
      should.not.exist(this.test.parser.consumeBoldItalic());
      this.test.parser.position.should.eql(0);
    });

    it("**a * b**", function() {
      this.test.parser.consumeBoldItalic().should.be.eql({bold: 'a * b'});
      this.test.parser.isEof().should.be.true;
    });

    it("*a * b*", function() {
      this.test.parser.consumeBoldItalic().should.be.eql({italic: 'a * b'});
      this.test.parser.isEof().should.be.true;
    });

  });

});