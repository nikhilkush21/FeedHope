const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType:        { type: String, required: true },
  description:     { type: String },
  quantity:        { type: String, required: true },
  pickupAddress:   { type: String, required: true },
  preparationTime: { type: Date },
  expiryTime:      { type: Date },
  status:          { type: String, enum: ['pending', 'accepted', 'collected', 'expired', 'cancelled'], default: 'pending' },
  assignedTo:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Donation', donationSchema);
