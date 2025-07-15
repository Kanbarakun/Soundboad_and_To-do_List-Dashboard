const express = require('express');
const Sound = require('../models/Sound');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all sounds for user
router.get('/', auth, async (req, res) => {
  const sounds = await Sound.find({ user: req.user._id });
  res.json(sounds);
});

// Add sound (file upload as DataURL or URL, 2MB limit)
router.post('/', auth, async (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).json({ msg: 'Missing fields' });
  // If DataURL, check size
  if (url.startsWith('data:')) {
    // Rough check: base64 length * 3/4 = bytes
    const size = Math.floor((url.length - url.indexOf(',') - 1) * 0.75);
    if (size > 2 * 1024 * 1024) return res.status(400).json({ msg: 'File too large (2MB limit)' });
  }
  const sound = await Sound.create({ user: req.user._id, name, url });
  res.json(sound);
});

// Increment play count
router.post('/:id/play', auth, async (req, res) => {
  const sound = await Sound.findOne({ _id: req.params.id, user: req.user._id });
  if (!sound) return res.status(404).json({ msg: 'Not found' });
  sound.count = (sound.count || 0) + 1;
  await sound.save();
  res.json({ count: sound.count });
});

// Delete sound
router.delete('/:id', auth, async (req, res) => {
  await Sound.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ msg: 'Deleted' });
});

module.exports = router;