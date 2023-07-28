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

// Helper function to get initial key states from the database
function getInitialKeyStates() {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM key_states';
    pool.query(query, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

// Send initial key states to connected clients
async function sendInitialKeyStates(socket) {
  try {
    const keyStates = await getInitialKeyStates();
    socket.emit('initialKeyStates', keyStates);
  } catch (error) {
    console.error('Error fetching initial key states:', error);
  }
}

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });

  // Acquire control of the keyboard
  socket.on('acquireControl', () => {
    console.log('User acquired control:', socket.id);
    socket.hasControl = true;
    io.emit('controlAcquired', socket.id);

    setTimeout(() => {
      console.log('Control released automatically:', socket.id);
      socket.hasControl = false;
      io.emit('controlReleased');
    }, 120000); // 120 seconds timeout

    // Send initial key states to the newly connected user
    sendInitialKeyStates(socket);
  });

  // Handle key state changes
  socket.on('keyStateChange', (data) => {
    if (socket.hasControl) {
      const { key, color } = data;
      const query = `UPDATE key_states SET color = '${color}' WHERE key_number = ${key}`;
      pool.query(query, (err, result) => {
        if (err) {
          console.error('Error updating key state:', err);
        } else {
          console.log('Key state updated:', key, color);
          io.emit('updateRemoteScreen', data);
        }
      });
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
