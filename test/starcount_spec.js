var expect = require('chai').expect;
process.env['TOKEN'] = 'foobar';
var datastore = require('../lib/datastore');
var sinon = require('sinon');
require('sinon-bluebird');
var mockDatastore = sinon.stub(datastore);
var proxyquire = require('proxyquire');
var starcount = proxyquire('../lib/starcount', {
  './datastore': mockDatastore
});

var nock = require('nock');

describe('starcount', function() {
  beforeEach(function() {
    mockDatastore.fetchAsync.resolves(null);
    mockDatastore.saveAsync.resolves(null);

    this.repoUrl = {user: 'mikespook', repo: 'gorbac'};
    this.githubReq = nock('https://api.github.com')
      .get('/repos/mikespook/gorbac?access_token=foobar')
      .reply(200, {
        stargazers_count: 82,
        meta: {
          status: '200 OK'
        }
      });
  });

  describe('when the repo url is garbage', function() {
    it('resolves an empty promise', function(done) {
      starcount(null).then(function(count) {
        expect(count).to.be.undefined;
        done();
      });
    });
  });

  it('retrieves the github stargazer count for the repo url', function(done) {
    starcount(this.repoUrl).then(function(count) {
      expect(count).to.equal(82);
      done();
    });
  });
});