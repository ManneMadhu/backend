
// backend/routes/bookings.js
const express = require('express');
const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
const { estimatedRideDurationHours } = require('../utils/duration');

const router = express.Router();

// Create booking (no transactions used)
router.post('/', async (req, res, next) => {
  try {
    const { vehicleId, fromPincode, toPincode, startTime, customerId } = req.body;
    if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
      return res.status(400).json({ error: 'vehicleId, fromPincode, toPincode, startTime and customerId are required' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const estimated = estimatedRideDurationHours(fromPincode, toPincode);
    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) return res.status(400).json({ error: 'Invalid startTime' });
    const end = new Date(start);
    end.setHours(end.getHours() + estimated);

    // Check conflict (basic)
    const conflict = await Booking.findOne({
      vehicleId: vehicle._id,
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (conflict) {
      return res.status(409).json({ error: 'Vehicle already booked for requested time' });
    }

    const bookingDoc = {
      vehicleId: vehicle._id,
      fromPincode,
      toPincode,
      startTime: start,
      endTime: end,
      customerId,
      estimatedRideDurationHours: estimated
    };

    const created = await Booking.create(bookingDoc);

    // return created booking
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Get bookings for a customer (or all if no customerId query)
router.get('/', async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const q = customerId ? { customerId } : {};
    const bookings = await Booking.find(q).sort({ startTime: -1 }).populate('vehicleId');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
});

// Cancel / delete booking by id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking cancelled', booking: deleted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
