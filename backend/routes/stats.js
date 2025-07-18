const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Helper to get today's day abbreviation
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function getToday() {
  return days[new Date().getDay()];
}

// Add Cute Point
// POST /api/stats/add
router.post('/add', async (req, res) => {
  const userId = req.body.userId;
  const pointsToAdd = req.body.points || 1;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const today = getToday();
    user.cutePoints.set(today, (user.cutePoints.get(today) || 0) + pointsToAdd);
    await user.save();

    res.json({ success: true, cutePoints: user.cutePoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Cute Points for User
// GET /api/stats/:userId
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ cutePoints: user.cutePoints });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;