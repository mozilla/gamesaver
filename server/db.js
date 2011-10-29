// db.js is a tiny persistence layer for myfavoritebeer that uses
// mongodb and the mongodb client library.
//
// This implementation is really not the point of the myfavoritebeer
// example code and is just provided for completeness (the point is
// how you can do authentication with browserid).  

const
url = require('url'),
mongodb = require('mongodb');

var collections = {
  Games:  undefined
};

exports.connect = function(cb) {
  /*if (!process.env.MONGOLAB_URI) {
    cb("no MONGOLAB_URI env var!");
    return;
  }*/

  var user = 'test';
  var password = 'test';
  var uri = 'http://' + user + ':' + password + '@localhost:27017';
  var dbName = 'Gladius';
  var bits = url.parse(uri);
  var server = new mongodb.Server(bits.hostname, bits.port, {});
  new mongodb.Db(dbName, server, {}).open(function (err, cli) {
    if (err) return cb(err);
    collections.Games = new mongodb.Collection(cli, 'Games');
    //now authenticate
    var auth = bits.auth.split(':');
    cli.authenticate(auth[0], auth[1], function(err) {
      cb(err);
    });
  });
}; 

exports.get = function(collection, email, title, cb) {
  var c = collections[collection].find({ email: email, title: title });
  c.toArray(function(err, docs) {
    if (err) return cb(err);
    if (docs.length != 1) return cb("consistency error!  more than one doc returned!");
    //console.log(docs[0]);
    cb(undefined, docs[0]);
  });
};

exports.set = function(collection, email, title, data, cb) {
  collections[collection].update(
    { email: email,  title: title },
    { email: email, title: title, data: JSON.parse(data) },
    { safe: true, upsert: true }, cb);
};
