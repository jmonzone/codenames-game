const path = require('path');
const http = require('http');
const express = require('express');

const publicPath = path.join(__dirname,'./public');
const port = process.env.PORT || 3000;

let app = express();
let server = http.createServer(app);

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log('Server is up on port ' + port);
});
