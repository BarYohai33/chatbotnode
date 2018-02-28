const express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let ent = require('ent');
const path = require('path');
const Uber = require('node-uber');

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
});

// app.get('/uber-api/estimate', (req, res) => {
var uber = new Uber({
  'client_id': 'eIQAknkwkagFuvw3xT7pmt3wUwNYDqf2',
  'client_secret': 'CzQOVYMA3Zk1bixX4pl4cUjK8AB57bHrr3aOE1rm',
  'server_token': '22tMzB_eU5xYcDM3JkBxlKyp_Pqu-774Fi6bNbrI',
  'redirect_uri': 'http://localhost:8082',
  'name': 'chatbotnode',
  'language': 'fr_FR', // optional, defaults to en_US
  'sandbox': true // optional, defaults to false
});

app.get('/api/login', function (request, response) {
  var url = uber.getAuthorizeUrl(['history', 'profile', 'request', 'places']);

  response.redirect(url);
});
app.get('/api/callback', function (request, response) {
  uber.authorizationAsync({'authorization_code': request.query.code})
    .spread(function (access_token, refresh_token, authorizedScopes, tokenExpiration) {
      // store the user id and associated access_token, refresh_token, scopes and token expiration date
      console.log('New access_token retrieved: ' + access_token);
      console.log('... token allows access to scopes: ' + authorizedScopes);
      console.log('... token is valid until: ' + tokenExpiration);
      console.log('... after token expiration, re-authorize using refresh_token: ' + refresh_token);

      uber.products.getAllForAddressAsync('1455 Market St, San Francisco, CA 94103, US')
        .then(function (res) {
          console.log(res);
        })
        .error(function (err) {
          console.error(err);
        });

      // redirect the user back to your actual app
      response.redirect('/web/index.html');
    })
    .error(function (err) {
      console.error(err);
    });
});

//   uber.getAuthorizeUrl(['history','profile', 'request', 'places']);
//   uber.estimates.getPriceForRouteByAddressAsync("Paris 19", "Paris 15").then(res => {
//     res.write(JSON.stringify(res));
//   });
// })

server.listen(8082);
