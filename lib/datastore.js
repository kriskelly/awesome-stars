var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(process.env['DB']);
var Promise = require('bluebird');

var datastore = {
  setup: function() {
    db.serialize(function() {
      db.run("CREATE TABLE repo_info (user TEXT, repo TEXT, starcount INTEGER, lastmodified TEXT)");
    });

    db.close();
  },

  done: function() {
    db.close();
  },

  fetch: function(user, repo, cb) {
    db.serialize(function() {
      db.get("SELECT * FROM repo_info WHERE user = ? AND repo = ?", [user, repo], cb);
      // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
      // for (var i = 0; i < 10; i++) {
      //     stmt.run("Ipsum " + i);
      // }
      // stmt.finalize();

      // db.each("", function(err, row) {
      //     console.log(row.id + ": " + row.info);
      // });
    });
  },

  save: function(user, repo, starcount, lastmodified, cb) {
    db.serialize(function() {
      db.run("INSERT INTO repo_info VALUES(?, ?, ?, ?)", [user, repo, starcount, lastmodified], cb);
    });
  }
};

module.exports = Promise.promisifyAll(datastore);