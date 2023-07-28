const express = require('express');
const mysql = require('mysql2');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000; // You can use any available port

// MySQL database configuration (replace with your actual MySQL credentials)
const db = mysql.createConnection({
  host: 'localhost', // Change this to your database host
  user: 'root', // Change this to your MySQL username
  password: 'Saheli@123', // Change this to your MySQL password
  database: 'remote_keyboard', 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database.');
});

app.use(express.static('public'));
app.use(express.json());

// API endpoint to acquire control
app.post('/api/acquire',(req, res) => {
  if (req.user && !req.user.hasControl) {
    req.user.hasControl = true;
    res.status(200).json({ message: 'Control acquired successfully' });
  } else {
    res.status(403).json({ error: 'Control is already acquired by another user' });
  }
});

// API endpoint to release control
app.post('/api/release',(req, res) => {
  if (req.user && req.user.hasControl) {
    req.user.hasControl = false;
    res.status(200).json({ message: 'Control released successfully' });
  } else {
    res.status(403).json({ error: 'You do not have control to release' });
  }
});

// API endpoint to handle key clicks and store the data in the database
app.post('/api/keys', authenticateUser, (req, res) => {
  const { keyIndex, color } = req.body;

  // Perform the database insertion
  const sql = 'INSERT INTO keys (key_index, color) VALUES (?, ?)';
  const values = [keyIndex, color];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      // Notify all connected clients about the key update
      io.emit('keyUpdate', { keyIndex, color });
      res.status(200).json({ message: 'Key updated successfully' });
    }
  });
});
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
