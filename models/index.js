
var path = require('path'),
  fs = require('fs'),
  formage = app.get('formage');

var files = fs.readdirSync(__dirname);

//formage.loadTypes(require('mongoose'));

files.forEach(function(file) {

  var name = path.basename(file, '.js');
  if (name === 'index' || !/\.js$/.test(file)) return;

  module.exports[name] = require('./' + name);

});
