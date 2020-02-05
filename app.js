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
    var dictstring = JSON.stringify(words);
    fs.writeFile("words.json", dictstring, (err, result) => {
      if(err)
        console.log('error', err);
    });
    
    console.log(dictstring);
  });

});
