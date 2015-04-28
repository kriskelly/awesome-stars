var expect = require('chai').expect;
var fs = require('fs');
var proxyquire = require('proxyquire');
var Promise = require('bluebird');
var _ = require('lodash');
process.env['TOKEN'] = 'foobar';
var stubs = {
  './starcount': function() {
    return Promise.resolve(123); // Always return 123 for the star count.
  }
}
var converter = proxyquire('../lib/converter.js', stubs);
var pretty = require('prettyjson');
var nock = require('nock');
var marked = require('marked');

describe('converting list to table', function() {
  beforeEach(function() {
    this.content = fs.readFileSync('./test/fixtures/nodejs-readme.md').toString();
  });

  it('converts the markdown from a list to a table', function(done) {
    var tree = converter.getTree(this.content);
    converter.convertListToTable(tree).then(function() {
      converter.toHTML(tree);
      done();
    });
  });

  // describe.only('with tables in the parsed markdown', function() {
  //   beforeEach(function() {
  //     this.tableContent = fs.readFileSync('./test/fixtures/table.md').toString();
  //   });

  //   it('parses tables', function() {
  //     var tree = converter.getTree(this.tableContent);
  //     console.log(tree[0]);
  //     // expect(tree[1][1][0]).to.equal('thead');
  //   });
  // });

  describe('with underscores in the repo names', function() {
    beforeEach(function() {
      this.content = fs.readFileSync('./test/fixtures/elixir-crypto-readme.md').toString();
    });

    it('converts the markdown correctly', function(done) {
      var tree = converter.getTree(this.content);
      converter.convertListToTable(tree).then(function() {
        var html = converter.toHTML(tree);
        expect(html).to.include('elixir_tea');
        done();
      });
    });
  })
});