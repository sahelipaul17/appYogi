// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mysql = require('mysql');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT || 3000;

// Configure MySQL connection
const dbConfig = {
  host: 'localhost', // Change this to your database host
  user: 'root', // Change this to your MySQL username
  password: 'Saheli@123', // Change this to your MySQL password
  database: 'remote_keyboard', // Change this to the name of your database
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);
app.use(express.static('public'));

const keyboardSize = 10;

// Create the key_states table if it doesn't exist
pool.query(
  `CREATE TABLE IF NOT EXISTS key_states (
    key_number INT PRIMARY KEY,
    color VARCHAR(10)
  );`,
  (err) => {
    if (err) throw err;
  }
);

// Initialize the key states to white (turned off) for all keys
pool.query('DELETE FROM key_states;', (err) => {
  if (err) throw err;

  const initialState = Array.from({ length: keyboardSize }, (_, index) => ({
    key_number: index,
    color: 'white',
  }));

  pool.query('INSERT INTO key_states SET ?;', initialState, (err) => {
    if (err) throw err;
  });
});

// Helper function to get the current key states
function getKeyStates(callback) {
  pool.query('SELECT * FROM key_states;', (err, results) => {
    if (err) throw err;
    callback(results);
  });
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Send the initial key states to the newly connected user
  getKeyStates((keyStates) => {
    socket.emit('initialKeyStates', keyStates);
  });

  // Function to handle control acquisition
  function acquireControl() {
    if (!socket.hasControl) {
      socket.hasControl = true;
      io.emit('controlAcquired', socket.id);

      // Automatically release control after 120 seconds of inactivity
      socket.controlTimeout = setTimeout(() => {
        releaseControl();
      }, 120000);
    }
  }

  // Function to handle control release
  function releaseControl() {
    if (socket.hasControl) {
      socket.hasControl = false;
      clearTimeout(socket.controlTimeout);
      io.emit('controlReleased');
    }
  }

  // Listen for key state changes from the client
  socket.on('keyStateChange', (data) => {
    if (socket.hasControl) {
      const { key, color } = data;
      pool.query('UPDATE key_states SET color = ? WHERE key_number = ?;', [color, key], (err) => {
        if (err) {
          console.error('Error updating key state:', err);
        } else {
          console.log('Key state updated:', key, color);
          io.emit('updateRemoteScreen', data);
          releaseControl();
        }
      });
    }
  });

  // Listen for control acquisition request from the client
  socket.on('acquireControl', acquireControl);

  // Listen for control release request from the client
  socket.on('releaseControl', releaseControl);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    if (socket.hasControl) {
      releaseControl();
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
