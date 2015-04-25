var _ = require('lodash'),
    Promise = require('bluebird'),
    fs = require('fs-extra');

Promise.promisifyAll(fs);

var templatePath = __dirname + '/template.html';
var cssSrcPath = __dirname + '/../node_modules/github-markdown-css/github-markdown.css';
var cssDestPath = __dirname + '/../build/github-markdown.css';

function loadTemplate() {
  return fs.readFileAsync(templatePath);
}

function copyCss() {
  return fs.copyAsync(cssSrcPath, cssDestPath);
}

module.exports = {
  writeFilesAsync: function(htmlObj) {
    return copyCss()
      .then(loadTemplate)
      .then(templateHtml => {
        var template = _.template(templateHtml);
        return Promise.props(_.mapValues(htmlObj, (listHtml, listName) => {
          var filename = __dirname + '/../build/' + listName + '.html';
          return fs.writeFileAsync(filename, template({listHtml: listHtml}));
        }));
      });
  }
}