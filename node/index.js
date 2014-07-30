var fs = require("fs");

fs.readdirSync(__dirname).forEach(function(file) {
  if (file == 'index.js') return;
  var submodule = require("./" + file);
  for(var key in submodule) exports[key] = submodule;
});

