var expect = require('chai').expect;
var fs = require('fs');
process.env['TOKEN'] = 'foobar';
var converter = require('../lib/converter.js');
var pretty = require('prettyjson');
var nock = require('nock');

describe('converting list to table', function() {
  beforeEach(function() {
    this.content = fs.readFileSync('./test/fixtures/nodejs-readme.md').toString();
    this.tableContent = fs.readFileSync('./test/fixtures/table.md').toString();
  });

  it('converts the markdown to a tree', function(done) {
    var tree = converter.getTree(this.content);
    expect(tree[0]).to.equal('markdown');
    converter.convertListToTable(tree).then(function() {
      done();
    });
  });

  it('parses tables', function() {
    var tree = converter.getTree(this.tableContent);
    expect(tree[1][1][0]).to.equal('thead');
  });
});