

// backend/server.js (simplified)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const bookingsRoutes = require('./routes/bookings');
const vehiclesRoutes = require('./routes/vehicles'); // assume exists

require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fleetlink';
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/bookings', bookingsRoutes);
app.use('/api/vehicles', vehiclesRoutes);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
