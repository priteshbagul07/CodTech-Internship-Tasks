const socket = io();

let currentUsername = '';
let users = [];

const joinScreen = document.getElementById('join-screen');
const chatScreen = document.getElementById('chat-screen');
const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const usersList = document.getElementById('users-list');
const onlineCount = document.getElementById('online-count');

function joinChat() {
  const input = document.getElementById('username-input').value.trim();
  if (!input) {
    alert('Please enter a username');
    return;
  }
  currentUsername = input;
  socket.emit('join', currentUsername);

  joinScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
}

function leaveChat() {
  socket.disconnect();
  location.reload();
}

function addMessage(data, isOwn = false) {
  const div = document.createElement('div');
  div.className = `message ${isOwn ? 'own' : 'other'}`;
  div.innerHTML = `
    <div class="message-info">
      <span class="username">${data.username}</span>
      <span class="time">${data.time}</span>
    </div>
    <div class="message-text">${data.message}</div>
  `;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateUsersList() {
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.username;
    if (user.username === currentUsername) li.classList.add('current-user');
    usersList.appendChild(li);
  });
  onlineCount.textContent = users.length;
}

// Socket Events
socket.on('user joined', (data) => {
  users = data.users;
  updateUsersList();
  const sys = {
    username: 'System',
    message: `${data.username} joined the chat`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  addMessage(sys);
});

socket.on('user left', (data) => {
  users = data.users;
  updateUsersList();
  const sys = {
    username: 'System',
    message: `${data.username} left the chat`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  addMessage(sys);
});

socket.on('chat message', (data) => {
  const isOwn = data.username === currentUsername;
  addMessage(data, isOwn);
});

// Send message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (msg && currentUsername) {
    socket.emit('chat message', msg);
    messageInput.value = '';
  }
});