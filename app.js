const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const vehiclesRouter = require('./routes/vehicles');
const bookingsRouter = require('./routes/bookings');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/bookings', bookingsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;