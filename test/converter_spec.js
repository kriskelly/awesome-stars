var expect = require('chai').expect;
var fs = require('fs');
var proxyquire = require('proxyquire');
var Promise = require('bluebird');
process.env['TOKEN'] = 'foobar';
var stubs = {
  './starcount': function() {
    return Promise.resolve(123); // Always return 123 for the star count.
  }
}
var converter = proxyquire('../lib/converter.js', stubs);
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