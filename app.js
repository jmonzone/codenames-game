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

  var cachedHint = ""
  socket.on('wordsCreated', (words) => {

    var jsonWords = JSON.stringify(words);

    io.to(socket.id).emit('messageSent', 'Waiting for hint...');
    var hint = createHint(jsonWords, (hint) => {
      io.to(socket.id).emit('clearMessages');
      io.to(socket.id).emit('hintGiven', hint);
      io.to(socket.id).emit('messageSent', 'Select 3 different words.');
      cachedHint = hint;
    });

  });

  var selectedWords = [];
  var cachedWords =[]
  socket.on('wordSelected', (word) => {
    if (!cachedWords.includes(word.string)){
      selectedWords.push(word);
      cachedWords.push(word.string);

      io.to(socket.id).emit('clearMessages');
      io.to(socket.id).emit('messageSent', 'Hint: ' + cachedHint.toUpperCase());
      // io.to(socket.id).emit('messageSent', 'Select ' + (3 - selectedWords.length) + ' more words.');

      var selectsLeft = 3 - selectedWords.length;
      if (selectsLeft > 0)
        io.to(socket.id).emit('messageSent', 'Select ' + selectsLeft + ' more words.');
    }

    if (selectedWords.length == 3){
      var score = 0;
      var goodWords = [];
      var badWords = [];

      selectedWords.forEach((word) => {
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
