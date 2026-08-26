const User     = require('../models/User');
const Donation = require('../models/Donation');
const Request  = require('../models/Request');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalDonations, totalRequests, totalNGOs, totalDonors, pendingNGOs, pendingDonations, collectedDonations] = await Promise.all([
      User.countDocuments(),
      Donation.countDocuments(),
      Request.countDocuments(),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo', isVerified: false, isActive: true }),
      Donation.countDocuments({ status: 'pending' }),
      Donation.countDocuments({ status: 'collected' }),
    ]);
    res.json({ totalUsers, totalDonations, totalRequests, totalNGOs, totalDonors, pendingNGOs, pendingDonations, collectedDonations });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true, isActive: true }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerified: false, isActive: false }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ _id: user._id, isActive: user.isActive, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.assignRequest = async (req, res) => {
  try {
    const { donationId, ngoId } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    donation.status     = 'accepted';
    donation.assignedTo = ngoId;
    await donation.save();
    await Request.updateMany({ donation: donationId, status: 'pending' }, { status: 'rejected' });
    const req_ = await Request.findOneAndUpdate(
      { donation: donationId, ngo: ngoId },
      { status: 'accepted' },
      { new: true, upsert: true }
    );
    res.json(req_);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.clearAllRequests = async (req, res) => {
  try {
    await Request.deleteMany({});
    res.json({ message: 'All requests cleared' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
