const express = require('express')
const http = require('http')
const socketio = require('socket.io')
require('socket.io-client');

const app = express();
const server = http.createServer(app);
const io_server = socketio(server, { serveClient: false });

app.use(express.static('dist/static'));

io_server.on('connection', function(socket){
    console.log('a user connected');

    socket.on('chat message', function(msg){
        console.log('received from client: ' + msg);
        io_server.emit('chat message reply', `server got a msg: "${msg}"`);
    });
});

server.listen(3000, function(){
  console.log('listening on *:3k');
});