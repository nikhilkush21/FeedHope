require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteOne({ email: 'admin@feedhope.com' });
  await User.create({
    name: 'Admin', email: 'admin@feedhope.com', password: 'admin123',
    role: 'admin', isVerified: true, isActive: true,
  });
  console.log('Admin created: admin@feedhope.com / admin123');
  process.exit();
})();
