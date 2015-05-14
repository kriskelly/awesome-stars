var expect = require('chai').expect;
var writer = require('../lib/writer');

describe('writer', function() {
  it('saves HTML files in templates', function(done) {
    writer.writeFilesAsync({foo: 'bar bar'}).then(function() {
      done();
    }).catch(function(e) {
      console.log(e);
    });
  });
});