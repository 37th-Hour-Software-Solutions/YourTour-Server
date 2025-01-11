const express = require('express');
const cors = require('cors');
// require("dotenv").config();
const app = express();
const port = 3000; // You can choose any port you like


app.use("/", require("./methods/login.js"));

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on port ${port}`);
});