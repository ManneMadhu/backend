// function estimatedRideDurationHours(fromPincode, toPincode) {
//   const a = parseInt(fromPincode, 10);
//   const b = parseInt(toPincode, 10);
//   if (Number.isNaN(a) || Number.isNaN(b)) {
//     throw new Error('Invalid pincode(s)');
//   }
//   return Math.abs(b - a) % 24;
// }

// module.exports = { estimatedRideDurationHours };


// backend/utils/duration.js
// Simple heuristic to estimate ride duration (hours) based on numeric difference of pincodes.
// This is not real geographic distance, but gives more realistic variability than a constant.

function estimatedRideDurationHours(fromPincode, toPincode) {
  // normalize to numbers - if pincode strings, take numeric parts
  const a = Number(String(fromPincode).replace(/\D/g, '')) || 0;
  const b = Number(String(toPincode).replace(/\D/g, '')) || 0;
  const diff = Math.abs(a - b);

  // Map diff to distance (km) - heuristic:
  // small diff => short trip, large diff => long trip
  // We'll use: distanceKm = min(1000, 0.1 * diff + 10)
  const distanceKm = Math.min(1000, 0.1 * diff + 10);

  // average speed (km/h) depending on road: 40 km/h typical
  const avgSpeed = 40;

  // duration in hours (ceil to nearest 0.5 hour)
  let hours = distanceKm / avgSpeed;
  // clamp between 0.5 and 72 hours
  hours = Math.max(0.5, Math.min(72, hours));
  // round to nearest 0.25 for nicer values
  hours = Math.round(hours * 4) / 4;

  return hours;
}

module.exports = { estimatedRideDurationHours };
