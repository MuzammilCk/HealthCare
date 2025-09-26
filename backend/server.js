const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

// Load env
dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
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
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/specializations', require('./routes/specializations'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
