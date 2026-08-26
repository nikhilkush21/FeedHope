const Donation = require('../models/Donation');

exports.create = async (req, res) => {
  try {
    const donation = await Donation.create({ ...req.body, donor: req.user.id });
    res.status(201).json(donation);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id }).sort('-createdAt');
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getNearby = async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'pending' })
      .populate('donor', 'name email')
      .sort('-createdAt');
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email')
      .populate('assignedTo', 'name')
      .sort('-createdAt');
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('assignedTo', 'name');
    if (!donation) return res.status(404).json({ message: 'Not found' });
    res.json(donation);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    Object.assign(donation, req.body);
    await donation.save();
    res.json(donation);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.remove = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    await donation.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
