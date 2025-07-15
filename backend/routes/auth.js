const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username || !password) return res.status(400).json({ msg: 'Missing fields' });
    if (password.length < 4) return res.status(400).json({ msg: 'Password too short' });
    if (await User.findOne({ username })) return res.status(400).json({ msg: 'Username taken' });
    const user = await User.create({ username, password, email });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ msg: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Password reset request (demo: just generates a token)
router.post('/reset/request', async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ msg: "No such user" });
  const token = crypto.randomBytes(20).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600 * 1000;
  await user.save();
  // For demo: respond with token (in real life, email it!)
  res.json({ msg: "Reset token generated", token });
});

// Password reset
router.post('/reset/confirm', async (req, res) => {
  const { username, token, newPassword } = req.body;
  const user = await User.findOne({ username, resetToken: token });
  if (!user || user.resetTokenExpiry < Date.now())
    return res.status(400).json({ msg: 'Invalid or expired token' });
  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  res.json({ msg: "Password reset successful" });
});

module.exports = router;