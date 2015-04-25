var reader = require('./lib/reader'),
    converter = require('./lib/converter'),
    writer = require('./lib/writer'),
    _ = require('lodash'),
    fs = require('fs'),
    Promise = require('bluebird');

Promise.promisifyAll(fs);

reader.readMarkdown().then(lists => {
  var htmlMap = _.mapValues(lists, function(markdownStr, listName) {
    var tree = converter.getTree(markdownStr);
    return converter.convertListToTable(tree).then(function() {
      return converter.toHTML(tree);
    });
  });
  return Promise.props(htmlMap).then(writer.writeFilesAsync);
}).then(() => {
  console.log('success');
});