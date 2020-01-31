const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {Users} = require('./utils/users');

const publicPath = path.join(__dirname,'/../public');
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let users = new Users();

app.use(express.static(publicPath));

io.on('connect', (socket) => {

  socket.on('joinRequest', (params) => {

    var name = params.name;
    var room = params.room;

    socket.join(room);
    console.log(name + ' has just joined ' + room + '.');
    sendMessage(socket.id, 'Game', 'Welcome to room ' + room + '!');

    users.removeUser(socket.id);
    var user = users.addUser(socket.id, name, room);

    if(users.getUsers(room).length == 1){
      user.isHost = true;
    }

    io.to(room).emit('updateUsers', users.getUsers(room));

    socket.on('messageRequest', (message) => {
      sendMessage(room, name, message);
    });

    // socket.on('startRequest', () => {
    //
    // });

  });



  socket.on('disconnect', () => {
    let user = users.removeUser(socket.id);
    if(user){
      io.to(user.room).emit('updateUsers', users.getUsers(user.room));
      console.log(user.name + ' has just left ' + user.room + '.');
    }
  });
});

function sendMessage(to, from, message){
  io.to(to).emit('messageSent', from, message);
}

function assignTeams(){
  var teams = new Map();
  return teams;
}

server.listen(port, () => {
  console.log('Server is up on port ' + port);
});
