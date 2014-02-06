var http = require("http");
var parseString = require('xml2js').parseString;
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:pass@troup.mongohq.com:10023/animedb');

var d = 0;

var options = {
  host: 'www.test.net-brand.ru',
  path: '/10291.xml'
};
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
  titleen: String,
  relatedanime: [{
    anime: Number,
    relatedanimeType: String,
  }],
  simani: [{
    anime: Number,
    simaniApproval: String,
    simaniTotal: String,
  }],
  recomm: [{
    recommType: String,
    recommCount: Number,
  }],
  url: String,
  creators: [],
  description: String,
  picture: String,
  categories: [], // TODO GET LIST
  tags: [],
  characters: [],
});

var category = mongoose.model('animedb_categories', {
  id: Number,
  parentid: Number,
  name: String,
  description: String
});

var creators = mongoose.model('animedb_creators', {
  id: Number,
  name: String,
  types: {}
});

var tags = mongoose.model('animedb_tags', {
  id: Number,
  name: String,
  description: String,
  spoiler: Boolean,
  localspoiler: Boolean,
  globalspoiler: Boolean,
  count: Number
});

var characters = mongoose.model('animedb_characters', {
  id: Number,
  name: String,
  gender: String,
  description: String,
  picture: String,
  charactertype: String,
  types: {},
  seiyuu: Number
});

