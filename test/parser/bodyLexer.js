const BodyLexer = require('../../parser/bodyLexer').BodyLexer;

const should = require('should');

describe("BodyLexer", function() {

  beforeEach(function() {
    var title = this.currentTest.title;
    this.currentTest.lexer = new BodyLexer(title);
  });

  describe('consumeBbtagNeedClose', function() {

    it("[js]body[/js]", function() {
      var bbtag = this.test.lexer.consumeBbtagNeedClose();
      bbtag.should.be.eql({ type: 'bbtag', name:'js', attrs: '', body: 'body' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[js attrs]body[/js]", function() {
      var bbtag = this.test.lexer.consumeBbtagNeedClose();
      bbtag.should.be.eql({ type: 'bbtag', name: 'js', attrs: ' attrs', body: 'body' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[js '[]']body[/js]", function() {
      var bbtag = this.test.lexer.consumeBbtagNeedClose();
      bbtag.should.be.eql({ type: 'bbtag', name: 'js', attrs: " '[]'", body: 'body' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[js/]", function() {
      var bbtag = this.test.lexer.consumeBbtagNeedClose();
      bbtag.should.be.eql({ type: 'bbtag', name: 'js', attrs: "", body: '' });
      this.test.lexer.isEof().should.be.true;
    });

  });

  describe('consumeBbtagSelfClose', function() {

    it("[task]", function() {
      var bbtag = this.test.lexer.consumeBbtagSelfClose();
      bbtag.should.be.eql({ type: 'bbtag', name: 'task', attrs: '', body: '' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[task-with-more-words-should-not-match]", function() {
      var bbtag = this.test.lexer.consumeBbtagSelfClose();
      should.not.exist(bbtag);
      this.test.lexer.position.should.eql(0);
    });

    it("[task attrs]body[/task]", function() {
      var bbtag = this.test.lexer.consumeBbtagSelfClose();
      bbtag.should.be.eql({ type: 'bbtag', name: 'task', attrs: ' attrs', body: '' });
      this.test.lexer.position.should.eql(12);
    });

  });

  describe('consumeLink', function() {

    it("[text](href)", function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ type: 'link', href: 'href', title: 'text' });
      this.test.lexer.isEof().should.be.true;
    });

    it("[many words](href)", function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ type: 'link', href: 'href', title: 'many words' });
      this.test.lexer.isEof().should.be.true;
    });

    it('[many words](words not allowed)', function() {
      var bbtag = this.test.lexer.consumeLink();
      should.not.exist(bbtag);
      this.test.lexer.position.should.eql(0);
    });

    it('[many words]("anything ()")', function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ type: 'link', href: 'anything ()', title: 'many words' });
      this.test.lexer.isEof().should.be.true;
    });

    it('[no href]', function() {
      var bbtag = this.test.lexer.consumeLink();
      should.not.exist(bbtag);
      this.test.lexer.position.should.eql(0);
    });

    it('["quoted string"](href)', function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ type: 'link', href: 'href', title: 'quoted string' });
      this.test.lexer.isEof().should.be.true;
    });

    it('["quoted []"](href)', function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ type: 'link', href: 'href', title: 'quoted []' });
      this.test.lexer.isEof().should.be.true;
    });

    it('["quoted \\"[]\\""](href)', function() {
      var bbtag = this.test.lexer.consumeLink();
      bbtag.should.be.eql({ type: 'link', href: 'href', title: 'quoted "[]"' });
      this.test.lexer.isEof().should.be.true;
    });

    
  });

  describe("consumeCode", function() {

    it('`my code`', function() {
      this.test.lexer.consumeCode().should.be.eql({ type: 'code', body: 'my code' });
      this.test.lexer.isEof().should.be.true;
    });

  });

  describe("consumeComment", function() {

    it('<!--comment \n multiline-->', function() {
      this.test.lexer.consumeComment().should.be.eql({ type: 'comment', body: 'comment \n multiline' });
      this.test.lexer.isEof().should.be.true;
    });

    it('<!---->', function() {
      this.test.lexer.consumeComment().should.be.eql({ type: 'comment', body: '' });
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
        {type: 'verbatim', body: this.test.title}
      );
      this.test.lexer.isEof().should.be.true;
    });

    it('<script with attrs="blabla">test</script>', function() {
      this.test.lexer.consumeVerbatimTag().should.be.eql(
        {type: 'verbatim', body: this.test.title}
      );
      this.test.lexer.isEof().should.be.true;
    });

    // behavior broken by design
    //
    // HTML spec allows an attr value to contain "</script>",
    // so this tag should parse as a whole,
    // but the current lexer is not perfect, it will parse only a part of it
    it('<script attrs="</script>">test</script>', function() {
      this.test.lexer.consumeVerbatimTag().should.be.eql(
        {type:'verbatim', body: '<script attrs="</script>'}
      );
      this.test.lexer.isEof().should.be.false;
    });

  });

  describe('consumeHeader', function() {
    it('## My header', function() {
      this.test.lexer.consumeHeader().should.be.eql({type: 'header', anchor: '', level: 2, title: 'My header'});
      this.test.lexer.isEof().should.be.true;
    });

    it('## My header [#anchor]', function() {
      this.test.lexer.consumeHeader().should.be.eql({type: 'header', anchor: 'anchor', level: 2, title: 'My header'});
      this.test.lexer.isEof().should.be.true;
    });

  });

  describe("consumeBold", function() {

    it('**bold**', function() {
      this.test.lexer.consumeBold().should.be.eql({type: 'bold', body: 'bold'});
      this.test.lexer.isEof().should.be.true;
    });


    it("'**' (**)", function() {
      while(!this.test.lexer.isEof()) {
        should.not.exist(this.test.lexer.consumeBold());
        this.test.lexer.consumeChar();
      }
    });

    it("**a * b**", function() {
      this.test.lexer.consumeBold().should.be.eql({type:'bold', body: 'a * b'});
      this.test.lexer.isEof().should.be.true;
    });

  });

  describe("consumeBoldItalic", function() {

    it('*italic*', function() {
      this.test.lexer.consumeItalic().should.be.eql({type: 'italic', body: 'italic'});
      this.test.lexer.isEof().should.be.true;
    });

    it('**bold**', function() {
      this.test.lexer.consumeBold().should.be.eql({type: 'bold', body: 'bold'});
      this.test.lexer.isEof().should.be.true;
    });


    it('*test*my', function() {
      should.not.exist(this.test.lexer.consumeItalic());
    });


    it("'*' (*) '**' (**)", function() {
      while(!this.test.lexer.isEof()) {
        should.not.exist(this.test.lexer.consumeBold());
        should.not.exist(this.test.lexer.consumeItalic());
        this.test.lexer.consumeChar();
      }
    });

    it("**a * b**", function() {
      this.test.lexer.consumeBold().should.be.eql({type:'bold', body: 'a * b'});
      this.test.lexer.isEof().should.be.true;
    });

    it("*a * b*", function() {
      this.test.lexer.consumeItalic().should.be.eql({type: 'italic', body: 'a * b'});
      this.test.lexer.isEof().should.be.true;
    });

  });

});