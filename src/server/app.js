const express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let ent = require('ent');
let YouTube = require('youtube-node');
let googleTranslate = require('google-translate')('AIzaSyA9sNGTf3gzoXsl0a0KKdtlmXvF_IgymtM');
const path = require('path');
// const Uber = require('node-uber');

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
/*  --- Uber --- */
// let uber = new Uber({
//   'client_id': 'eIQAknkwkagFuvw3xT7pmt3wUwNYDqf2',
//   'client_secret': 'CzQOVYMA3Zk1bixX4pl4cUjK8AB57bHrr3aOE1rm',
//   'server_token': '22tMzB_eU5xYcDM3JkBxlKyp_Pqu-774Fi6bNbrI',
//   'redirect_uri': 'http://localhost:8082',
//   'name': 'chatbotnode',
//   'language': 'fr_FR', // optional, defaults to en_US
//   'sandbox': true // optional, defaults to false
// });

// app.get('/api/login', (request, response) => {
//   var url = uber.getAuthorizeUrl(['history', 'profile', 'request', 'places']);

//   response.redirect(url);
// });
// app.get('/api/callback', function (request, response) {
//   uber.authorizationAsync({'authorization_code': request.query.code})
//     .spread(function (access_token, refresh_token, authorizedScopes, tokenExpiration) {
//     // store the user id and associated access_token, refresh_token, scopes and token expiration date
//       console.log('New access_token retrieved: ' + access_token);
//       console.log('... token allows access to scopes: ' + authorizedScopes);
//       console.log('... token is valid until: ' + tokenExpiration);
//       console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);

//       uber.requests.getEstimatesAsync({
//         'start_latitude': 48.8684025,
//         'start_longitude': 2.4180487,
//         'end_latitude': 48.8774485,
//         'end_longitude': 2.3846564
//       })
//         .then(function (res) {
//           response.json(res);
//           console.log(res);
//         })
//         .error(function (err) {
//           response.end();
//           console.error(err);
//         });
//     })
//     .error(function (err) {
//       response.end();
//       console.error(err);
//     });
// });
server.listen(8082);

