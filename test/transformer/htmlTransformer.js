const HtmlTransformer = require('../../transformer/htmlTransformer').HtmlTransformer;
const TagNode = require('../../node/tagNode').TagNode;
const HeaderTag = require('../../node/headerTag').HeaderTag;
const CompositeTag = require('../../node/compositeTag').CompositeTag;
const TextNode = require('../../node/textNode').TextNode;

describe("HtmlTransformer", function() {

  describe("toHtml", function() {

    it("can transform text", function() {
      var input = new TextNode("text");
      var walker = new HtmlTransformer(input, { trusted: true });
      var result = walker.toHtml();
      result.should.be.eql("text");
    });


    it("can transform nested", function() {
      var input = new CompositeTag('a', [
        new TextNode("Item")
      ], {'class': 'link', title: '"in quotes"'});

      var walker = new HtmlTransformer(input, { trusted: true });
      var result = walker.toHtml();
      result.should.be.eql('<a class="link" title="&quot;in quotes&quot;">Item</a>');
    });

    it("can transform header", function() {
      var input = new HeaderTag(1, [
        new TextNode('Header '),
        new CompositeTag('em', [
          new TextNode('italic')
        ])
      ]);

      var walker = new HtmlTransformer(input, { trusted: true });
      var result = walker.toHtml();
      result.should.be.eql('<h1><a name="header-italic" href="#header-italic">Header <em>italic</em></a></h1>');
    });

    it("can transform more nested", function() {
      var input = new CompositeTag('div', [], {'class': 'container'});
      var ul = new CompositeTag('ul', []);
      input.appendChild(ul);
      ul.appendChildren([
        new TagNode('li', 'Item 1'),
        new CompositeTag('li', [
          new TextNode("Item "),
          new TagNode('em', 'italic', {class: 'nice'})
        ])
      ]);

      var walker = new HtmlTransformer(input, { trusted: true });
      var result = walker.toHtml();
      result.should.be.eql('<div class="container"><ul><li>Item 1</li><li>Item <em class="nice">italic</em></li></ul></div>');
    });


  });
});