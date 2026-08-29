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
  origin: (origin, callback) => {
    const allowedOrigins = [
      "https://insta-x-sg.onrender.com",
      "http://localhost:3000",
      
    ];

    const isRenderFrontend = origin && /https:\/\/.*\.onrender\.com$/i.test(origin);

    if (!origin || allowedOrigins.includes(origin) || isRenderFrontend) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Import models
require('./models/moduls');
require('./models/post');
require('./models/notification');
require('./models/message');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/createPost');
const userRoutes = require('./routes/user');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notification');
const messageRoutes = require('./routes/message');
const adminRoutes = require('./routes/admin');

// Use routes
app.use(authRoutes);
app.use(postRoutes);
app.use(userRoutes);
app.use(searchRoutes);
app.use(notificationRoutes);
app.use(messageRoutes);
app.use(adminRoutes);

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