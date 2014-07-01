const Lexer = require('../parser/lexer').Lexer;

const should = require('should');

describe("Lexer", function() {

  beforeEach(function() {
    var title = this.currentTest.title;
    this.currentTest.lexer = new Lexer(title);
  });

  describe('consumeBbtagNeedClose', function() {

    it("[js]body[/js]", function() {
      var bbtag = this.test.lexer.consumeBbtagNeedClose();
      bbtag.should.be.eql({ bbtagName: 'js', bbtagAttrs: '', bbtagBody: 'body' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[js attrs]body[/js]", function() {
      var bbtag = this.test.lexer.consumeBbtagNeedClose();
      bbtag.should.be.eql({ bbtagName: 'js', bbtagAttrs: ' attrs', bbtagBody: 'body' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[js '[]']body[/js]", function() {
      var bbtag = this.test.lexer.consumeBbtagNeedClose();
      bbtag.should.be.eql({ bbtagName: 'js', bbtagAttrs: " '[]'", bbtagBody: 'body' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[js/]", function() {
      var bbtag = this.test.lexer.consumeBbtagNeedClose();
      bbtag.should.be.eql({ bbtagName: 'js', bbtagAttrs: "", bbtagBody: '' });
      this.test.lexer.isEof().should.be.true;
    });

  });

  describe('consumeBbtagSelfClose', function() {

    it("[task]", function() {
      var bbtag = this.test.lexer.consumeBbtagSelfClose();
      bbtag.should.be.eql({ bbtagName: 'task', bbtagAttrs: '' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[task attrs]body[/task]", function() {
      var bbtag = this.test.lexer.consumeBbtagSelfClose();
      bbtag.should.be.eql({ bbtagName: 'task', bbtagAttrs: ' attrs' });
      this.test.lexer.position.should.eql(12);
    });

  });

  describe('consumeLink', function() {

    it("[text](href)", function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'text' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[many words](href)", function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'many words' });
      this.test.lexer.isEof().should.be.true;
    });

    it('[many words](words not allowed)', function() {
      var bbtag = this.test.lexer.consumeLink();
      should.not.exist(bbtag);
      this.test.lexer.position.should.eql(0);
    });

    it('[many words]("anything ()")', function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ href: 'anything ()', title: 'many words' });
      this.test.lexer.isEof().should.be.true;
    });

    it('[no href]', function() {
      var bbtag = this.test.lexer.consumeLink();
      should.not.exist(bbtag);
      this.test.lexer.position.should.eql(0);
    });

    it('["quoted string"](href)', function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'quoted string' });
      this.test.lexer.isEof().should.be.true;
    });

    it('["quoted []"](href)', function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'quoted []' });
      this.test.lexer.isEof().should.be.true;
    });

    it('["quoted \\"[]\\""](href)', function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ href: 'href', title: 'quoted "[]"' });
      this.test.lexer.isEof().should.be.true;
    });

    
  });

  describe("consumeCode", function() {

    it('`my code`', function() {
      this.test.lexer.consumeCode().should.be.eql({ code: 'my code' });
      this.test.lexer.isEof().should.be.true;
    });

  });

  describe("consumeComment", function() {

    it('<!--comment-->', function() {
      this.test.lexer.consumeComment().should.be.eql({ comment: 'comment' });
      this.test.lexer.isEof().should.be.true;
    });

    it('<!---->', function() {
      this.test.lexer.consumeComment().should.be.eql({ comment: '' });
      this.test.lexer.isEof().should.be.true;
    });

    it('<!--->', function() {
      should.not.exist(this.test.lexer.consumeComment());
      this.test.lexer.position.should.eql(0);
    });

  });

  describe("consumeVerbatimTag", function() {

    it('<script>test</script>', function() {
      this.test.lexer.consumeVerbatimTag().should.be.eql(
        {verbatim: this.test.title}
      );
    });

  });

  describe('consumeHeader', function() {
    it('## My header', function() {
      this.test.lexer.consumeHeader().should.be.eql({level: 2, title: 'My header'});
      this.test.lexer.isEof().should.be.true;
    });

  });

  describe("consumeBoldItalic", function() {

    it('*italic*', function() {
      this.test.lexer.consumeBoldItalic().should.be.eql({italic: 'italic'});
      this.test.lexer.isEof().should.be.true;
    });

    it('*italic*', function() {
      this.test.lexer.consumeBoldItalic().should.be.eql({italic: 'italic'});
      this.test.lexer.isEof().should.be.true;
    });

    it("'*' (*) '**' (**)", function() {
      should.not.exist(this.test.lexer.consumeBoldItalic());
      this.test.lexer.position.should.eql(0);
    });

    it("**a * b**", function() {
      this.test.lexer.consumeBoldItalic().should.be.eql({bold: 'a * b'});
      this.test.lexer.isEof().should.be.true;
    });

    it("*a * b*", function() {
      this.test.lexer.consumeBoldItalic().should.be.eql({italic: 'a * b'});
      this.test.lexer.isEof().should.be.true;
    });

  });

});