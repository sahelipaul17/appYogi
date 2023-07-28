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
});

// API endpoint to update key state
app.post('/update-key-state', (req, res) => {
  // Code to handle key state updates
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
