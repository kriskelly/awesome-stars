var Promise = require('bluebird');
var fs = require('fs'),
    request = Promise.promisify(require('request')),
    _ = require('lodash');

Promise.promisifyAll(fs);

var listPath = __dirname + '/../lists.json';

var Reader = {};
// listsToProcess = list names to process
Reader.readMarkdown = function(listsToProcess) {
  return fs.readFileAsync(listPath).catch(function(e) {
    console.log(e);
  }).then(function(buf) {
    var json = JSON.parse(buf.toString());
    var lists = json.lists;
    if (listsToProcess && listsToProcess.length) {
      lists = _.pick(lists, listsToProcess);
    }
    return Promise.props(_.mapValues(lists, function(listUrl, key) {
      return request(listUrl);
    }));
  }).then(function(result) {
    return _.mapValues(result, function(req) {
      return req[0].body;
    });
  });
}

module.exports = Reader;