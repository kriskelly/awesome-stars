var expect = require('chai').expect;
var reader = require('../lib/reader'),
    nock = require('nock');

describe('reader', function() {
  var allLists = [
    '/markets/awesome-ruby/master/README.md',
    '/avelino/awesome-go/master/README.md',
    '/sindresorhus/awesome-nodejs/master/readme.md',
    '/h4cc/awesome-elixir/master/README.md'
  ]

  describe('when parsing all the lists', function() {
    beforeEach(function() {
      allLists.forEach(function(listPath) {
        nock('https://raw.githubusercontent.com')
          .get(listPath)
          .reply(200, '');
      });
    });

    it('reads Markdown from all the provided URLs', function(done) {
      reader.readMarkdown([]).then(function(contents) {
        expect(contents).to.be.instanceof(Object);
        expect(contents).to.have.all.keys(['nodejs', 'golang', 'ruby', 'elixir']);
        done();
      });
    });
  });


  describe('when parsing only specific lists', function(done) {
    beforeEach(function() {
      this.nodejsReq = nock('https://raw.githubusercontent.com')
        .get('/sindresorhus/awesome-nodejs/master/readme.md')
        .replyWithFile(200, __dirname + '/fixtures/nodejs-readme.md');
    });

    it('only parses the provided lists', function(done) {
      reader.readMarkdown(['nodejs']).then(function(contents) {
          expect(contents).to.be.instanceof(Object);
          expect(contents).to.have.all.keys(['nodejs']);
          done();
      });
    });
  });
});