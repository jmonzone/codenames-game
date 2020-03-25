const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const fs = require('fs');

const publicPath = path.join(__dirname,'./public');
const port = process.env.PORT || 3000;

const mongo = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

let app = express();
let server = http.createServer(app);
let io = socketIO(server);


app.use(express.static(publicPath));

server.listen(port, () => {
  console.log('Server is up on port ' + port);
});

io.on('connect', (socket) => {

  socket.on('wordsCreated', (param) => {

    io.to(socket.id).emit('messageSent', 'Waiting for hint...');

    var hint = createHint(param, (results) => {
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
    io.to(socket.id).emit('messageSent', 'Correct answers: ' + goodWordsStr);
    io.to(socket.id).emit('messageSent', 'Wrong answers: ' + badWordsStr);
    io.to(socket.id).emit('resultsCalculated');

    var dbResults =
    {
      id: socket.request.socket.remoteAddress,
      scor: score,
    };

    saveToDatabase(dbResults, () => {
      io.to(socket.id).emit('messageSent', 'Results saved to database.');
    });
  })

});

function createHint(param, callback){
  var spawn = require("child_process").spawn;

  var python = spawn('python3', ["./python/algorithms/" + param.algorithmPath, JSON.stringify(param)]);

  python.stdout.on('data', function(results) {
    callback(results.toString());
  });
}

function saveToDatabase(results, callback){

  mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, (err, client) => {
    if (err) {
      console.error(err);
      return;
    }
    const db = client.db('heroku_0d04wclg');
    const collection = db.collection('results');

    collection.insertOne(results, (err, result) => {});

    callback();
  });

}
