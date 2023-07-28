const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mysql = require('mysql');

const port = 3000;

// Create a MySQL connection
const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: 'Saheli@123', 
    database: 'remote_keyboard', 
  });
  

// Connect to the MySQL server
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// In-memory storage for keyboard state and control
const keyboardState = {};
let controlUser = null;

// Function to update the key state in the database
function updateKeyStateInDatabase(key, state) {
  const query = `UPDATE keyboard SET state = ${state ? 1 : 0} WHERE key_id = ${key}`;
  db.query(query, (err) => {
    if (err) {
      console.error('Error updating key state in the database:', err);
    }
  });
}

// Function to acquire control of the keyboard
function acquireControl(userId) {
  if (controlUser === null) {
    controlUser = userId;
    io.emit('controlAcquired', userId);
    console.log(`User ${userId} has acquired control`);
  }
}

// Function to release control of the keyboard
function releaseControl() {
  if (controlUser !== null) {
    controlUser = null;
    io.emit('controlReleased');
    console.log('Control released');
  }
}

// Handle client connection and set up event listeners
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send the initial keyboard state to the connected client
  socket.emit('initialKeyboardState', keyboardState);

  // Handle key state update requests from the client
  socket.on('updateKeyState', ({ key, state }) => {
    if (controlUser !== null) {
      keyboardState[key] = state;
      updateKeyStateInDatabase(key, state); // Update the state in the database
      socket.broadcast.emit('keyStateChanged', { key, state });
      console.log(`Key ${key} state updated to ${state}`);
    }
  });

  // Handle control acquisition requests from the client
  socket.on('acquireControl', (userId) => {
    acquireControl(userId);
  });

  // Handle control release requests from the client
  socket.on('releaseControl', () => {
    releaseControl();
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Serve static files (index.html and client-side JS)
app.use(express.static('public'));

http.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



