const mongoose = require('mongoose');

const SoundSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  url: { type: String, required: true },
  count: { type: Number, default: 0 }
});

module.exports = mongoose.model('Sound', SoundSchema);