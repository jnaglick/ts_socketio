import { runInThisContext } from "vm";

const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const app = express();
const httpServer = http.createServer(app);
const socketServer = socketio(httpServer, { serveClient: false, transports: ['websocket'] });

app.use(express.static('dist/static'));

class User {
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

class Chat {
  name: string;
  users: Array<User>;

  constructor(name) {
    this.name = name
    this.users = []
  }
}

const ChatDB: Array<Chat> = []

socketServer.of(/^\/chat\/\d+$/).on('connection', function(socket) {
  console.log(`got connection to ${socket.nsp.name}`);

  const chatId = socket.nsp.name.match(/\d+/)[0];
  let chat = ChatDB.find((chat) => chat.name == chatId);
  if (!chat) {
    chat = new Chat(chatId);
    ChatDB.push(chat);
  }

  const user = new User(socket.id);

  chat.users = [ ...chat.users, user ];

  socket.broadcast.emit('user_joined_chat', { user });

  socket.on('disconnect', (reason) => {
    chat.users = chat.users.filter((u) => u.id != user.id);
    // TODO check if should destroy Chat
    socket.broadcast.emit('user_left_chat', { user });
  });

  socket.on('user_list', (callback) => {
    callback({ users: chat.users })
  });

  socket.on('message_from_user', (message) => {
    socket.broadcast.emit('message_from_user', { user, message })
  });

  socket.on('typing_from_user', () => {
    socket.broadcast.emit('typing_from_user', { user })
  });
})


httpServer.listen(4000, function() {
  console.log('listening on *:4k');
});