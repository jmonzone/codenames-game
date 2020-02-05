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

    var jsonWords = createJSONwords(words);

    //TEMP
    var hint = createHint(jsonWords);
    io.to(socket.id).emit('hintGiven', hint);
  });

});

function createJSONwords(words){
  var jsonWords = JSON.stringify(words);
  fs.writeFile("words.json", jsonWords, (err, result) => {
    if(err)
      console.log('error', err);
  });
  return jsonWords
}

//TEMP
function createHint(words){
  var hint = '[HINT] [COUNT]'
  return hint;
}
