const express = require('express')
const http = require('http')

const app = express();
const server = http.createServer(app);

app.use(express.static('dist/static'))

server.listen(3000, function(){
  console.log('listening on *:3k');
});
