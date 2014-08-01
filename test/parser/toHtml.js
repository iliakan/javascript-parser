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
      var input = node("text");
      input.toHtml().should.be.eql("text");
    });

    it("can transform nested", function () {
      var input = node(CompositeTag, 'a', [
        node("Item")
      ], {'class': 'link', title: '"in quotes"'});

      input.toHtml().should.be.eql('<a class="link" title="&quot;in quotes&quot;">Item</a>');
    });

    it("can transform header", function () {
      var input = node(HeaderTag, 1, "header-italic", [
        node('Header '),
        node(CompositeTag, 'em', [
          node('italic')
        ])
      ]);

      input.toHtml().should.be.eql('<h1><a name="header-italic" href="#header-italic">Header <em>italic</em></a></h1>');
    });

    it("can transform header with anchor", function () {
      var input = node(HeaderTag, 1, "anchor", [
        node('Header '),
        node(CompositeTag, 'em', [
          node('italic')
        ])
      ]);

      input.toHtml().should.be.eql('<h1><a name="anchor" href="#anchor">Header <em>italic</em></a></h1>');
    });

    it("can transform more nested", function () {
      var input = node(CompositeTag, 'div', [], {'class': 'container'});
      var ul = node(CompositeTag, 'ul', []);
      input.appendChild(ul);
      ul.appendChildren([
        node(TagNode, 'li', 'Item 1'),
        node(CompositeTag, 'li', [
          node("Item "),
          node(TagNode, 'em', 'italic', {class: 'nice'})
        ])
      ]);

      input.toHtml().should.be.eql('<div class="container"><ul><li>Item 1</li><li>Item <em class="nice">italic</em></li></ul></div>');
    });


  });
});
