var Promise = require('bluebird');
var fs = require('fs'),
    request = Promise.promisify(require('request')),
    _ = require('lodash');

Promise.promisifyAll(fs);

var listPath = __dirname + '/../lists.json';

var Reader = {};
Reader.readMarkdown = function() {
  return fs.readFileAsync(listPath).catch(function(e) {
    console.log(e);
  }).then(function(buf) {
    var json = JSON.parse(buf.toString());
    return Promise.props(_.mapValues(json.lists, function(listUrl, key) {
      return request(listUrl);
    }));
  }).then(function(result) {
    return _.mapValues(result, function(req) {
      return req[0].body;
    });
  });
}

module.exports = Reader;