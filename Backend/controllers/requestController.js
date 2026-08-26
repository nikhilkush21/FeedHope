const Request  = require('../models/Request');
const Donation = require('../models/Donation');

exports.create = async (req, res) => {
  try {
    const { donationId, message } = req.body;
    const existing = await Request.findOne({ ngo: req.user.id, donation: donationId });
    if (existing) return res.status(400).json({ message: 'Already requested' });
    const request = await Request.create({ ngo: req.user.id, donation: donationId, message });
    res.status(201).json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getNgoRequests = async (req, res) => {
  try {
    const requests = await Request.find({ ngo: req.user.id }).populate('donation').sort('-createdAt');
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getDonationRequests = async (req, res) => {
  try {
    const requests = await Request.find({ donation: req.params.donationId })
      .populate('ngo', 'name email organizationName phone')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id).populate('donation');
    if (!request) return res.status(404).json({ message: 'Not found' });

    request.status = status;
    if (status === 'collected') request.collectedAt = new Date();
    await request.save();

    if (status === 'accepted') {
      await Donation.findByIdAndUpdate(request.donation._id, {
        status: 'accepted',
        assignedTo: request.ngo,
      });
      await Request.updateMany(
        { donation: request.donation._id, _id: { $ne: request._id }, status: 'pending' },
        { status: 'rejected' }
      );
    }
    if (status === 'collected') {
      await Donation.findByIdAndUpdate(request.donation._id, { status: 'collected' });
    }

    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAll = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('ngo', 'name email')
      .populate('donation', 'foodType quantity pickupAddress donor')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
