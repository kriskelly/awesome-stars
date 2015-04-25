var markdown = require('markdown').markdown;
var pretty = require('prettyjson');
var _ = require('lodash');
var Promise = require('bluebird');
var starcount = require('./starcount');

function getLinkUrl(listItem) {
  var inner = listItem[0];
  if (inner[0] === 'link') {
    return inner[1].href;
  }
}

module.exports = {
  getTree: function(content) {
    return markdown.parse(content, 'Maruku');
  },

  convertListToTable: function(tree) {
    var promises = [];
    function listToTable(parent, children) {
      parent.push(['thead',
        ['tr',
          [ 'th', {}, '' ],
          [ 'th', {}, 'Stars']
        ]
      ]);
      var tbody = ['tbody'];
      parent.push(tbody);
      children.forEach(function(listItem) {
        var tr = ['tr'];
        if (listItem[0] === 'listitem') {
          var origDesc = _.rest(listItem);
          var td = (['td', {}]).concat(origDesc);
          tr.push(td);
          var githubUrl = getLinkUrl(origDesc);
          if (!!githubUrl) {
            var countPromise = Promise.resolve([githubUrl, tr]);
            promises.push(countPromise);
          }
        }
        tbody.push(tr);
      });
    }

    function traverse(root) {
      // if (Array.isArray(jsonml)) {
      var identifier = root[0];
      var children = _.rest(root);
      if (identifier === 'bulletlist') {
        root.length = 0; // Clear the array
        root[0] = 'table';
        listToTable(root, children);
      } else {
        _.map(children, traverse);
      }
    }

    traverse(tree);
    return Promise.map(promises, function(cachedValues) {
      var githubUrl = cachedValues[0];
      var libraryTr = cachedValues[1];
      var starsCountTd = ['td', {}, ''];
      libraryTr.push(starsCountTd);
      console.log('fetching star count: ' + githubUrl);
      return starcount(githubUrl).then(function(count) {
        if (count) {
          starsCountTd[2] = count + '';
        }
      });
    }, {concurrency: 2});
  },

  toHTML: function(tree) {
    return markdown.toHTML(tree, 'Maruku'); // Maruku dialect used to generate tables.
  }
}