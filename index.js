var reader = require('./lib/reader'),
    converter = require('./lib/converter'),
    writer = require('./lib/writer'),
    _ = require('lodash'),
    fs = require('fs'),
    Promise = require('bluebird'),
    argv = require('minimist')(process.argv.slice(2));

var listsToProcess = [];
if (argv.only) {
  listsToProcess = argv.only.split(',');
}

Promise.promisifyAll(fs);

reader.readMarkdown(listsToProcess).then(function(lists) {
  var htmlMap = _.mapValues(lists, function(markdownStr, listName) {
    var tree = converter.getTree(markdownStr);
    return converter.convertListToTable(tree).then(function(newTree) {
      return converter.toHTML(newTree);
    });
  });
  return Promise.props(htmlMap).then(writer.writeFilesAsync);
}).then(function() {
  console.log('success');
});