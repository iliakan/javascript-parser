const co = require('co');

const BodyParser = require('.').BodyParser;

var text = "# События в деталях\n\nОсновные типы событий, которые нужны в 95% случаев."; // Глубоко изучаем их особенности и применение.\n\nВы можете читать этот раздел в любом порядке или кратко просмотреть его и вернуться к конкретным событиям, когда они понадобятся.\n\n";
//text = new Array(200).join(text);

var options = {
  resourceFsRoot: '/var/site/js-dev/01-tutorial/02-ui/03-event-details',
  resourceWebRoot: '/event-details',
  metadata: {},
  trusted: true
};

co(function *() {

  var d = new Date();
  var parser = new BodyParser(text, options);

  var result = yield parser.parse();

  console.log(text.length);


  console.log(new Date() - d);
})(function(err) {
  if (err) throw(err);
  console.log(arguments);
});


/*
 var d = new Date();
 var parser = new BodyParser(text, options);

 var gen = parser.parse();

 var i = 0;
 for(var next of gen) {
 i++;
 //  console.log(next);
 }

 console.log("i=" + i);
 console.log(new Date() - d);


 */