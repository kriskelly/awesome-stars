var expect = require('chai').expect;
var urlparser = require('../lib/urlparser');

describe('urlparser', function() {
  it('extracts the path as user/repo', function() {
    expect(urlparser('https://github.com/rschmukler/agenda'))
      .to.deep.equal({user: 'rschmukler', repo: 'agenda'});
  });

  it('ignores non-github URLs', function() {
    expect(urlparser('https://www.phusionpassenger.com/node_weekly')).to.be.undefined;
  });

  it('does not break with partial URLs', function() {
    expect(urlparser('#mad-science')).to.be.undefined;
  });

  it('does not break when missing URL', function() {
    expect(urlparser(null)).to.be.undefined;
  })

  it('ignores hash fragments and other nonsense at the end of the URL', function() {
    expect(urlparser('https://github.com/maxogden/art-of-node/#the-art-of-node'))
      .to.deep.equal({user: 'maxogden', repo: 'art-of-node'});
  });
});