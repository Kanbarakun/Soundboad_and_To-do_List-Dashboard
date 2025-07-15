const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3 },
  password: { type: String, required: true },
  email: { type: String, required: false },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);