var contextTypography = require('../../typography/contextTypography');

describe("contextTypography", function() {

  it("doesn't wrap table tags & headers & lists & in p", function() {
    var table = '<h1>test</h1><ul>1</ul><table><thead><tr><td>1</td></tr></thead><tbody><tr><td>2</td></tr></tbody><tfoot><tr><td>3</td></tr></tfoot></table>';

    contextTypography(table).replace(/\n/g, '').should.be.eql("<h1>test</h1><ul>1</ul><table><thead><tr><td>1</td></tr></thead><tbody><tr><td>2</td></tr></tbody><tfoot><tr><td>3</td></tr></tfoot></table>");
  });

  it("no context typography inside pre or script", function() {
    var html = '<pre>"help"</pre><script>var a = "b"</script>';

    contextTypography(html).replace(/\n/g, '').should.be.eql(html);
  });

  it("converts double \\n to <p>", function() {
    contextTypography("line1\n\nline2").should.be.eql("<p>line1</p>\n<p>line2</p>");
  });


  it("converts 2 or more \\n to single <p>", function() {
    contextTypography("line1\n\n\n\n\nline2").should.be.eql("<p>line1</p>\n<p>line2</p>");
  });

  it("doesn't insert <p> between block tags", function() {
    var html = "<div> ... </div>\n\n<table> ... </table>";
    contextTypography(html).replace(/\n/g, '').should.be.eql(html.replace(/\n/g, ''));
  });

  it("merges newlines with spaces inbetween", function() {
    contextTypography("line1\n\n    \n\n\nline2").should.be.eql("<p>line1</p>\n<p>line2</p>");
  });

  it("converts quotes", function() {
    contextTypography('"my text"').should.be.eql('<p>«my text»</p>');
    contextTypography('"мой текст"').should.be.eql('<p>«мой текст»</p>');
  });

  it("wraps text in <p>", function() {
    contextTypography('text').should.be.eql('<p>text</p>');
  });

  it("converts quotes in tags", function() {
    var text = '<h3 class="a">"my"</h3>';
    contextTypography(text).should.be.eql('<h3 class="a">«my»</h3>');
  });


/*
  describe("wraps <img> with <figure> if on blank line", function() {

    it("wraps <img>", function* () {
      contextTypography("<img src=\"1.jpg\">").should.be.eql("<figure><img src=\"1.jpg\"></figure>");
    });

    it("works only if spaces are around", function* () {
      contextTypography("   \t<img src=\"1.jpg\">\t  ").should.be.eql("<figure><img src=\"1.jpg\"></figure>");
    });

    it("doesn't touch img if it's in text", function* () {
      contextTypography("text <img src=\"1.jpg\">").should.be.eql("<p>text <img src=\"1.jpg\"></p>");
      contextTypography("<img src=\"1.jpg\"> text").should.be.eql("<p><img src=\"1.jpg\"> text</p>");
    });

    it("passes more complex text", function* () {
      var result = contextTypography("text <img src=\"1.jpg\">\n\n<img src=\"2.jpg\">");
      result.should.be.eql(
        "<p>text <img src=\"1.jpg\"></p>\n<figure><img src=\"2.jpg\"></figure>"
      );
    });
  });
*/
});
