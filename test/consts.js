var consts = require('../consts');
var should = require('should');

// todo: cleanup, remove unused patterns
0 && describe("Patterns", function() {

  /**
   * Take constant consts[describe]
   * Matches against it
   *   this.test.firstMatch = deep first match
   *   this.test.matches = array of matches, not deep
   */
  beforeEach(function(){
    var text = this.currentTest.text = this.currentTest.title;
    var pattern = this.currentTest.pattern = consts[this.currentTest.parent.title];
    if (!pattern) {
      throw new Error("No pattern for " + this.currentTest.parent.title);
    }

    this.currentTest.firstMatch = pattern.exec(text);
    pattern.lastIndex = 0;

    var match;
    var matches = this.currentTest.matches = [];

    /* jshint -W084 */
    while(match = pattern.exec(text)) {
      if (match[0] === "") break; // sometimes match can be empty str cause of .*
      matches.push(match[0]);
    }

  });

  describe('ITALIC_PAT', function() {

    it('*JavaScript* *(обычный текст)*. Они не требуют *подготовки*.', function() {
      this.test.matches.should.eql(['*JavaScript*','*(обычный текст)*', '*подготовки*']);
    });

    // работает криво, но как задумано,
    // этот паттерн дополняется проверкой на начало строки или пробел в парсере
    // поэтому в реальном тексте не заменяет (*) "*" итп
    it("'*' (*) '**' (**)", function() {
      this.test.matches.should.eql(["*' (*", "**' (**"]);
    });

  });

  describe('LINK_PAT', function() {

    it("[text](href)", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

    it("[many words](href)", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

    it('[many words](words not allowed)', function() {
      should.not.exist(this.test.firstMatch);
    });

    it('[no href]', function() {
      should.not.exist(this.test.firstMatch);
    });

    it('["quoted string"](href)', function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

    it('["quoted []"](href)', function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

    it('["quoted \\"[]\\""](href)', function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

  });


  describe('BBTAG_SELF_CLOSE_PAT', function() {

    it("[img]", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

    it("[img/]", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

    it('[img src="[]"]', function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

  });

  describe('BBTAG_NEED_CLOSE_EMPTY_PAT', function() {

    it("[js]", function() {
      should.not.exist(this.test.firstMatch);
    });

    it("[js-me]...[/js-me]", function() {
      should.not.exist(this.test.firstMatch);
    });

    it("[js/]", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
      this.test.firstMatch[1].should.eql("js");
      this.test.firstMatch[2].should.eql("");
    });

    it("[js/] [/js]", function() {
      this.test.firstMatch[0].should.eql("[js/]");
      this.test.firstMatch[1].should.eql("js");
      this.test.firstMatch[2].should.eql("");
    });

    it("[js src='file.js'/]", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
      this.test.firstMatch[1].should.eql("js");
      this.test.firstMatch[2].should.eql(" src='file.js'");
    });

  });

  describe('BBTAG_NEED_CLOSE_BODY_PAT', function() {

    it("[js attrs='\\''].\n.[/js]", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
      this.test.firstMatch[1].should.eql("js");
      this.test.firstMatch[2].should.eql(" attrs='\\''");
    });


  });


  describe('VERBATIM_TAGS_PAT', function() {
    it("<script>\n// < >\n</script>", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
      this.test.firstMatch[1].should.eql('script');
    });

    it("<  script  >\n</  script  >", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
      this.test.firstMatch[1].should.eql('script');
    });

    it("<script> text", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
      this.test.firstMatch[1].should.eql('script');
    });

    it("<script-me>\n</script-me>", function() {
      should.not.exist(this.test.firstMatch);
    });

    it("<scripter>\n</scripter>", function() {
      should.not.exist(this.test.firstMatch);
    });

    it("<script src='my \"> info'>\n</script>", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

  });


  describe('ATTRS_REG', function() {
    it("src='ya.ru' selected href=\"http://test.com\"", function() {
      this.test.firstMatch[0].should.eql(this.test.title);
    });

  });


});
