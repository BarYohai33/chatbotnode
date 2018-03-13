const express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let ent = require('ent');
let YouTube = require('youtube-node');
let googleTranslate = require('google-translate')('AIzaSyA9sNGTf3gzoXsl0a0KKdtlmXvF_IgymtM');
const path = require('path');
const request = require('request');
const googleGeocoding = require('google-geocoding');

app.use (express.static(path.join(`${__dirname}/../client`)));

io.sockets.on('connection', socket => {
  // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
  socket.on('nouveau_client', pseudo => {
    pseudo = ent.encode(pseudo);
    socket.pseudo = pseudo;
    socket.broadcast.emit('nouveau_client', pseudo);
  });

  // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
  socket.on('message', message => {
    message = ent.encode(message);
    socket.broadcast.emit('message', {'pseudo': socket.pseudo, 'message': message});
  });

  const reverseValue = (address, callback) => {
    googleGeocoding.geocode(address, (err, location) => {
      if (err) {
        console.log('Error: ' + err);
      } else if (! location) {
        console.log('No result.');
      } else {
        let positionsDepart = {
          'latitude': location.lat,
          'longitude': location.lng
        };

        callback(positionsDepart);
        return;
      }
    });
  };

  /*  --- Uber --- */
  const getEstimateUber = (data) => {
    const options = {
      'method': 'GET',
      'url': 'https://api.uber.com/v1.2/estimates/price',
      'qs': {
        'start_longitude': data.depart.longitude,
        'start_latitude': data.depart.latitude,
        'end_latitude': data.arrive.latitude,
        'end_longitude': data.arrive.longitude
      },
      'headers': {
        'Authorization': 'Token ' + '22tMzB_eU5xYcDM3JkBxlKyp_Pqu-774Fi6bNbrI',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/json'
      }
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error('Failed: %s', error.message);
      }
      console.log(body);
      let myJson = JSON.parse(body);

      for (let i = 0; i < myJson.prices.length; i ++) {
        socket.emit('uberName', myJson.prices[i].localized_display_name);
        socket.emit('distanceUber', myJson.prices[i].distance);
        socket.emit('priceUber', myJson.prices[i].estimate);
      }
    });
  };

  socket.on('positionsUber', test => {
    let data = {
      'depart': null,
      'arrive': null
    };

    reverseValue(test[0], result => {
      data.depart = result;
    });
    reverseValue(test[1], result => {
      data.arrive = result;
    });
    setTimeout(() => {
      getEstimateUber(data);
    }, 5000);
  });

  const getShopByPosition = (positions) => {
    const options = {
      'method': 'GET',
      'url': 'https://api.fr.carrefour.io/v1/openapi/stores',
      'qs':
       {'longitude': positions[1],
         'latitude': positions[0],
         'radius': '5000',
         'format': 'PRX'
       },
      'headers':
       {'accept': 'application/json',
         'x-ibm-client-id': '0e1dce3d-f5a4-42ba-8f2d-bf68a531bc5e',
         'x-ibm-client-secret': 'T5wB2qS4uV0aN2fD4sK1iU4nS6hS8nF4wE0sO4aD8qL8hI6mG8'
       }
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error('Failed: %s', error.message);
      }
      let myJson = JSON.parse(body);

      for (let i = 0; i < myJson.list.length; i ++) {
        socket.emit('addresses', myJson.list[i].address);
      }
    });
  };

  socket.on('position', coord1 => {
    getShopByPosition(coord1);
  });
  /* --- Google translate ---*/

  // To English
  socket.on('message', message => {
    message = ent.encode(message);

    googleTranslate.translate(message, 'en', (error, translation) => {
      socket.emit('trad', translation.translatedText);
      if (error) {
        console.log('error');
      }
    });
  });
  // To Deutsch
  socket.on('message', message => {
    message = ent.encode(message);
    googleTranslate.translate(message, 'de', (error, translation) => {
      socket.emit('trad1', translation.translatedText);
      if (error) {
        console.log('error');
      }
    });
  });

  // To spanish
  socket.on('message', message => {
    message = ent.encode(message);
    googleTranslate.translate(message, 'es', (error, translation) => {
      socket.emit('trad2', translation.translatedText);
      if (error) {
        console.log('error');
      }
    });
  });

  /* --- Youtube --- */
  const searchVideoByTerm = (name, callback) => {
    const videos = [];
    let youTube = new YouTube();

    youTube.setKey('AIzaSyA9sNGTf3gzoXsl0a0KKdtlmXvF_IgymtM');
    const maxResults = 3;

    youTube.search(name, maxResults, (error, result) => {
      if (error) {
        console.log(error);
      } else {
        for (let i = 0; i < maxResults; i ++) {
          videos.push(result.items[i].id.videoId);
        }
        io.emit('video', {'pseudo': socket.pseudo, 'message': videos});
        callback(videos);
        socket.emit('newVideo', videos);
      }
    });
    return;
  };

  socket.on('video', message => {
    searchVideoByTerm(message, result => {
      console.log(result);
    });
  });
  socket.on('youtube', message => {
    console.log(message);
    io.emit('youtube', {'pseudo': socket.pseudo, 'message': message});
  });
});

server.listen(8082);

