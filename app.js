const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const fs = require('fs');

const publicPath = path.join(__dirname,'./public');
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log('Server is up on port ' + port);
});

io.on('connect', (socket) => {

  socket.on('wordsCreated', (words) => {

    var jsonWords = JSON.stringify(words);

    io.to(socket.id).emit('messageSent', 'Waiting for hint...');
    var hint = createHint(jsonWords, (hint) => {
      io.to(socket.id).emit('clearMessages');
      io.to(socket.id).emit('hintGiven', hint);
    });

  });

  var selectedWords = [];
  var cachedWords =[]
  socket.on('wordSelected', (word) => {
    if (!cachedWords.includes(word.string)){
      selectedWords.push(word);
      cachedWords.push(word.string);
    }

    if (selectedWords.length == 3){
      var jsonResults = JSON.stringify(results);
      io.to(socket.id).emit('messageSent', 'JSON results: ' +  jsonResults);
    }
  })

});

function createHint(words, callback){
  var spawn = require("child_process").spawn;
  var python = spawn('python3', ["./python/create_hint.py", words]);
  python.stdout.on('data', function(hint) {
    callback(hint.toString());
  });
}
