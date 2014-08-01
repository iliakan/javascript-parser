var BodyParser = require('../../parser/bodyParser');
var path = require('path');
var should = require('should');
var util = require('util');


describe("BodyParser", function() {


  var options = {
    resourceRoot: '/document',
    metadata:        {}
  };

  function format(html) {
    // reset metadata
    options.metadata = {};
    var parser = new BodyParser(html, options);
    var result = parser.parseAndWrap();
    var htmlResult = result.toHtml();
    return htmlResult;
  }

  describe('trusted', function() {

    beforeEach(function() {
      options.trusted = true;
    });

    it("formats [demo] tag correctly", function () {
      var html = format("[demo]");
      html.should.be.eql('<button onclick="runDemo(this)">Запустить демо</button>');
    });

    it("Leaves bad HTML as is", function () {
      var html = format("<p a>");
      html.should.be.eql(html);
    });

    it("doesn't apply char typography inside pre or script", function () {
      var html = format('<script>...</script>');
      html.replace(/\n/g, '').should.be.eql('<script>...</script>');
    });

    it("applies char typography in text", function () {
      var html = '**help me...**';
      var formatted = format(html);
      formatted.should.be.eql('<strong>help me…</strong>');
    });

    describe("[pre]", function() {
      it("No typograhy in [pre] block", function () {
        (format("[pre]... :)[/pre]")).should.be.eql('... :)');
      });

      it("No embedded blocks or italic inside [pre] block", function () {
        var result = format("text [pre]*text* [html]code[/html][/pre] *i*");
        result.should.be.eql("text *text* [html]code[/html] <em>i</em>");
      });

    });

    it("Keeps <!-- comments --> as is", function () {
      (format("my <!--\n# Header in *comment* -->")).should.be.eql("my <!--\n# Header in *comment* -->");
    });

    describe("Italic", function() {

      it("converts * to <em>", function () {
        var html = '*italic*';
        (format(html)).should.be.eql('<em>italic</em>');
      });

      it("requires spaces around * to convert to em", function () {
        (format('my*test*')).should.be.eql('my*test*');
        (format('*test*my')).should.be.eql('*test*my');
      });

      it("ignores stars surrounded by spaces", function () {
        (format('a * b * c')).should.be.eql("a * b * c");
      });

      it("handles many stars", function () {
        (format('*')).should.be.eql('*');
        (format('**')).should.be.eql('**');
        (format('***')).should.be.eql('<em>*</em>');
        (format('****')).should.be.eql('<strong></strong>');
      });

      it("keeps `*` '*' and (*)", function () {
        (format("`*` '*' (*)")).should.be.eql("<code>*</code> '*' (*)");
      });

    });

    describe("Bold", function() {
      it("converts ** to <strong>", function () {
        (format('**bold**')).should.be.eql("<strong>bold</strong>");
      });

      it("converts * inside **", function () {
        (format('**a *b*!**')).should.be.eql("<strong>a <em>b</em>!</strong>");
      });

      it("requires spaces around *", function () {
        (format('my**test** ')).should.be.eql('my**test** ');
        (format(' **test**my')).should.be.eql(' **test**my');
        (format('a ** b ** c')).should.be.eql('a <em>* b *</em> c');
      });

      it("can handle both em and bold", function () {
        (format('***test***')).should.be.eql('<strong><em>test</em></strong>');
      });

    });

    describe("<img>", function() {

      it("wraps <img> in figure if it occupies a separate line", function () {
        (format("<img src=\"html6.jpg\" width=1 height=2>")).should.be.eql(
          "<figure><img src=\"/document/html6.jpg\" width=\"1\" height=\"2\"></figure>"
        );
      });

      it("wraps <img> without size if absent", function () {
        (format("<img src=\"html6.jpg\">")).should.be.eql(
          "<figure><img src=\"/document/html6.jpg\"></figure>"
        );
      });

      it("doesn't wrap <img> in <figure> if not on line start", function () {
        (format("   \t<img src=\"html6.jpg\">")).should.be.eql(
          "   \t<img src=\"/document/html6.jpg\">"
        );
      });

      it("doesn't wrap <img> in <figure> if line has something non-spacey after <img>", function () {
        (format("<img src=\"html6.jpg\"> bla")).should.be.eql(
          "<img src=\"/document/html6.jpg\"> bla"
        );
      });

    });

    describe("Code", function() {
      it("converts `code` to code", function () {
        (format('`code`')).should.be.eql('<code>code</code>');
      });

      it("doesn't apply typography inside code", function () {
        (format('`$("div.my)"`')).should.be.eql('<code>$("div.my)"</code>');
      });

      it("keeps spaces before and after the code block", function () {
        (format('`x` a')).should.be.eql('<code>x</code> a');
        (format('b `x`')).should.be.eql('b <code>x</code>');
        (format('b `x` a')).should.be.eql('b <code>x</code> a');
      });

      it("replaces < > & inside code", function () {
        (format('`<>&`')).should.be.eql('<code>&lt;&gt;&amp;</code>');
      });
    });

    describe("parses shortcut", function() {
      it("[key Ctrl+Alt]", function () {
        (format('[key Ctrl+Alt]')).should.be.eql('<kbd class="shortcut">Ctrl<span class="shortcut__plus">+</span>Alt</kbd>');
      });

      it("CANCEL([key Esc])", function () {
        (format('CANCEL([key Esc])')).should.be.eql('CANCEL(<kbd class="shortcut">Esc</kbd>)');
      });
    });

    describe("out-of-text blocks", function() {

      it("smart without title", function () {
        var result = (format("[smart]text[/smart]")).replace(/\n/g, '');
        result.should.be.eql(
          "<div class=\"important important_smart\"><div class=\"important__header\"><span class=\"important__type\">На заметку:</span></div><div class=\"important__content\">text</div></div>"
        );
      });

      it("smart with title", function () {
        var result = (format("[smart header='\"my\" `code`']text[/smart]")).replace(/\n/g, '');
        result.should.be.eql(
          "<div class=\"important important_smart\"><div class=\"important__header\"><span class=\"important__type\"></span><h3 class=\"important__title\">\"my\" <code>code</code></h3></div><div class=\"important__content\">text</div></div>"
        );
      });
    });

    it("summary", function () {
      var result = (format("[summary]text[/summary]")).replace(/\n/g, '');
      result.should.be.eql(
        '<div class="summary"><div class="summary__content">text</div></div>'
      );
    });

    describe("header", function() {

      it("creates ref metadata", function() {
        var result = format('# Header [#anchor]');
        result.should.be.eql('<h1><a name="anchor" href="#anchor">Header</a></h1>');
        options.metadata.refs.toArray().should.be.eql(["anchor"]);
      });

      it("errors on duplicate refs", function() {
        var result = format('# Header [#anchor]\n\n# Header 2 [#anchor]');
        result.should.match(/error/);
      });
    });

    describe("source code with and without untrusted", function() {

      it("[js]...[/js]", function () {
        var result = format('[js]alert(1)[/js]');
        result.should.be.eql('<pre class="language-javascript line-numbers" data-trusted="1">alert(1)</pre>');
      });

      it("[js untrusted]...[/js]", function () {
        var result = format('[js untrusted]alert(1)[/js]');
        result.should.be.eql('<pre class="language-javascript line-numbers" data-trusted="0">alert(1)</pre>');
      });

    });
  });



  describe("untrusted", function() {

    beforeEach(function() {
      options.trusted = false;
    });

    it("Fixes bad HTML tags", function () {
      var html = format("<p>a");
      html.should.be.eql("<p>a</p>");
    });


    it("Fixes HTML tables with an incorrect tag order", function () {
      var html = format("<table><td><tr>a</tr></td></table>");
      html.should.be.eql("<table><td></td><tr>a</tr></table>");
    });


    it("cleans dangerous attributes", function () {
      var result = format("<a href='javascript:alert(1)'>test</a>");
      result.should.be.eql('<a>test</a>');
    });

    it("cleans dangerous tags", function () {
      var result = format("<script>alert(1);</script><style>...</style>");
      result.should.be.eql('');
    });

    it("cleans dangerous attributes inside [online]", function () {
      var result = format("[online]<a href='javascript:alert(1)'>test</a>[/online]");
      result.should.be.eql('<a>test</a>');
    });

    it("cleans dangerous attributes inside [pre]", function () {
      var result = format("[pre][online]<a onclick='alert(1)'>test</a>[/online][/pre]");
      result.should.be.eql('[online]<a>test</a>[/online]');
    });

    it("Allows safe tags", function() {
      var text = '<table><thead></thead><tbody><tr><td></td></tr></tbody></table><ul><li></li></ul><ol></ol><dl><dt></dt><dd></dd></dt></dl>';
      var result = format(text);
      result.should.be.eql('<table><thead></thead><tbody><tr><td></td></tr></tbody></table><ul><li></li></ul><ol></ol><dl><dt></dt><dd></dd></dl>');
    });

    it("doesn't remove disallowed tags inside `code`", function () {
      var result = format('test `<a href="#" onclick="alert(1)">...</a>`');
      result.should.be.eql('test <code>&lt;a href="#" onclick="alert(1)"&gt;...&lt;/a&gt;</code>');
    });

    it("cleans disallowed verbatim tags inside allowed verbatim tags", function () {
      var result = format('<pre><script>alert(1)</script></pre>');
      result.should.be.eql('<pre></pre>');
    });

    it("cleans disallowed verbatim tags inside allowed verbatim tags 2", function () {
      var result = format('[pre]<pre><script>alert(1)</script></pre>[/pre]');
      result.should.be.eql('<pre></pre>');
    });



  });
});
