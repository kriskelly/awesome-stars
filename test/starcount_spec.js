var expect = require('chai').expect;
var starcount = require('../lib/starcount'),
    nock = require('nock');

describe('starcount', function() {
  beforeEach(function() {
    this.repoUrl = 'https://github.com/mikespook/gorbac';
    this.githubReq = nock('https://api.github.com')
      .get('/repos/mikespook/gorbac')
      .replyWithFile(200, __dirname + '/fixtures/mikespook-gorbac.json');
  });

  it('retrieves the github stargazer count for the repo url', function(done) {
    starcount(this.repoUrl).then(function(starCount) {
      expect(starCount).to.equal(82);
      done();
    });
    // reader.readMarkdown().then(function(contents) {
    //   expect(contents).to.be.instanceof(Object);
    //   expect(contents).to.have.all.keys(['node', 'golang']);
    //   done();
    // });
  });
});