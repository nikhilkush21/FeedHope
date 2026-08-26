# FeedHope — Backend Complete Study Guide

---

## 1. What is This Project?

FeedHope is a food donation platform. Three types of users:
- **Donor** — lists surplus food for pickup
- **NGO** — browses donations and sends pickup requests
- **Admin** — verifies NGOs, manages users, oversees everything

Backend is a REST API built with Node.js + Express + MongoDB.

---

## 2. Tech Stack — Every Package Explained

### express
Web framework for Node.js. Handles HTTP requests, routing, middleware.
Without Express you'd have to use raw `http` module which is very verbose.

### mongoose
ODM (Object Document Mapper) for MongoDB. Lets you define schemas, validate data, use middleware hooks, and query with a clean API instead of raw MongoDB driver.

### bcryptjs
Password hashing library. Converts plain text password into a one-way hash.
- `bcrypt.hash('password123', 10)` — 10 is salt rounds (cost factor)
- `bcrypt.compare('password123', hash)` — returns true/false
- One-way means you CANNOT reverse the hash back to original password
- Salt rounds: higher = slower to compute = harder to brute force

### jsonwebtoken
Creates and verifies JWT (JSON Web Tokens) for stateless authentication.
- `jwt.sign(payload, secret, options)` — creates token
- `jwt.verify(token, secret)` — verifies + decodes token

### cors
Middleware that adds HTTP headers to allow cross-origin requests.
Browser blocks requests from `localhost:5173` to `localhost:5000` by default (different ports = different origins). cors middleware fixes this.

### dotenv
Loads variables from `.env` file into `process.env`. Keeps secrets (DB password, JWT secret) out of source code.

### nodemon
Dev tool that watches files and auto-restarts server when you save. Only used in development (`npm run dev`).

---

## 3. server.js — Entry Point (Line by Line)

```js
require('dotenv').config();
```
Must be FIRST line. Loads .env into process.env before anything else reads it.

```js
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');
```
Import dependencies and our DB connection function.

```js
connectDB();
```
Connects to MongoDB. If it fails, process.exit(1) is called inside connectDB.

```js
const app = express();
app.use(cors());
app.use(express.json());
```
- `cors()` — allows all origins (fine for development)
- `express.json()` — parses incoming JSON request bodies into `req.body`
  Without this, `req.body` would be undefined.

```js
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/requests',  require('./routes/requests'));
app.use('/api/admin',     require('./routes/admin'));
```
Mounts route files. Any request to `/api/auth/*` goes to routes/auth.js.
The prefix `/api/auth` is stripped, so inside auth.js, `/register` handles `POST /api/auth/register`.

```js
app.listen(5000, () => console.log('Server running on port 5000'));
```
Starts HTTP server on port 5000.

---

## 4. config/db.js — MongoDB Connection

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**Why `process.exit(1)`?**
Exit code 1 = abnormal termination (error). If MongoDB fails, the entire app is broken — no point serving requests. We crash intentionally so the error is obvious.

**What does `mongoose.connect()` do?**
Opens a connection pool to MongoDB Atlas. Mongoose reuses this connection for all subsequent queries. You only call it once at startup.

**What is MONGO_URI?**
Connection string format:
`mongodb+srv://username:password@cluster.mongodb.net/dbname`
- `mongodb+srv://` — SRV protocol (DNS-based, used by Atlas)
- `username:password` — DB user credentials
- `cluster.mongodb.net` — Atlas cluster hostname
- `/dbname` — which database to use

---

## 5. Models — Mongoose Schemas

### User.js — Full Explanation

```js
const userSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  email:              { type: String, required: true, unique: true },
  password:           { type: String, required: true },
  role:               { type: String, enum: ['donor','ngo','admin'], default: 'donor' },
  isVerified:         { type: Boolean, default: false },
  isActive:           { type: Boolean, default: true },
  phone:              { type: String },
  address:            { type: String },
  organizationName:   { type: String },
  registrationNumber: { type: String },
}, { timestamps: true });
```

