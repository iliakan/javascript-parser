#! /usr/bin/env node
var BodyParser = require('..').BodyParser;


var text = require('fs').readFileSync('/js/javascript-nodejs/javascript-tutorial/01-js/02-first-steps/01-hello-world/01-hello-alert/solution.md', 'utf-8').trim();
text = text.substr(14);
text = "```js\nx```";

console.log(text);
var options = { resourceRoot: '/task/hello-alert',
  metadata:                   {},
  trusted:                    true };

var d = new Date();
var parser = new BodyParser(text, options);
debugger;
var result = parser.parseAndWrap();

console.log(result.toHtml());

//console.log(result.toStructure());