var seiyuu = mongoose.model('animedb_seiyuu', {
  id: Number,
  name: String,
  picture: String,
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

    if (result.anime) {
      var anime = new animedb;
      anime.id = result.anime['$'].id;

      if (result.anime.type) {
        anime.type = result.anime.type[0];
      }

      if (result.anime.episodecount) {
        anime.episodecount = result.anime.episodecount[0];
      }
      if (result.anime.startdate) {
        anime.startdate = new Date(result.anime.startdate[0]);
      }

      if (result.anime.enddate) {
        anime.enddate = new Date(result.anime.enddate[0]);
      }

      if (result.anime.titles) {
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
          if (result.anime.titles[0].title[i]['$']['xml:lang'] == 'en' && result.anime.titles[0].title[i]['$'].type == 'official') {
            anime.titleen = result.anime.titles[0].title[i]['_'];
          }
        };
      }

      if (result.anime.relatedanime) {
        for (var i = result.anime.relatedanime[0].anime.length - 1; i >= 0; i--) {
          anime.relatedanime.push({
            anime: result.anime.relatedanime[0].anime[i]['$'].id,
            animetType: result.anime.relatedanime[0].anime[i]['$'].type-----BUG
          })
        }
      }

      if (result.anime.similaranime) {
        for (var i = result.anime.similaranime[0].anime.length - 1; i >= 0; i--) {
          anime.simani.push({
            anime: result.anime.similaranime[0].anime[i]['$'].id,
            simaniApproval: result.anime.similaranime[0].anime[i]['$'].approval,
            simaniTotal: result.anime.similaranime[0].anime[i]['$'].total
          })
        }
      }

      if (result.anime.recommendations) {
        var tmpobj = {};
        for (var i = result.anime.recommendations[0].recommendation.length - 1; i >= 0; i--) {
          if (tmpobj[result.anime.recommendations[0].recommendation[i]['$'].type]) {
            tmpobj[result.anime.recommendations[0].recommendation[i]['$'].type]++;
          } else {
            tmpobj[result.anime.recommendations[0].recommendation[i]['$'].type] = 1;
          }
        }

        for (var i in tmpobj) {
          anime.recomm.push({
            recommType: i,
            recommCount: tmpobj[i]
          });
        };
      }

      if (result.anime.enddate) {
        anime.url = result.anime.url[0];
      }

      if (result.anime.creators) {
        for (var i = result.anime.creators[0].name.length - 1; i >= 0; i--) {
          anime.creators.push(result.anime.creators[0].name[i]['$'].id)

          // TODO creators add/update
          //getlist 
          if (false) {
            //update
          } else {
            //add
            creator = new creators
            if (result.anime.creators[0].name[i]['$'])
              creator.id = result.anime.creators[0].name[i]['$'].id;

            if (result.anime.creators[0].name[i]['_'])
              creator.name = result.anime.creators[0].name[i]['_'];

            creator.types = creator.types || {};
            if (result.anime.creators[0].name[i]['$'].type)
              creator.types[anime.id] = result.anime.creators[0].name[i]['$'].type;

            console.dir(creator);
            //creator.save();            
          }

        }
      }

      anime.description = '';

      if (result.anime.picture) {
        anime.picture = result.anime.picture[0] || '';
      }
      if (result.anime.creators) {
        for (var i = result.anime.categories[0].category.length - 1; i >= 0; i--) {
          anime.categories.push(result.anime.categories[0].category[i]['$'].id)
        }
      }

      if (result.anime.tags) {
        for (var i = result.anime.tags[0].tag.length - 1; i >= 0; i--) {
          anime.tags.push(result.anime.tags[0].tag[i]['$'].id)

          // TODO tags add/update
          //getlist 
          if (false) {
            //update
          } else {
            //add
            tag = new tags

            if (result.anime.tags[0].tag[i]['$'].id)
              tag.id = result.anime.tags[0].tag[i]['$'].id;
            if (result.anime.tags[0].tag[i].name)
              tag.name = result.anime.tags[0].tag[i].name;
            if (result.anime.tags[0].tag[i].description)
              tag.description = result.anime.tags[0].tag[i].description;
            if (result.anime.tags[0].tag[i]['$'].spoiler)
              tag.spoiler = result.anime.tags[0].tag[i]['$'].spoiler;
            if (result.anime.tags[0].tag[i]['$'].localspoiler)
              tag.localspoiler = result.anime.tags[0].tag[i]['$'].localspoiler;
            if (result.anime.tags[0].tag[i]['$'].globalspoiler)
              tag.globalspoiler = result.anime.tags[0].tag[i]['$'].globalspoiler;
            if (result.anime.tags[0].tag[i].count)
              tag.count = result.anime.tags[0].tag[i].count;

            console.dir(tag);
            //tag.save();            
          }

        }
      }

      if (result.anime.characters) {
        for (var i = result.anime.characters[0].character.length - 1; i >= 0; i--) {
          anime.characters.push(result.anime.characters[0].character[i]['$'].id);
          // TODO characters add/update
          //getlist 
          if (false) {
            //update
          } else {
            //add

            character = new characters

            if (result.anime.characters[0].character[i]['$'].id)
              character.id = result.anime.characters[0].character[i]['$'].id;
            if (result.anime.characters[0].character[i].name)
              character.name = result.anime.characters[0].character[i].name;
            if (result.anime.characters[0].character[i].gender)
              character.gender = result.anime.characters[0].character[i].gender;
            if (result.anime.characters[0].character[i].description)
              character.description = result.anime.characters[0].character[i].description;
            if (result.anime.characters[0].character[i].picture)
              character.picture = result.anime.characters[0].character[i].picture;
            if (result.anime.characters[0].character[i].charactertype)
              character.charactertype = result.anime.characters[0].character[i].charactertype['_'];

            character.types = character.types || {};
            if (result.anime.characters[0].character[i]['$'].type)
              character.types[anime.id] = result.anime.characters[0].character[i]['$'].type;

            if (result.anime.characters[0].character[i].seiyuu)
              character.seiyuu = result.anime.characters[0].character[i].seiyuu[0]['$'].id;


            console.dir(character);
            //character.save();            
          }



          // TODO seiyuu add/update  
          //getlist 
          if (false) {
            //update
          } else {
            //add
            seiy = new seiyuu
            if (result.anime.characters[0].character[i].seiyuu)
              seiy.id = result.anime.characters[0].character[i].seiyuu[0]['$'].id;
            if (result.anime.characters[0].character[i].seiyuu)
              seiy.name = result.anime.characters[0].character[i].seiyuu[0]['_'];
            if (result.anime.characters[0].character[i].seiyuu) {
              if (seiy.picture = result.anime.characters[0].character[i].seiyuu[0]['$'].picture)
                seiy.picture = result.anime.characters[0].character[i].seiyuu[0]['$'].picture;
            }

            console.dir(seiy);
            //seiy.save();            
          }

        }
      }
      console.dir(anime);

      anime.save();




    } else {
      console.log("xml_error");
    }


  });
}
http.request(options, getXml).end();
