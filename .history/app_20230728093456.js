const express = require('express');
const mysql = require('mysql');
require('dotenv/config');
const app = express();
const port = 3000;

// Replace these credentials with your MySQL server details
const dbConfig = {
  host: process.env.localhost,
  user: process.env.username,
  password: process.env.userpassword,
  database: process.env.database,
};

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

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
