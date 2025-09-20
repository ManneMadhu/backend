const express = require('express');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const { estimatedRideDurationHours } = require('../utils/duration');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, capacityKg, tyres } = req.body;
    if (!name || capacityKg == null || tyres == null) {
      return res.status(400).json({ error: 'name, capacityKg and tyres are required' });
    }
    const vehicle = await Vehicle.create({ name, capacityKg, tyres });
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
});

router.get('/available', async (req, res, next) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;
    if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
      return res.status(400).json({ error: 'capacityRequired, fromPincode, toPincode and startTime are required' });
    }

    const capacityNum = parseFloat(capacityRequired);
    if (Number.isNaN(capacityNum)) return res.status(400).json({ error: 'capacityRequired must be a number' });

    const estimated = estimatedRideDurationHours(fromPincode, toPincode);
    const start = new Date(startTime);
    if (Number.isNaN(start.getTime())) return res.status(400).json({ error: 'Invalid startTime' });
    const end = new Date(start);
    end.setHours(end.getHours() + estimated);

    const candidates = await Vehicle.find({ capacityKg: { $gte: capacityNum } }).lean();
    const candidateIds = candidates.map(v => v._id);

    const overlapping = await Booking.find({
      vehicleId: { $in: candidateIds },
      startTime: { $lt: end },
      endTime: { $gt: start }
    }).lean();

    const bookedVehicleIds = new Set(overlapping.map(b => String(b.vehicleId)));

    const available = candidates
      .filter(v => !bookedVehicleIds.has(String(v._id)))
      .map(v => ({ ...v, estimatedRideDurationHours: estimated }));

    return res.json(available);
  } catch (err) {
    next(err);
  }
});

module.exports = router;