Field by field:
- `required: true` — Mongoose throws ValidationError if missing
- `unique: true` — creates a MongoDB index, prevents duplicate emails
- `enum` — only allows listed values, throws error otherwise
- `default` — value used if field not provided
- `timestamps: true` — auto-adds `createdAt` and `updatedAt` fields
- `organizationName`, `registrationNumber` — only filled for NGO role

```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

**Pre-save hook:**
- Runs automatically before every `.save()` call
- `this` refers to the document being saved
- `this.isModified('password')` — returns true only if password field changed
  This prevents re-hashing an already hashed password when updating other fields (like name)
- `next()` — must be called to continue the save operation

```js
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
```

**Instance method:**
- Added to every User document instance
- `user.matchPassword('abc123')` returns a Promise resolving to true/false
- `bcrypt.compare` handles the salt extraction and comparison internally

---

### Donation.js — Full Explanation

```js
const donationSchema = new mongoose.Schema({
  donor:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType:        { type: String, required: true },
  description:     { type: String },
  quantity:        { type: String, required: true },
  pickupAddress:   { type: String, required: true },
  preparationTime: { type: Date },
  expiryTime:      { type: Date },
  status:          { type: String, enum: ['pending','accepted','collected','expired','cancelled'], default: 'pending' },
  assignedTo:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
```

- `mongoose.Schema.Types.ObjectId` — MongoDB's 24-char hex ID type
- `ref: 'User'` — tells Mongoose which collection to populate from
- `donor` — who created this donation (required)
- `assignedTo` — which NGO was assigned (null until accepted)
- `status` flow: `pending` → `accepted` → `collected` / `expired` / `cancelled`

---

### Request.js — Full Explanation

```js
const requestSchema = new mongoose.Schema({
  ngo:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donation:    { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  message:     { type: String },
  status:      { type: String, enum: ['pending','accepted','rejected','collected'], default: 'pending' },
  collectedAt: { type: Date },
}, { timestamps: true });
```

- `ngo` — which NGO sent this request
- `donation` — which donation is being requested
- `message` — optional note from NGO to donor
- `collectedAt` — timestamp set when NGO marks food as collected
- `status` flow: `pending` → `accepted` → `collected` / `rejected`

**Relationship diagram:**
```
User (donor) ──creates──> Donation
User (ngo)   ──creates──> Request ──references──> Donation
```

---

## 6. middleware/auth.js — Complete Breakdown

This file exports two middleware functions: `protect` and `authorize`.

### protect — Verifies JWT token

```js
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;

  // Check if header exists and starts with "Bearer "
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token' });

  try {
    // Extract token: "Bearer eyJhbGci..." → "eyJhbGci..."
    const { id } = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);

    // Fetch full user from DB, exclude password
    req.user = await User.findById(id).select('-password');

    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next(); // Pass to next middleware or controller
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**Step by step what happens:**
1. Client sends: `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...`
2. `auth.split(' ')[1]` extracts just the token part
3. `jwt.verify()` checks signature + expiry, returns decoded payload `{ id, iat, exp }`
4. We fetch the user from DB using that id
5. Attach user to `req.user` so controllers can use it
6. Call `next()` to continue

**Why fetch user from DB instead of just using the token payload?**
The token only has `{ id }`. We need the full user object (name, role, isActive, etc.) in controllers. Also, if a user is deleted or deactivated after token was issued, fetching from DB catches that.

**What does `select('-password')` do?**
The `-` prefix excludes that field from the query result. We never want the hashed password in `req.user` — it could accidentally get sent to the frontend.

**What does `?.` (optional chaining) do?**
`auth?.startsWith('Bearer ')` — if `auth` is undefined/null, returns undefined instead of throwing `TypeError: Cannot read property 'startsWith' of undefined`.

---

### authorize — Role-based access control

```js
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden' });
  next();
};
```

**This is a curried function (function returning a function):**
- `authorize('admin')` returns a middleware function
- That middleware checks if `req.user.role` is in the allowed roles array
- Must run AFTER `protect` because it needs `req.user`

**Usage:**
```js
router.get('/stats', protect, authorize('admin'), controller.getStats);
// Request flow:
// 1. protect runs → verifies token → sets req.user
// 2. authorize('admin') runs → checks req.user.role === 'admin'
// 3. controller.getStats runs
```

**401 vs 403:**
- 401 Unauthorized = not authenticated (no token, bad token, expired token)
- 403 Forbidden = authenticated but not allowed (wrong role)

**Aliases for backward compatibility:**
```js
const auth      = protect;          // same function, different name
const adminOnly = authorize('admin');
module.exports = { protect, authorize, auth, adminOnly };
```

---

## 7. controllers/authController.js — Complete Breakdown

### signToken helper
```js
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
```
Creates a JWT with payload `{ id }`, signed with secret, expires in 7 days.

**What is inside a JWT?**
JWT = `header.payload.signature` (3 parts separated by dots)
- Header: `{ alg: "HS256", typ: "JWT" }` — algorithm used
- Payload: `{ id: "abc123", iat: 1700000000, exp: 1700604800 }` — our data + timestamps
- Signature: HMAC-SHA256 of (header + payload) using JWT_SECRET

The payload is base64 encoded, NOT encrypted. Anyone can decode it. The signature ensures it was not tampered with.

---

### register
```js
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address,
            organizationName, registrationNumber } = req.body;

    // Check duplicate email
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });

    // Create user — password hashed by pre-save hook automatically
    const user = await User.create({
      name, email, password, role,
      phone, address, organizationName, registrationNumber
    });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**Why 201 instead of 200?**
201 = Created. Semantically correct for POST requests that create a new resource.

**Why check email before creating?**
Even though `unique: true` on the schema would throw a MongoDB duplicate key error, checking first gives a cleaner, user-friendly error message instead of a raw MongoDB error.

**Why not send back the full user object?**
We only send what the frontend needs. Never send `password` (even hashed) or internal fields.

---

### login
```js
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Same error for "user not found" and "wrong password" — security
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Account disabled' });

    const token = signToken(user._id);
    res.json({ token, _id: user._id, name: user.name,
               email, role: user.role, isVerified: user.isVerified });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**Why same error for wrong email and wrong password?**
Security — if we say "user not found", attackers know which emails are registered (user enumeration attack). Generic message prevents this.

**Why check `isActive` separately?**
A deactivated user should get a different message (403 Forbidden) vs wrong credentials (401). Admin can deactivate users without deleting them.

---

### getMe
```js
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

Used by frontend on page load to verify token and get current user data. `req.user` is already set by `protect` middleware, but we re-fetch to get the latest data from DB.

---

## 8. controllers/donationController.js — Complete Breakdown

### create
```js
exports.create = async (req, res) => {
  try {
    const donation = await Donation.create({ ...req.body, donor: req.user.id });
    res.status(201).json(donation);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```
Spreads all body fields and adds `donor` from the authenticated user. Frontend cannot fake the donor ID.

---

### getMyDonations
```js
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id }).sort('-createdAt');
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```
`sort('-createdAt')` — `-` prefix means descending (newest first).

---

### getNearby
```js
exports.getNearby = async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'pending' })
      .populate('donor', 'name email')
      .sort('-createdAt');
    res.json(donations);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```

**What does `.populate('donor', 'name email')` do?**
Without populate: `donor: ObjectId("64abc123...")`
With populate: `donor: { _id: "64abc123...", name: "John", email: "john@..." }`

It replaces the ObjectId reference with actual data from the User collection. Second argument `'name email'` is a projection — only fetch those fields (like SELECT name, email in SQL).

Only returns `pending` donations — these are available for NGOs to request.

---

### update
```js
exports.update = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });

    // Only the donor or admin can update
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    Object.assign(donation, req.body);
    await donation.save();
    res.json(donation);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```

**Why `donation.donor.toString()`?**
`donation.donor` is a MongoDB ObjectId object. `req.user.id` is a string. Direct `===` comparison fails because they are different types. `.toString()` converts ObjectId to its hex string representation for comparison.

**Why `Object.assign` + `save()` instead of `findByIdAndUpdate`?**
`Object.assign` merges req.body into the document. Then `.save()` triggers the pre-save hooks (like password hashing if needed). `findByIdAndUpdate` bypasses hooks.

---

### remove
```js
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
```

---

## 9. controllers/requestController.js — Complete Breakdown

### create — Prevent duplicate requests
```js
exports.create = async (req, res) => {
  try {
    const { donationId, message } = req.body;

    // Prevent same NGO requesting same donation twice
    const existing = await Request.findOne({ ngo: req.user.id, donation: donationId });
    if (existing) return res.status(400).json({ message: 'Already requested' });

    const request = await Request.create({
      ngo: req.user.id,
      donation: donationId,
      message
    });
    res.status(201).json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```

---

### updateStatus — Core Business Logic
```js
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id).populate('donation');
    if (!request) return res.status(404).json({ message: 'Not found' });

    request.status = status;
    if (status === 'collected') request.collectedAt = new Date();
    await request.save();

    if (status === 'accepted') {
      // Update donation: mark as accepted, assign to this NGO
      await Donation.findByIdAndUpdate(request.donation._id, {
        status: 'accepted',
        assignedTo: request.ngo,
      });

      // Auto-reject all OTHER pending requests for same donation
      await Request.updateMany(
        {
          donation: request.donation._id,
          _id: { $ne: request._id },   // $ne = not equal
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }

    if (status === 'collected') {
      await Donation.findByIdAndUpdate(request.donation._id, { status: 'collected' });
    }

    res.json(request);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```

**Why populate('donation') here?**
We need `request.donation._id` to update the donation. Without populate, `request.donation` is just an ObjectId string, not an object with `._id`.

**What is `$ne`?**
MongoDB query operator meaning "not equal". `{ _id: { $ne: request._id } }` matches all requests EXCEPT the one being accepted.

**What is `updateMany`?**
Updates ALL documents matching the filter in a single DB operation. More efficient than fetching all and looping.

**Full flow when donor accepts a request:**
```
1. PUT /api/requests/:id/status { status: 'accepted' }
2. Request status → 'accepted'
3. Donation status → 'accepted', assignedTo → NGO's id
4. All other pending requests for same donation → 'rejected'
5. Response: updated request object
```

---

## 10. controllers/adminController.js — Complete Breakdown

### getStats — Parallel DB queries
```js
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers, totalDonations, totalRequests,
      totalNGOs, totalDonors, pendingNGOs,
      pendingDonations, collectedDonations
    ] = await Promise.all([
      User.countDocuments(),
      Donation.countDocuments(),
      Request.countDocuments(),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'ngo', isVerified: false, isActive: true }),
      Donation.countDocuments({ status: 'pending' }),
      Donation.countDocuments({ status: 'collected' }),
    ]);

    res.json({ totalUsers, totalDonations, totalRequests,
               totalNGOs, totalDonors, pendingNGOs,
               pendingDonations, collectedDonations });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```

**Why Promise.all?**
Sequential await would run 8 queries one after another — total time = sum of all query times.
Promise.all runs all 8 simultaneously — total time = slowest single query.
For 8 queries each taking 50ms: sequential = 400ms, parallel = ~50ms.

**What is countDocuments()?**
MongoDB method that counts documents matching a filter. Much faster than fetching all documents and checking `.length`.

---

### verifyUser vs rejectUser
```js
exports.verifyUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, isActive: true },
    { new: true }
  ).select('-password');
  res.json(user);
};

