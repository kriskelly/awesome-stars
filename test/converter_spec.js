var expect = require('chai').expect;
var fs = require('fs');
var proxyquire = require('proxyquire');
var Promise = require('bluebird');
var sinon = require('sinon');
require('sinon-bluebird');
var _ = require('lodash');
process.env['TOKEN'] = 'foobar';
var starcountStub = sinon.stub();
var converter = proxyquire('../lib/converter.js', {
  './starcount': starcountStub,
  './datastore': {},
});
var pretty = require('prettyjson');
var nock = require('nock');
var marked = require('marked');

describe('converting list to table', function() {
  beforeEach(function() {
    starcountStub.resolves(123);
    this.content = fs.readFileSync('./test/fixtures/nodejs-readme.md').toString();
  });

  it('converts the markdown from a list to a table', function(done) {
    var tree = converter.getTree(this.content);
    converter.convertListToTable(tree).then(function() {
      converter.toHTML(tree);
      done();
    });
  });

  describe('with underscores in the repo names', function() {
    beforeEach(function() {
      this.content = fs.readFileSync('./test/fixtures/elixir-crypto-readme.md').toString();
    });

    it('converts the markdown correctly', function(done) {
      var tree = converter.getTree(this.content);
      converter.convertListToTable(tree).then(function(newTree) {
        var html = converter.toHTML(newTree);
        expect(html).to.include('elixir_tea');
        done();
      });
    });
  })
});