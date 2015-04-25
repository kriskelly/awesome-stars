var expect = require('chai').expect;
var writer = require('../lib/writer');

describe('writer', function() {
  it('saves HTML files in templates', function(done) {
    writer.writeFilesAsync({foo: 'bar bar'}).then(() => {
      done();
    }).catch(e => {
      console.log(e);
    });
  });
});