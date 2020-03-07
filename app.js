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

  socket.on('wordsCreated', (words, vectorPath, minCosDistance) => {

    var jsonWords = JSON.stringify(words);

    io.to(socket.id).emit('messageSent', 'Waiting for hint...');

    var hint = createHint(jsonWords, vectorPath, minCosDistance, (results) => {
      io.to(socket.id).emit('clearMessages');
      io.to(socket.id).emit('hintGiven', results);
    });

  });

  socket.on('wordsSelected', (words) => {
    var score = 0;
    var goodWords = [];
    var badWords = [];

    words.forEach((word) => {
      switch (word.color) {
        case 'blue':
          score++;
          goodWords.push(word.string);
          break;
        case 'red':
          score--;
          badWords.push(word.string);
          break;
        case 'black':
          score -= 2;
          badWords.push(word.string + ' (ASSASSIN)');
          break;
      }
    });

    var goodWordsStr = "";

    goodWords.forEach((word) => {
      goodWordsStr += ' ' + word.toUpperCase() + ',';
    });
    goodWordsStr = goodWordsStr.substring(0, goodWordsStr.length - 1);

    var badWordsStr = "";

    badWords.forEach((word) => {
      badWordsStr += ' ' + word.toUpperCase() + ',';
    });
    badWordsStr = badWordsStr.substring(0, badWordsStr.length - 1);

    io.to(socket.id).emit('messageSent', 'Score: ' + score);
    io.to(socket.id).emit('messageSent', 'Correct Answers: ' + goodWordsStr);
    io.to(socket.id).emit('messageSent', 'Wrong Answers: ' + badWordsStr);
  })

});

function createHint(words, vectorPath, minCosDistance, callback){
  var spawn = require("child_process").spawn;

  var input = JSON.stringify({
    words: words,
    vectorPath: vectorPath,
    minCosDistance: minCosDistance
  });

  var python = spawn('python3', ["./python/createWeightedHint.py", input]);

  python.stdout.on('data', function(results) {
    callback(results.toString());
  });
}
