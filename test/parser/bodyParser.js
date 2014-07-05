const BodyParser = require('../../parser/bodyParser').BodyParser;
const ToStructureWalker = require('../../treeWalker/toStructureWalker').ToStructureWalker;
const path = require('path');
const should = require('should');
const util = require('util');

function show(result) {
  console.log(util.inspect(toStructure(result), {depth: 20}));
}

function toStructure(result) {
  return new ToStructureWalker(result).toStructure();
}

describe("BodyParser", function() {

  var options = {
    resourceFsRoot:  path.join(__dirname, 'document'),
    resourceWebRoot: '/document',
    trusted:         true,
    metadata:        {
      head: [],
      libs: []
    }
  };

  describe('parse', function() {

    it("*italic* text", function *() {
      var parser = new BodyParser(this.test.title, options);
      var result = yield parser.parse();
      var structure = new ToStructureWalker(result).toStructure();
      structure.should.be.eql([
          {
            type:     'CompositeTag',
            tag:      'em',
            children: [
              { type: 'TextNode', text: 'italic' }
            ]
          },
          {
            type: 'TextNode',
            text: ' text'
          }
        ]
      );
    });

    it("[img src='html6.jpg'] text", function *() {
      var parser = new BodyParser(this.test.title, options);
      var result = yield parser.parse();
      var structure = new ToStructureWalker(result).toStructure();
      structure.should.be.eql([
        {
          type:  'TagNode',
          tag:   'img',
          attrs: {
            src: '/document/html6.jpg', width: 256, height: 256
          }
        },
        { type: 'TextNode', text: ' text' }
      ]);
    });

    it("[online] text *in* [/online] out", function *() {
      var parser = new BodyParser(this.test.title, options);
      var result = yield parser.parse();

      toStructure(result).should.be.eql([
          { type: 'TextNode', text: ' text ' },
          { type:     'CompositeTag',
            tag:      'em',
            children: [
              { type: 'TextNode', text: 'in' }
            ]
          },
          { type: 'TextNode', text: ' ' },
          { type: 'TextNode', text: ' out' }
        ]
      )
    });

    it("[js]my code;[css][/css]my code;[/js]", function *() {
      var parser = new BodyParser(this.test.title, options);
      var result = yield parser.parse();
      toStructure(result).should.be.eql([
        { type:  'EscapedTag',
          text:  'my code;[css][/css]my code;',
          tag:   'pre',
          attrs: {
            class:          'language-javascript line-numbers',
            'data-trusted': '1'
          }
        }
      ]);
    });

    it("# Header *italic*", function* () {
      var parser = new BodyParser(this.test.title, options);
      var result = yield parser.parse();

      toStructure(result).should.be.eql([
        { type:     'HeaderTag',
          tag:      '#',
          children: [
            { type: 'TextNode', text: 'Header ' },
            { type:     'CompositeTag',
              tag:      'em',
              children: [
                { type: 'TextNode', text: 'italic' }
              ] }
          ] }
      ])
    });

    it("[compare]+Plus 1\n-Minus *italic*\n[/compare]", function *() {
      var parser = new BodyParser(this.test.title, options);
      var result = yield parser.parse();
      toStructure(result).should.be.eql([
        { type:     'CompositeTag',
          tag:      'div',
          attrs:    { class: 'balance' },
          children: [
            { type:     'CompositeTag',
              tag:      'div',
              attrs:    { class: 'balance__content' },
              children: [
                { type:     'CompositeTag',
                  tag:      'div',
                  attrs:    { class: 'balance__pluses' },
                  children: [
                    { type:     'CompositeTag',
                      tag:      'ul',
                      attrs:    { class: 'balance__list' },
                      children: [
                        { type:  'TagNode',
                          text:  'Достоинства',
                          tag:   'h3',
                          attrs: { class: 'balance__title' } },
                        { type:     'CompositeTag',
                          tag:      'li',
                          attrs:    { class: 'plus' },
                          children: [
                            { type: 'TextNode', text: 'Plus 1' }
                          ] }
                      ] }
                  ] },
                { type:     'CompositeTag',
                  tag:      'div',
                  attrs:    { class: 'balance__minuses' },
                  children: [
                    { type:     'CompositeTag',
                      tag:      'ul',
                      attrs:    { class: 'balance__list' },
                      children: [
                        { type:  'TagNode',
                          text:  'Недостатки',
                          tag:   'h3',
                          attrs: { class: 'balance__title' } },
                        { type:     'CompositeTag',
                          tag:      'li',
                          attrs:    { class: 'minus' },
                          children: [
                            { type: 'TextNode', text: 'Minus ' },
                            { type:     'CompositeTag',
                              tag:      'em',
                              children: [
                                { type: 'TextNode', text: 'italic' }
                              ] }
                          ] }
                      ] }
                  ] }
              ] }
          ] }
      ])
    })

  });

});