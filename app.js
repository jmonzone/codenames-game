const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const fs = require('fs');

const publicPath = path.join(__dirname,'./public');
const port = process.env.PORT || 3000;

const mongo = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';

let uri = 'mongodb://heroku_0d04wclg:jhloj5tfokltnjuajvb6m2n92m@ds249717.mlab.com:49717/heroku_0d04wclg'

let app = express();
let server = http.createServer(app);
let io = socketIO(server);


app.use(express.static(publicPath));

server.listen(port, () => {
  console.log('Server is up on port ' + port);
});

io.on('connect', (socket) => {

  var jsonResults = "";
  var params = "";

  socket.on('wordsCreated', (param) => {

    io.to(socket.id).emit('messageSent', 'Waiting for hint...');

    var hint = createHint(param, (results) => {
      io.to(socket.id).emit('clearMessages');
      io.to(socket.id).emit('hintGiven', results);
      jsonResults = results;
      params = param;
    });

  });

  socket.on('wordsSelected', (words) => {

    var score = 0;
    var goodWords = [];
    var badWords = [];
    var blackWords = [];

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
          score -= 4;
          blackWords.push(word.string);
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

    var results = JSON.parse(jsonResults);

    var dbResults =
    {
      id: socket.request.socket.remoteAddress,
      algorithm: params.algorithmPath.replace('.py',''),
      vectors: params.vectorPath.replace('-embeddings.txt',''),
      score: score,
      hint: results.hint,
      hintCount: results.count,
      selectedWords: goodWords.concat(badWords).concat(blackWords),
      blueWords: params.blues,
      redWords: params.reds,
      blackWords: params.blacks,
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
  mongo.connect(uri, {
    useUnifiedTopology: true
  }, function(err, client) {
    if(err) throw err;
    const db = client.db('heroku_0d04wclg');
    const collection = db.collection('results');
    collection.insertOne(results, (err, result) => {});
    callback();
  });

}
