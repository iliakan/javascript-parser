var TagNode = require('../../node/tagNode');
var HeaderTag = require('../../node/headerTag');
var CompositeTag = require('../../node/compositeTag');
var TextNode = require('../../node/textNode');

describe("toHtml", function() {

  var options = {
    trusted: true,
    noContextTypography: true
  };

  var makeTrusted = true;
  function node(Constructor/*, args*/) {

    if (typeof Constructor == "string") {
      return new TextNode(Constructor);
    } else {
      var args = Array.prototype.slice.call(arguments, 1);
      var node = Object.create(Constructor.prototype);
      Constructor.apply(node, args);
    }

    node.trusted = makeTrusted;
    return node;
  }

  describe("toHtml", function() {

    it("can transform text", function () {
      var input = new TextNode("text");
      input.toHtml().should.be.eql("text");
    });

    it("can transform nested", function () {
      var input = new CompositeTag('a', [
        node("Item")
      ], {'class': 'link', title: '"in quotes"'});
      input.trusted = true;
      input.toHtml().should.be.eql('<a class="link" title="&quot;in quotes&quot;">Item</a>');
    });

    it("can transform header", function () {
      var input = new HeaderTag(1, "header-italic", [
        new TextNode('Header '),
        new CompositeTag('em', [
          new TextNode('italic')
        ])
      ]);
      input.trusted = true;
      input.toHtml().should.be.eql('<h1><a name="header-italic" href="#header-italic">Header <em>italic</em></a></h1>');
    });

    it("can transform header with anchor", function () {
      var input = new HeaderTag(1, "anchor", [
        new TextNode('Header '),
        new CompositeTag('em', [
          new TextNode('italic')
        ])
      ]);
      input.trusted = true;

      input.toHtml().should.be.eql('<h1><a name="anchor" href="#anchor">Header <em>italic</em></a></h1>');
    });

    it("can transform more nested", function () {
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
      input.trusted = true;

      input.toHtml().should.be.eql('<div class="container"><ul><li>Item 1</li><li>Item <em class="nice">italic</em></li></ul></div>');
    });


  });
});
