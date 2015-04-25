var markdown = require('markdown').markdown;
var pretty = require('prettyjson');
var _ = require('lodash');

module.exports = {
  getTree: function(content) {
    return markdown.parse(content, 'Maruku');
  },

  convertListToTable: function(tree) {
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
          var starsCountTd = ['td', {}, ''];

          tr.push(starsCountTd);
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
  },

  toHTML: function(tree) {
    return markdown.toHTML(tree, 'Maruku'); // Maruku dialect used to generate tables.
  }
}