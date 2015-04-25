var expect = require('chai').expect;
var reader = require('../lib/reader'),
    nock = require('nock');

describe('reader', function() {
  beforeEach(function() {
    this.golangReq = nock('https://raw.githubusercontent.com')
      .get('/avelino/awesome-go/master/README.md')
      .replyWithFile(200, __dirname + '/fixtures/golang-readme.md');
    this.nodejsReq = nock('https://raw.githubusercontent.com')
      .get('/sindresorhus/awesome-nodejs/master/readme.md')
      .replyWithFile(200, __dirname + '/fixtures/nodejs-readme.md');
  });

  it('reads Markdown from the provided URLs', function(done) {
    reader.readMarkdown().then(function(contents) {
      expect(contents).to.be.instanceof(Object);
      expect(contents).to.have.all.keys(['node', 'golang']);
      done();
    });
  });
});