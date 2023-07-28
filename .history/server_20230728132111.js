// app.js

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql');

// MySQL setup
const db = mysql.createConnection({
  host: 'localhost', // Change this to your database host
  user: 'root', // Change this to your MySQL username
  password: 'Saheli@123', // Change this to your MySQL password
  database: 'remote_keyboard', 
});

// Express setup
app.use(express.static('public'));

http.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// Key states and user in control
let keyStates = Array(10).fill(false);
let userInControl = null;

// Socket.io connections
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('keyClicked', (keyIndex) => {
    if (userInControl) {
      keyStates[keyIndex] = !keyStates[keyIndex];
      io.emit('updateKeyStates', keyStates);
      updateKeyStateInDB(keyIndex, keyStates[keyIndex]); // Update key state in the database
    }
  });

  socket.on('acquireControl', () => {
    if (!userInControl) {
      userInControl = socket.id;
      io.emit('updateControlStatus', userInControl);
      updateUserInControlInDB(userInControl); // Update user in control in the database
      setTimeout(() => {
        userInControl = null;
        io.emit('updateControlStatus', null);
        updateUserInControlInDB(null); // Update user in control to null in the database
      }, 120000); // 120 seconds timeout
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    if (userInControl === socket.id) {
      userInControl = null;
      io.emit('updateControlStatus', null);
    }
  });
});

// Update key state in the database
function updateKeyStateInDB(keyIndex, isLit) {
  const query = 'UPDATE keyboard SET is_lit = ? WHERE id = ?';
  db.query(query, [isLit, keyIndex], (err) => {
    if (err) {
      console.error('Error updating key state:', err);
    }
  });
}

// Update user in control in the database
function updateUserInControlInDB(userId) {
  const query = 'UPDATE users SET user_in_control = ? WHERE id = ?';
  db.query(query, [userId, 1], (err) => {
    if (err) {
      console.error('Error updating user in control:', err);
    }
  });
}
