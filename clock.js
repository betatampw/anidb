var http = require("http");
var parseString = require('xml2js').parseString;
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:pass@troup.mongohq.com:10023/animedb');

var d = 0;


var options = {
  host: 'www.test.net-brand.ru',
  path: '/6327.xml'
};

var animedb = mongoose.model('animedb_data', {
  id: Number,
  type: String,
  episodecount: Number,
  startdate: Date, //new Date('2009-07-03')
  enddate: Date,
  title: String,
  titleru: [],
  titlejp: String,
  relatedanime: [{
    id: Number,
    type: String,
  }],
  similaranime: [{
    id: Number,
    approval: String,
    total: String,
  }],
  recommendations: [{
    type: String,
    count: Number,
  }],
  url: String,
  creators: [{
    id: Number,
    type: String,
  }],
  description: String,
  picture: String,
  categories: [], // TODO GET LIST
  tags: [], // TODO 
  characters: [], // TODO 
});

var creators = mongoose.model('animedb_creators', {
  id: Number,
  name: String,
});

var tags = mongoose.model('animedb_tags', {
  id: Number,
  spoiler: Boolean,
  name: String,
  description: String,
  count: Number
});

var characters = mongoose.model('animedb_characters', {
  id: Number,
  type: String,
  name: String,
  gender: String,
  description: String,
  picture: String,
  seiyuu: {
    id: Number,
    picture: String,
    name: String,
  }
});


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
    tmp = "tmp";
    var anime = new animedb;
    anime.id = result.anime['$'].id;
    anime.type = result.anime.type[0];
    anime.episodecount = result.anime.episodecount[0];
    anime.startdate = new Date(result.anime.startdate[0]);
    anime.enddate = new Date(result.anime.startdate[0]);

    for (var i = result.anime.titles[0].title.length - 1; i >= 0; i--) {
      if (result.anime.titles[0].title[i]['$'].type == 'main') {
        anime.title = result.anime.titles[0].title[i]['_'];
      }
      if (result.anime.titles[0].title[i]['$']['xml:lang'] == 'ru') {
        anime.titleru.push(result.anime.titles[0].title[i]['_']);
      }
      if (result.anime.titles[0].title[i]['$']['xml:lang'] == 'ja' && result.anime.titles[0].title[i]['$'].type == 'official') {
        anime.titlejp = result.anime.titles[0].title[i]['_'];
      }
    };

    for (var i = result.anime.relatedanime[0].anime.length - 1; i >= 0; i--) {
      anime.relatedanime.push({
        id: result.anime.relatedanime[0].anime[i]['$'].id,
        type: result.anime.relatedanime[0].anime[i]['$'].type
      })
    }

    for (var i = result.anime.similaranime[0].anime.length - 1; i >= 0; i--) {
      anime.similaranime.push({
        id: result.anime.similaranime[0].anime[i]['$'].id,
        approval: result.anime.similaranime[0].anime[i]['$'].approval,
        total: result.anime.similaranime[0].anime[i]['$'].total
      })
    }
    var tmpobj = {};
    for (var i = result.anime.recommendations[0].recommendation.length - 1; i >= 0; i--) {
      if (tmpobj[result.anime.recommendations[0].recommendation[i]['$'].type]) {
        tmpobj[result.anime.recommendations[0].recommendation[i]['$'].type]++;
      } else {
        tmpobj[result.anime.recommendations[0].recommendation[i]['$'].type] = 1;
      }
    }

    for (var i in tmpobj) {
      anime.recommendations.push({
        type: i,
        count: tmpobj[i],
      });
    };
    console.log(anime.recommendations[0])
    console.log(anime.recommendations[0].type)

    anime.url = tmp;
    anime.creators = [{
      id: tmp,
      type: tmp
    }];
    anime.description = tmp;
    anime.picture = tmp;
    anime.categories = [];
    anime.tags = [];
    anime.characters = [];



    // console.dir(anime);





    //anime.save();
  });
}
http.request(options, getXml).end();
