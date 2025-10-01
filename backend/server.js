// Load environment variables FIRST - before any other imports
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS
// Support multiple allowed origins (comma-separated) and include 127.0.0.1 fallback
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Online users tracking
let onlineUsers = {};

const addUser = (userId, socketId) => {
  onlineUsers[userId] = socketId;
};

const removeUser = (socketId) => {
  Object.keys(onlineUsers).forEach(userId => {
    if (onlineUsers[userId] === socketId) {
      delete onlineUsers[userId];
    }
  });
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('newUser', (userId) => {
    addUser(userId, socket.id);
    console.log('User added to online list:', userId);
  });

  socket.on('disconnect', () => {
    removeUser(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

// Global notification sender function
const sendNotification = (userId, notification) => {
  const receiverSocketId = onlineUsers[userId];
  if (receiverSocketId) {
    io.to(receiverSocketId).emit('getNotification', notification);
    console.log('Notification sent to user:', userId);
  } else {
    console.log('User not online, notification will be shown on next login:', userId);
  }
};

// Make sendNotification available globally
app.set('sendNotification', sendNotification);
global.sendNotification = sendNotification;

// Body parser
app.use(express.json());
// Cookie parser (for httpOnly JWT cookies)
app.use(cookieParser());

// Serve static files for uploaded images
app.use('/uploads', express.static('uploads'));

// Mongo connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Routes
app.get('/', (req, res) => res.json({ message: 'Healthcare System API' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/specializations', require('./routes/specializations'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/ai/check-symptoms', require('./routes/aiSymptomChecker'));
app.use('/api/mock-payments', require('./routes/mockPayments'));
app.use('/api/bills', require('./routes/bills'));
app.use('/api/medical-history', require('./routes/medicalHistory'));
app.use('/api/inventory', require('./routes/inventory'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
