const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env
dotenv.config();

const app = express();

// CORS
const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));

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

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
