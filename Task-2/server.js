const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join', (username) => {
    const user = { id: socket.id, username: username.trim() };
    users.push(user);
    socket.username = username.trim();

    io.emit('user joined', { username: socket.username, users });
  });

  socket.on('chat message', (msg) => {
    if (socket.username) {
      const messageData = {
        username: socket.username,
        message: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      io.emit('chat message', messageData);
    }
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      users = users.filter(u => u.id !== socket.id);
      io.emit('user left', { username: socket.username, users });
    }
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});