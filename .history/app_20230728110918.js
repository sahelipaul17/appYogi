const express = require('express');
const mysql = require('mysql');
require('dotenv/config');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: 'Saheli@123', 
    database: 'remote_keyboard', 
  });
  
/// Connect to the MySQL server
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

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files (index.html, CSS, and client-side JS)
app.use(express.static('public'));

// API endpoint to acquire keyboard control
app.post('/acquire-control', (req, res) => {
  // Code to handle acquiring control
  const { user } = req.body;

  if (controlUser === null || controlUser === user) {
    controlUser = user;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// API endpoint to update key state
app.post('/update-key-state', (req, res) => {
  // Code to handle key state updates
  const { user, key, state } = req.body;

  if (user === controlUser) {
    keyboardState[key] = state;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
  
});
// API endpoint to get the current keyboard state
app.get('/get-keyboard-state', (req, res) => {
  res.json(keyboardState);
});
// Function to load keyboard state and control from the database on server startup
function loadKeyboardStateFromDatabase() {
    const query = 'SELECT * FROM keyboard';
    db.query(query, (err, rows) => {
      if (err) {
        console.error('Error loading keyboard state from the database:', err);
        return;
      }
  
      // Populate keyboardState object with data from the database
      rows.forEach((row) => {
        keyboardState[row.key_id] = row.state === 1;
      });
    });
  }
  
  // Load keyboard state and control from the database on server startup
  loadKeyboardStateFromDatabase();
// Periodically check for control timeout and release control if necessary
setInterval(() => {
  if (controlUser !== null) {
    controlUser = null;
    // Clear the keyboard state when control is released
    Object.keys(keyboardState).forEach((key) => {
      keyboardState[key] = false;
    });
  }
}, 120000); // 120 seconds (control timeout)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
