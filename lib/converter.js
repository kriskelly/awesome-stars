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

function containsGithubUrl(token) {
  if (token.type !== 'text') {
    return false;
  }
  var url = getUrlFromMarkdown(token);
  return !!urlparser(url);
}

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

    function createRow(tableToken, textToken) {
      var rowCells = [textToken.text, ''];
      var url = getUrlFromMarkdown(textToken);
      var repoInfo = urlparser(url);
      if (!!repoInfo) {
        var countPromise = Promise.resolve([repoInfo, rowCells]);
        promises.push(countPromise);
      }
      return rowCells;
    }

    // Return array of tokens.
    function createTable(tree) {
      var tableToken = {
        type: 'table',
        header: ['', 'Stars'],
        align: [null, null],
        cells: []
      };
      var otherTokens = [];

      var isListElement = false;
      _.each(tree, function(token) {
        switch(token.type) {
          case 'list_item_start': {
            isListElement = true;
            break;
          }
          case 'list_item_end': {
            isListElement = false;
            break;
          }
          default: {
            if (isListElement && token.type === 'text') {
              tableToken.cells.push(createRow(tableToken, token));
            } else {
              otherTokens.push(token);
            }
          }
        }
      });
      otherTokens.unshift(tableToken);
      return otherTokens;
    }

    function traverse(tree) {
      // Walk the tree.
      // Check the type of the element and maybe push it onto the new tree
      // When 'list_start', recursively traverse the tree
      //  Concatenate the return value from traverse to the end of newTree.
      // When 'list_end':
      //  If the tree contains Github links, convert the whole deal into a table.
      //    Return the list containing a singleton element for the new table.
      //  Otherwise the tree is just a normal list, leave it be and return the tree.
      // Return the new tree.
      var newTree = [];
      var node;
      while (node = tree.shift()) {
        switch(node.type) {
          case 'list_start': {
            // Start a recursive call to traverse() to grab everything in the list.
            // list_start gets eaten.
            newTree = newTree.concat(traverse(tree));
            break;
          }
          case 'list_end': {
            // Hopefully this is arrived at from a recursive call to traverse().
            // Check whether the tree contains Github links. If so, convert to table.
            var gotGithubLinks = _.any(newTree, containsGithubUrl);
            if (gotGithubLinks) {
              return createTable(newTree);
            } else {
              // Was not a table of github links, leave it alone.
              // Might need to add back the list_start above that got eaten.
              newTree.unshift({type: 'list_start', ordered: false});
              newTree.push(node);
              return newTree;
            }
            break;
          }
          default: {
            // Push everything else onto newTree by default.
            newTree.push(node);
          }
        }
      }
      return newTree;
    }

    var newTree = traverse(tree);
    newTree.links = {};

    return Promise.map(promises, function(cachedValues) {
      var repoInfo = cachedValues[0];
      var rowCells = cachedValues[1];
      return starcount(repoInfo).then(function(count) {
        if (_.isUndefined(count)) {
          console.log('Unable to set count for repo: ', repoInfo)
        } else {
          rowCells[1] = count + '';
          process.stdout.write('.');
        }
      });
    }, {concurrency: 3}).then(function() {
      return newTree;
    });
  },

  toHTML: function(tree) {
    return marked.parser(tree, markedOptions);
  }
}