const express = require('express');
let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
let fs = require('fs');
// Chargement de la page index.html

app.use(express.static(__dirname + '/../client'));

io.sockets.on('connection', (socket, pseudo) => {
  // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
  socket.on('nouveau_client', (pseudo) => {
    pseudo = ent.encode(pseudo);
    socket.pseudo = pseudo;
    socket.broadcast.emit('nouveau_client', pseudo);
  });

  // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
  socket.on('message', (message) => {
    console.log(message);
    message = ent.encode(message);
    socket.broadcast.emit('message', {'pseudo': socket.pseudo, 'message': message});
    console.log(message);
  });
});

server.listen(8082);