exports.rejectUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: false, isActive: false },
    { new: true }
  ).select('-password');
  res.json(user);
};
```

**What is `{ new: true }`?**
By default, `findByIdAndUpdate` returns the document BEFORE the update. `{ new: true }` returns the document AFTER the update. Frontend needs the updated data.

**Why set `isActive: false` on reject?**
Rejected NGOs should not be able to log in or use the platform. Setting both `isVerified: false` and `isActive: false` blocks them completely.

---

### toggleActive
```js
exports.toggleActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Not found' });
    user.isActive = !user.isActive;   // flip the boolean
    await user.save();
    res.json({
      _id: user._id,
      isActive: user.isActive,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```

**Why fetch then save instead of findByIdAndUpdate?**
We need to read the current value of `isActive` to flip it. `findByIdAndUpdate` with `$set` would need to know the new value upfront. Fetch + flip + save is cleaner here.

---

### assignRequest — Admin manually assigns donation
```js
exports.assignRequest = async (req, res) => {
  try {
    const { donationId, ngoId } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    donation.status     = 'accepted';
    donation.assignedTo = ngoId;
    await donation.save();

    // Reject all pending requests for this donation
    await Request.updateMany(
      { donation: donationId, status: 'pending' },
      { status: 'rejected' }
    );

    // Upsert: update existing request or create new one
    const req_ = await Request.findOneAndUpdate(
      { donation: donationId, ngo: ngoId },
      { status: 'accepted' },
      { new: true, upsert: true }
    );
    res.json(req_);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
```

**What is upsert?**
`upsert: true` means: if a document matching the filter exists, update it. If not, create it. Combines update + insert = "upsert". Used here because the NGO may or may not have already sent a request.

---

## 11. Routes — Complete Breakdown

### How Express routing works
```js
// server.js mounts routes with prefix
app.use('/api/donations', require('./routes/donations'));

// donations.js defines sub-paths
router.get('/nearby', protect, c.getNearby);
// Full path: GET /api/donations/nearby
```

### Route ordering matters
```js
router.get('/my',     protect, c.getMyDonations);  // specific first
router.get('/nearby', protect, c.getNearby);        // specific first
router.get('/all',    protect, c.getAll);           // specific first
router.get('/:id',    protect, c.getOne);           // parameterized last
```

Express matches routes top to bottom. If `/:id` was first, `/my` would be treated as id = "my" and fail. Always put specific routes before parameterized ones.

### admin.js — Spread operator trick
```js
const admin = [protect, authorize('admin')];

router.get('/stats', ...admin, c.getStats);
// Same as:
router.get('/stats', protect, authorize('admin'), c.getStats);
```

`...admin` spreads the array into individual arguments. Express accepts multiple middleware as separate arguments. This avoids repeating `protect, authorize('admin')` on every route.

---

## 12. seed.js — Admin Account Creator

```js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Delete existing admin to avoid duplicate key error
  await User.deleteOne({ email: 'admin@feedhope.com' });

  await User.create({
    name: 'Admin',
    email: 'admin@feedhope.com',
    password: 'admin123',   // hashed by pre-save hook
    role: 'admin',
    isVerified: true,
    isActive: true,
  });

  console.log('Admin created: admin@feedhope.com / admin123');
  process.exit();
})();
```

**What is an IIFE (Immediately Invoked Function Expression)?**
`(async () => { ... })()` — defines an async function and immediately calls it. Used because top-level await requires `"type": "module"` in package.json. IIFE wraps it in an async function to use await.

**Why `deleteOne` before `create`?**
Email has `unique: true`. Running seed.js twice would throw a duplicate key error without the delete. This makes the script idempotent (safe to run multiple times).

**Why is password hashed even though we write plain text?**
The `pre('save')` hook in User.js automatically hashes it before saving to MongoDB.

---

## 13. Complete JWT Flow

```
REGISTRATION:
User fills form → POST /api/auth/register
→ Server creates User in DB (password auto-hashed)
→ Server calls signToken(user._id)
→ jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
→ Returns token + user data
→ Frontend stores token in localStorage

LOGIN:
User fills form → POST /api/auth/login
→ Server finds user by email
→ user.matchPassword(password) → bcrypt.compare()
→ If match: signToken(user._id) → return token
→ Frontend stores token in localStorage

PROTECTED REQUEST:
Frontend → GET /api/donations/my
→ Axios interceptor adds: Authorization: Bearer eyJhbGci...
→ protect middleware:
   → auth.split(' ')[1] extracts token
   → jwt.verify(token, JWT_SECRET) → { id, iat, exp }
   → User.findById(id) → req.user = full user object
→ authorize('donor') checks req.user.role
→ Controller runs, uses req.user.id to filter data

PAGE REFRESH:
App loads → AuthContext useEffect runs
→ localStorage.getItem('token') → token exists
→ GET /api/auth/me with token
→ protect verifies token → returns user data
→ setUser(data) → user is logged in
```

---

## 14. Error Handling Pattern

Every controller wraps logic in try-catch:
```js
exports.someAction = async (req, res) => {
  try {
    // business logic
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**HTTP Status Codes used in this project:**

| Code | Name | When Used |
|------|------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Duplicate email, already requested |
| 401 | Unauthorized | No token, invalid token, wrong credentials |
| 403 | Forbidden | Wrong role, account disabled |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected crash, DB error |

---

## 15. MongoDB Operators & Methods Used

| Operator/Method | Meaning | Example in Project |
|---|---|---|
| `find({ key: val })` | Get all matching docs | `Donation.find({ status: 'pending' })` |
| `findById(id)` | Get one doc by _id | `Donation.findById(req.params.id)` |
| `findOne({ })` | Get first matching doc | `User.findOne({ email })` |
| `create({ })` | Insert new document | `User.create({ name, email... })` |
| `findByIdAndUpdate` | Find + update atomically | `User.findByIdAndUpdate(id, data, { new: true })` |
| `findOneAndUpdate` | Find one + update | Used for upsert in assignRequest |
| `updateMany` | Update all matching | Auto-reject other requests |
| `deleteOne` | Delete one matching | seed.js cleanup |
| `deleteMany` | Delete all matching | clearAllRequests |
| `countDocuments` | Count matching docs | Admin stats |
| `.populate(field)` | Replace ObjectId with doc | `.populate('donor', 'name email')` |
| `.select('-field')` | Exclude field | `.select('-password')` |
| `.sort('-field')` | Sort descending | `.sort('-createdAt')` |
| `$ne` | Not equal | `{ _id: { $ne: id } }` |
| `{ new: true }` | Return updated doc | `findByIdAndUpdate(..., { new: true })` |
| `{ upsert: true }` | Create if not exists | `findOneAndUpdate(..., { upsert: true })` |

---

## 16. Top Backend Interview Questions

**Q: What is REST API?**
REST (Representational State Transfer) is an architectural style for APIs. Uses HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources. Stateless — each request contains all info needed. Resources identified by URLs (`/api/donations/:id`).

**Q: What is middleware in Express?**
Functions that run between receiving a request and sending a response. Have access to `req`, `res`, `next`. Called in order. `next()` passes to the next middleware. Used for auth, logging, parsing, error handling.

**Q: What is the difference between `findByIdAndUpdate` and fetch + save?**
`findByIdAndUpdate` is a single atomic DB operation, bypasses Mongoose middleware (hooks). Fetch + `save()` triggers pre/post save hooks. Use `findByIdAndUpdate` for simple updates, fetch + save when hooks need to run.

**Q: Why use async/await instead of callbacks?**
Callbacks lead to "callback hell" (deeply nested code). Promises are better but `.then().catch()` chains get long. `async/await` makes async code look synchronous, easier to read, and error handling with try-catch is natural.

**Q: What is the difference between SQL and MongoDB?**
SQL: relational, tables with fixed schema, joins, ACID transactions. MongoDB: document-based, flexible schema (JSON-like), references instead of joins, horizontally scalable. MongoDB is better for flexible/evolving data structures.

**Q: How does bcrypt hashing work?**
1. Generates a random salt (prevents rainbow table attacks)
2. Combines salt + password
3. Runs through Blowfish cipher `2^saltRounds` times (cost factor)
4. Stores `$2b$10$salt+hash` as one string
5. On compare: extracts salt from stored hash, re-hashes input, compares

**Q: What happens if JWT_SECRET changes in production?**
All existing tokens become invalid because signature verification fails. All users get logged out and must log in again. Never change JWT_SECRET in production without a migration plan.

**Q: What is CORS and why is it needed?**
Cross-Origin Resource Sharing. Browser's Same-Origin Policy blocks requests from `localhost:5173` to `localhost:5000` (different ports = different origins). The `cors` middleware adds `Access-Control-Allow-Origin` headers to responses, telling the browser to allow these cross-origin requests.

**Q: What is the difference between authentication and authorization?**
Authentication = verifying WHO you are (login, token verification).
Authorization = verifying WHAT you can do (role check, ownership check).
`protect` middleware = authentication. `authorize` middleware = authorization.

**Q: Why store only `{ id }` in JWT payload instead of full user data?**
Security and freshness. If we stored role in token, a user whose role changed would still have old role until token expires. Storing only id and fetching from DB ensures we always get current data.
