var riot = require('riot');
var header = require('./tags/webplayer/header.tag');

var html = riot.render(header, { marker: {
  poi_id: "5a560fcc4022830001c80c51",
  poi_name: "Getting there",
  place_id: "ChIJRdBNVHVrnUcRGT-I40h8Q1k",
  start_time: 131,
  end_time: 164,
  tips_description:
    "Innsbruck Airport is served by daily scheduled flights and numerous charter flights from UK airports. ",
  location: { latitude: 0, longitude: 0 }
} });

console.log(html);