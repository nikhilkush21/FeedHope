const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  email:              { type: String, required: true, unique: true },
  password:           { type: String, required: true },
  role:               { type: String, enum: ['donor', 'ngo', 'admin'], default: 'donor' },
  isVerified:         { type: Boolean, default: false },
  isActive:           { type: Boolean, default: true },
  phone:              { type: String },
  address:            { type: String },
  organizationName:   { type: String },
  registrationNumber: { type: String },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
