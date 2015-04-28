var expect = require('chai').expect;
process.env['TOKEN'] = 'foobar';
var starcount = require('../lib/starcount'),
    nock = require('nock');

describe('starcount', function() {
  beforeEach(function() {
    this.repoUrl = {user: 'mikespook', repo: 'gorbac'};
    this.githubReq = nock('https://api.github.com')
      .get('/repos/mikespook/gorbac?access_token=foobar')
      .reply(200, {stargazers_count: 82});
  });

  describe('when the repo url is garbage', function() {
    it('resolves an empty promise', function(done) {
      starcount(null).then(function(count) {
        expect(count).to.be.undefined;
        done();
      });
    });
  });

  it.only('retrieves the github stargazer count for the repo url', function(done) {
    starcount(this.repoUrl).then(function(count) {
      expect(count).to.equal(82);
      done();
    });
  });
});