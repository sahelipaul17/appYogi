const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const keyboardState = {
  '1': false,
  '2': false,
  '3': false,
  '4': false,
  '5': false,
  '6': false,
  '7': false,
  '8': false,
  '9': false,
  '10': false,
};

let controlUser = null;

io.on('connection', (socket) => {
  console.log('New user connected');

  // Send initial keyboard state to the client
  socket.emit('initialKeyboardState', keyboardState);

  // Handle key state update from the client
  socket.on('updateKeyState', ({ user, key, state }) => {
    if (controlUser === user) {
      keyboardState[key] = state;
      io.emit('keyStateChanged', { key, state, userId: user });
    }
  });

  // Handle control acquisition request from the client
  socket.on('acquireControl', (userId) => {
    if (controlUser === null) {
      controlUser = userId;
      io.emit('controlAcquired', userId);
      startControlTimer();
    }
  });

  // Handle control release request from the client
  socket.on('releaseControl', () => {
    if (controlUser !== null) {
      controlUser = null;
      io.emit('controlReleased');
      stopControlTimer();
    }
  });

  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');
    if (controlUser === socket.id) {
      controlUser = null;
      io.emit('controlReleased');
      stopControlTimer();
    }
  });

  // Function to start the control timer
  function startControlTimer() {
    controlTimer = setTimeout(() => {
      controlUser = null;
      io.emit('controlReleased');
    }, 120000); // 120 seconds (2 minutes)
  }

  // Function to stop the control timer
  function stopControlTimer() {
    if (controlTimer) {
      clearTimeout(controlTimer);
      controlTimer = null;
    }
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
