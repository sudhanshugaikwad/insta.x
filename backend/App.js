const dns = require('node:dns');
dns.setServers(['1.1.1.1', '1.0.0.1']); // Cloudflare DNS - fixes querySrv ECONNREFUSED


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { mongoUrl } = require('./Keys');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Import models
require('./moduls/moduls');
require('./moduls/post');

// Middleware
app.use(express.json());

// Import routes
const authRoutes = require('./routus/auth');
const postRoutes = require('./routus/createPost');
const userRoutes = require('./routus/user');

// Use routes
app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);

// Connect to MongoDB
mongoose.connect(mongoUrl)
  .then(() => {
    console.log('Your Database is connected to MongoDB..!');
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
  });

app.get('/', function (req, res) {
  res.send('Welcome to Instagram Clone API');
});

app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
});