// const dns = require('node:dns');
// dns.setServers(['1.1.1.1', '1.0.0.1']); // Cloudflare DNS - fixes querySrv ECONNREFUSED


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const { mongoUrl } = require('./Keys');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());

// // Import models
// require('./moduls/moduls');
// require('./moduls/post');

// // Middleware
// app.use(express.json());

// // Import routes
// const authRoutes = require('./routus/auth');
// const postRoutes = require('./routus/createPost');
// const userRoutes = require('./routus/user');

// // Use routes
// app.use(authRoutes);
// app.use(postRoutes);
// app.use(userRoutes);

// // Connect to MongoDB
// mongoose.connect(mongoUrl)
//   .then(() => {
//     console.log('Your Database is connected to MongoDB..!');
//   })
//   .catch((error) => {
//     console.error('MongoDB connection failed:', error.message);
//   });

// app.get('/', function (req, res) {
//   res.send('Welcome to insta.x  API');
// });

// app.listen(PORT, function () {
//   console.log(`Server started on port ${PORT}`);
// });

const dns = require('node:dns');
dns.setServers(['1.1.1.1', '1.0.0.1']); // Cloudflare DNS - fixes querySrv ECONNREFUSED

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { MONGO_URL, JWT_SECRET, PORT = 8000 } = process.env;

if (!MONGO_URL || !JWT_SECRET) {
  throw new Error('MONGO_URL and JWT_SECRET must be configured in .env');
}

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://insta-x-jfgn.onrender.com",
    "http://localhost:3000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Import models
require('./moduls/moduls');
require('./moduls/post');

// Import routes
const authRoutes = require('./routus/auth');
const postRoutes = require('./routus/createPost');
const userRoutes = require('./routus/user');

// Use routes
app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to insta.x API');
});

// Connect to MongoDB and start server
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('Your Database is connected to MongoDB..!');
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });