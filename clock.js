var http = require("http");
var parseString = require('xml2js').parseString;
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:pass@troup.mongohq.com:10023/animedb');




var options = {
  host: 'www.test.net-brand.ru',
  path: '/6327.xml'
};

var options = {
  host: 'www.test.net-brand.ru',
  path: '/list.xml'
};

function getXml(response) {
  var xml = '';
  response.on('data', function(chunk) {
    xml += chunk;
  });
  response.on('end', function() {
    converXml(xml);
  });
}

function converXml(xml) {
  parseString(xml, function(err, result) {
    console.dir(result);
  });
}

http.request(options, getXml).end();


/*
var animedb = mongoose.model('animedb_list', {
  id: Number,
  download: Boolean
});

var anime = new animedb({
  name: 'Zildjian'
});
product.save(function(err) {
  if (err) {
    console.log('meow');
  } else {
    console.log('OK');
  }
});*/
