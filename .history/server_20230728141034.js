// server.js

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
  host: 'localhost', // Change this to your database host
  user: 'root', // Change this to your MySQL username
  password: 'Saheli@123', // Change this to your MySQL password
  database: 'remote_keyboard',// Replace with your preferred database name
};

const connection = mysql.createConnection(dbConfig);

let isControlAcquired = false;
let currentControlTimeout = null;

const KEY_COLORS = {
  USER1: 'red',
  USER2: 'yellow',
};

let keyStates = {};

io.on('connection', (socket) => {
  socket.emit('initialKeyStates', keyStates);

  socket.on('keyStateChange', (data) => {
    if (!isControlAcquired) return;

    const { key, color } = data;
    keyStates[key] = color;
    socket.broadcast.emit('updateRemoteScreen', data);

    // Update the database with the new key state
    connection.query(
      'INSERT INTO key_states (key, color) VALUES (?, ?) ON DUPLICATE KEY UPDATE color = VALUES(color)',
      [key, color],
      (err) => {
        if (err) {
          console.error('Error updating key state:', err);
        }
      }
    );
  });

  socket.on('acquireControl', () => {
    if (!isControlAcquired) {
      isControlAcquired = true;
      io.emit('controlAcquired', socket.id);
      currentControlTimeout = setTimeout(releaseControl, 120000); // 120 seconds timeout
    }
  });

  socket.on('releaseControl', () => {
    releaseControl();
  });

  socket.on('disconnect', () => {
    if (socket.id === currentControlTimeout) {
      releaseControl();
    }
  });
});

function releaseControl() {
  isControlAcquired = false;
  io.emit('controlReleased');
  clearTimeout(currentControlTimeout);
}

http.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
