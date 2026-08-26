const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  ngo:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donation:    { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  message:     { type: String },
  status:      { type: String, enum: ['pending', 'accepted', 'rejected', 'collected'], default: 'pending' },
  collectedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
