var http = require("http");
var fs = require('fs');
var mongoose = require('mongoose');
var gunziplib = require('zlib');
mongoose.connect('mongodb://admin:pass@troup.mongohq.com:10023/animedb');

var inProgress = '0';

function getXml(response) {
  console.log("resp " + inProgress.id)
  gunzip = gunziplib.createGunzip();
  response.pipe(gunzip);
  var xml = '';
  gunzip.on('data', function(chunk) {
    console.log("data " + inProgress.id)
    xml += chunk;
  });
  gunzip.on('end', function() {
    console.log("end " + inProgress.id)
    if (xml != '<error>Banned</error>') {
      fs.writeFileSync('XML/' + inProgress.id + '.xml', xml);
      console.log("file " + inProgress.id + " save")
      animedb_list.findOne({
        id: inProgress.id
      }).exec(function(err, doc) {
        doc.d = true;
        doc.save(function(err) {
          console.log("doc " + inProgress.id + " update")
          setTimeout(sendRequest, 10000)
        });
      })
    } else {
      console.log("Banned")
    };
  });
}

function sendRequest() {
  inProgress = aList.shift()
  if (inProgress) {
    path = 'http://api.anidb.net:9001/httpapi?request=anime&client=anidbsorry&clientver=1&protover=1&aid=' + inProgress.id;
    console.log(path)
    http.request(path, getXml).end();
  } else {
    console.log("ALL DOWNLOAD")
  }
}

var animedb_list = mongoose.model('animedb_list', {
  id: Number,
  d: Boolean,
  rand: Number
});


animedb_list.find({
  d: false
}).sort({
  rand: 1
}).exec(function(err, docs) {
  aList = docs;
  sendRequest();
});
