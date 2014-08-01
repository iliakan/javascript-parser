#! /usr/bin/env node
var BodyParser = require('..').BodyParser;

var text = "# События в деталях\n\nОсновные типы событий, которые нужны в 95% случаев. Глубоко изучаем их особенности и применение.\n\nВы можете читать этот раздел в любом порядке или кратко просмотреть его и вернуться к конкретным событиям, когда они понадобятся.\n\n";
text = new Array(200).join(text);

console.log(text.length);
var options = {
  resourceFsRoot:  '/var/site/js-dev/01-tutorial/02-ui/03-event-details',
  resourceWebRoot: '/event-details',
  metadata:        {},
  trusted:         true
};

var d = new Date();
var parser = new BodyParser(text, options);

var result = parser.parseAndWrap();
console.log(new Date() - d);

//console.log(result.toStructure());
