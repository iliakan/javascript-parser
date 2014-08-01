#! /usr/bin/env node
var BodyParser = require('..').BodyParser;


var text = "[summary]text[/summary]";

var options = {
  resourceRoot: '/event-details',
  metadata:        {},
  trusted:         true
};

var d = new Date();
var parser = new BodyParser(text, options);

var result = parser.parseAndWrap();

console.log(result.toHtml());

//console.log(result.toStructure());
