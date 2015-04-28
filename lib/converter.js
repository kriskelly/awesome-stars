var marked = require('marked');
var pretty = require('prettyjson');
var _ = require('lodash');
var Promise = require('bluebird');
var starcount = require('./starcount');
var urlparser = require('./urlparser');

var markedOptions = {
  gfm: true,
  tables: true,
  sanitize: true
};

function getUrlFromMarkdown(token) {
  var lexer = new marked.InlineLexer(token, [], markedOptions);
  var matches = lexer.rules.link.exec(token.text);
  if (matches) {
    return matches[2];
  }
}

module.exports = {
  getTree: function(content) {
    return marked.lexer(content, markedOptions);
  },

// Tokenized JSON should end up looking like this:
//[ { type: 'table',
//    header: [ 'Tables', 'Are', 'Cool' ],
//    align: [ null, 'center', 'right' ],
//    cells: [ [Object], [Object], [Object] ] },
//  links: {} ]

  convertListToTable: function(tree) {
    var promises = [];
    function elementToTable(element, listItems) {
      element.type = 'table';
      element.header = ['', 'Stars'];
      element.align = [null, null];
      element.cells = [];
      listItems.forEach(function(listItem) {
        if (listItem.type !== 'text') {
          return;
        }
        var rowCells = [listItem.text, ''];
        var url = getUrlFromMarkdown(listItem);
        console.log(url);
        var repoInfo = urlparser(url);
        if (!!repoInfo) {
          console.log(repoInfo);
          var countPromise = Promise.resolve([repoInfo, rowCells]);
          promises.push(countPromise);
        } else {
          // console.log('Could not parse Github URL for: ' + listItem.text);
        }
        element.cells.push(rowCells);
      });
    }

    // This is a hack to remove the element from the tree
    // by turning it into empty whitespace.
    function removeElementFromTree(element) {
      element.type = 'text';
      element.text = '';
    }

    var listItems = [];
    var listStarted = false;
    var listElementStarted = false;
    function traverse(root) {
      if (Array.isArray(root)) {
        root.map(traverse);
      } else {
        // Otherwise it should be an object.
        if (root.type === 'list_start') {
          listStarted = true;
          listItems = [];
          removeElementFromTree(root);
        } else if (root.type === 'list_end') {
          listStarted = false;
          elementToTable(root, listItems);
        } else if (root.type === 'list_item_start') {
          listElementStarted = true;
          removeElementFromTree(root);
        } else if (root.type === 'list_item_end') {
          listElementStarted = false;
          removeElementFromTree(root);
        } else if (listStarted && listElementStarted) {
          listItems.push(_.clone(root));
          removeElementFromTree(root);
        }
      }
    }

    traverse(tree);
    return Promise.map(promises, function(cachedValues) {
      var repoInfo = cachedValues[0];
      var rowCells = cachedValues[1];
      return starcount(repoInfo).then(function(count) {
        // console.log(repoInfo);
        if (count) {
          rowCells[1] = count + '';
          process.stdout.write('.');
        }

      });
    }, {concurrency: 3});
  },

  toHTML: function(tree) {
    return marked.parser(tree, markedOptions);
  }
}