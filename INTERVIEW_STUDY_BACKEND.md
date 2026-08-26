# FeedHope — Backend Deep Dive (Interview Study)

---

## 1. Tech Stack & Why

| Package | Purpose | Why Used |
|---|---|---|
| `express` | Web framework | Minimal, fast, widely used for REST APIs |
| `mongoose` | MongoDB ODM | Schema validation, middleware, easy querying |
| `bcryptjs` | Password hashing | One-way hash, salt rounds prevent rainbow attacks |
| `jsonwebtoken` | Auth tokens | Stateless auth — no session storage needed |
| `cors` | Cross-origin | Allows frontend (port 5173) to call backend (port 5000) |
| `dotenv` | Env variables | Keeps secrets out of source code |
| `nodemon` | Dev tool | Auto-restarts server on file change |

---

## 2. Folder Structure & Responsibility

```
Backend/
├── server.js          → App entry point, mounts all routes
├── config/db.js       → MongoDB connection logic
├── middleware/auth.js → JWT verification + role guard
├── models/            → Mongoose schemas (database shape)
├── controllers/       → Business logic (what happens per request)
├── routes/            → URL definitions (which controller handles which URL)
└── seed.js            → One-time script to create admin user
```

**Pattern used: MVC (Model-View-Controller)**
- Model = Mongoose schemas
- Controller = business logic functions
- Route = connects URL to controller (View is handled by React frontend)

---

## 3. server.js — Entry Point

```js
require('dotenv').config();       // Load .env variables first
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

connectDB();                      // Connect to MongoDB

const app = express();
app.use(cors());                  // Allow all origins (dev mode)
app.use(express.json());          // Parse JSON request bodies

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/requests',  require('./routes/requests'));
app.use('/api/admin',     require('./routes/admin'));

app.listen(5000, () => console.log('Server running on port 5000'));
```

**Interview Q: Why `dotenv.config()` first?**
> Because all other files (db.js, etc.) use `process.env.*`. If dotenv runs after, those values are undefined.

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
    process.exit(1);   // Kill server if DB fails — no point running without DB
  }
};
```

**Interview Q: Why `process.exit(1)`?**
> Exit code 1 = error. If MongoDB fails to connect, the app cannot function, so we crash intentionally rather than serve broken responses.

---

## 5. Models (Mongoose Schemas)

### User.js
```js
const userSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  email:              { type: String, required: true, unique: true },
  password:           { type: String, required: true },
  role:               { type: String, enum: ['donor', 'ngo', 'admin'], default: 'donor' },
  isVerified:         { type: Boolean, default: false },
  isActive:           { type: Boolean, default: true },
  phone:              { type: String },
  address:            { type: String },
  organizationName:   { type: String },   // NGO only
  registrationNumber: { type: String },   // NGO only
}, { timestamps: true });

// Pre-save hook: hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();  // Only hash if changed
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance method: compare plain password with hash
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
```

**Key concepts:**
- `enum` — restricts value to allowed list, throws error otherwise
- `timestamps: true` — auto-adds `createdAt` and `updatedAt`
- `pre('save')` — Mongoose middleware, runs before every `.save()` call
- `unique: true` — creates a MongoDB index, prevents duplicate emails
- `isModified('password')` — prevents re-hashing an already hashed password on profile updates

---

### Donation.js
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

**Key concepts:**
- `ref: 'User'` — creates a reference (foreign key) to User collection
- `ObjectId` — MongoDB's unique ID type (24-char hex string)
- `assignedTo` — which NGO was assigned this donation (null until accepted)

**Status flow:**
```
pending → accepted → collected
        ↘ expired
        ↘ cancelled
```

---

### Request.js
```js
const requestSchema = new mongoose.Schema({
  ngo:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donation:    { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  message:     { type: String },
  status:      { type: String, enum: ['pending','accepted','rejected','collected'], default: 'pending' },
  collectedAt: { type: Date },
}, { timestamps: true });
```

**Status flow:**
```
pending → accepted → collected (collectedAt timestamp set)
        ↘ rejected
```

---

## 6. middleware/auth.js — JWT Protection

```js
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token' });

  try {
    const { id } = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: 'Forbidden' });
  next();
};
```

**Interview Q: Difference between 401 and 403?**
> - 401 Unauthorized = not authenticated (no token / bad token)
> - 403 Forbidden = authenticated but not allowed (wrong role)

**Interview Q: What is `next()` in middleware?**
> It passes control to the next middleware or route handler. Without calling `next()`, the request hangs forever.

**Interview Q: Why `select('-password')`?**
> The `-` prefix excludes that field. We never want to send the hashed password to the frontend or store it in `req.user`.

**Interview Q: What does `jwt.verify()` do?**
> It decodes the token AND verifies the signature using `JWT_SECRET`. If the token was tampered with or expired, it throws an error.

**How `authorize` works (currying):**
```js
// authorize('admin') returns a middleware function
// That middleware checks if req.user.role is in the roles array
router.get('/stats', protect, authorize('admin'), c.getStats);
// Flow: protect runs → sets req.user → authorize checks role → controller runs
```

---

## 7. Controllers

### authController.js

**register:**
```js
exports.register = async (req, res) => {
  const { name, email, password, role, phone, address, organizationName, registrationNumber } = req.body;

  if (await User.findOne({ email }))
    return res.status(400).json({ message: 'Email already in use' });

  // Password is hashed by the pre-save hook in User model
  const user = await User.create({ name, email, password, role, ... });
  const token = signToken(user._id);

  res.status(201).json({ token, _id: user._id, name, email, role, isVerified: user.isVerified });
};
```

**login:**
```js
exports.login = async (req, res) => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.isActive)
    return res.status(403).json({ message: 'Account disabled' });

  res.json({ token: signToken(user._id), ...userData });
};
```

**Interview Q: Why same error message for "user not found" and "wrong password"?**
> Security — if we say "user not found", attackers know which emails are registered. Generic message prevents user enumeration attacks.

---

### donationController.js

**getNearby** — returns only `pending` donations (available for NGOs):
```js
exports.getNearby = async (req, res) => {
  const donations = await Donation.find({ status: 'pending' })
    .populate('donor', 'name email')
    .sort('-createdAt');
  res.json(donations);
};
```

**update** — only donor or admin can update:
```js
exports.update = async (req, res) => {
  const donation = await Donation.findById(req.params.id);
  if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });
  Object.assign(donation, req.body);
  await donation.save();
  res.json(donation);
};
```

**Interview Q: Why `.toString()` when comparing ObjectId?**
> `donation.donor` is a MongoDB ObjectId object. `req.user.id` is a string. Direct `===` comparison fails. `.toString()` converts both to strings for comparison.

**Interview Q: What does `.populate()` do?**
> It replaces the ObjectId reference with the actual document data from the referenced collection. Like a SQL JOIN.
> Example: `donor: ObjectId("abc")` becomes `donor: { name: "John", email: "john@..." }`

---

### requestController.js

**create** — prevents duplicate requests:
```js
exports.create = async (req, res) => {
  const existing = await Request.findOne({ ngo: req.user.id, donation: donationId });
  if (existing) return res.status(400).json({ message: 'Already requested' });
  const request = await Request.create({ ngo: req.user.id, donation: donationId, message });
  res.status(201).json(request);
};
```

**updateStatus** — core business logic:
```js
exports.updateStatus = async (req, res) => {
  const request = await Request.findById(req.params.id).populate('donation');
  request.status = status;
  if (status === 'collected') request.collectedAt = new Date();
  await request.save();

  if (status === 'accepted') {
    // Update donation status and assign NGO
    await Donation.findByIdAndUpdate(request.donation._id, {
      status: 'accepted',
      assignedTo: request.ngo,
    });
    // Auto-reject all other pending requests for same donation
    await Request.updateMany(
      { donation: request.donation._id, _id: { $ne: request._id }, status: 'pending' },
      { status: 'rejected' }
    );
  }
  if (status === 'collected') {
    await Donation.findByIdAndUpdate(request.donation._id, { status: 'collected' });
  }
};
```

**Interview Q: What is `$ne` in MongoDB?**
> `$ne` = "not equal". `{ _id: { $ne: request._id } }` means "all requests except this one".

**Interview Q: What is `updateMany`?**
> Updates all documents matching the filter in one DB call. More efficient than looping and updating one by one.

---

### adminController.js

**getStats** — parallel DB queries with `Promise.all`:
```js
const [totalUsers, totalDonations, totalRequests, totalNGOs, totalDonors,
       pendingNGOs, pendingDonations, collectedDonations] = await Promise.all([
  User.countDocuments(),
  Donation.countDocuments(),
  Request.countDocuments(),
  User.countDocuments({ role: 'ngo' }),
  User.countDocuments({ role: 'donor' }),
  User.countDocuments({ role: 'ngo', isVerified: false, isActive: true }),
  Donation.countDocuments({ status: 'pending' }),
  Donation.countDocuments({ status: 'collected' }),
]);
```

**Interview Q: Why `Promise.all` instead of `await` one by one?**
> `Promise.all` runs all 8 queries in parallel. Sequential `await` would run them one after another — 8x slower. `Promise.all` waits for all to finish simultaneously.

**assignRequest** — admin manually assigns donation to NGO:
```js
exports.assignRequest = async (req, res) => {
  const { donationId, ngoId } = req.body;
  donation.status     = 'accepted';
  donation.assignedTo = ngoId;
  await donation.save();
  // Reject all other pending requests
  await Request.updateMany({ donation: donationId, status: 'pending' }, { status: 'rejected' });
  // Upsert: update if exists, create if not
  const req_ = await Request.findOneAndUpdate(
    { donation: donationId, ngo: ngoId },
    { status: 'accepted' },
    { new: true, upsert: true }
  );
};
```

**Interview Q: What is `upsert: true`?**
> If a document matching the filter exists, update it. If not, create it. Combines update + insert = "upsert".

---

## 8. Routes

### How routes are structured:
```js
// admin.js
const admin = [protect, authorize('admin')];  // Reusable middleware array

router.get('/stats',                   ...admin, c.getStats);
router.get('/users',                   ...admin, c.getAllUsers);
router.put('/users/:id/verify',        ...admin, c.verifyUser);
router.put('/users/:id/toggle-active', ...admin, c.toggleActive);
router.delete('/users/:id',            ...admin, c.deleteUser);
router.post('/assign-request',         ...admin, c.assignRequest);
router.delete('/requests/clear-all',   ...admin, c.clearAllRequests);
```

**Interview Q: What does `...admin` (spread) do here?**
> `admin` is an array `[protect, authorize('admin')]`. Spreading it passes each element as a separate argument to `router.get()`. Express accepts multiple middleware functions as separate arguments.

### donations.js — role-based access:
```js
router.post('/',      protect, authorize('donor', 'admin'), c.create);
router.get('/my',     protect, authorize('donor', 'admin'), c.getMyDonations);
router.get('/nearby', protect, c.getNearby);           // All logged-in users
router.get('/all',    protect, authorize('admin'), c.getAll);
router.get('/:id',    protect, c.getOne);
router.put('/:id',    protect, c.update);
router.delete('/:id', protect, c.remove);
```

**Interview Q: Why is `/nearby` before `/:id`?**
> Express matches routes top to bottom. If `/:id` was first, `/nearby` would be treated as an id = "nearby". Always put specific routes before parameterized ones.

---

## 9. seed.js — Admin Seeder

```js
require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteOne({ email: 'admin@feedhope.com' });  // Remove if exists
  await User.create({
    name: 'Admin', email: 'admin@feedhope.com', password: 'admin123',
    role: 'admin', isVerified: true, isActive: true,
  });
  console.log('Admin created: admin@feedhope.com / admin123');
  process.exit();
})();
```

**Interview Q: Why `deleteOne` before `create`?**
> Prevents duplicate key error on `email` (unique field). Running seed twice would crash without this.

**Interview Q: What is an IIFE?**
> Immediately Invoked Function Expression — `(async () => { ... })()`. Defines and calls the async function immediately. Used here because top-level `await` wasn't supported in older Node versions.

---

## 10. JWT Flow (End to End)

```
1. User logs in → POST /api/auth/login
2. Server verifies password → creates JWT:
   jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
3. Token sent to frontend → stored in localStorage
4. Every request: Authorization: Bearer <token>
5. protect middleware:
   - Extracts token from header
   - jwt.verify(token, JWT_SECRET) → decodes { id }
   - Fetches user from DB → attaches to req.user
6. Controller accesses req.user.id, req.user.role
```

**Interview Q: What's inside a JWT?**
> JWT has 3 parts separated by dots: `header.payload.signature`
> - Header: algorithm type (HS256)
> - Payload: `{ id: "...", iat: timestamp, exp: timestamp }`
> - Signature: HMAC of header+payload using JWT_SECRET
> The payload is base64 encoded, NOT encrypted — anyone can decode it. The signature ensures it wasn't tampered with.

**Interview Q: Why JWT over sessions?**
> JWT is stateless — server doesn't store anything. Sessions require server-side storage. JWT scales better for distributed systems.

---

## 11. Error Handling Pattern

Every controller uses try-catch:
```js
exports.create = async (req, res) => {
  try {
    // business logic
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**HTTP Status codes used:**
| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error, duplicate |
| 401 | Unauthorized | No/invalid token |
| 403 | Forbidden | Wrong role |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected crash |

---

## 12. MongoDB Query Operators Used

| Operator | Meaning | Example |
|----------|---------|---------|
| `$ne` | Not equal | `{ _id: { $ne: id } }` |
| `$in` | In array | `{ status: { $in: ['pending','accepted'] } }` |
| `countDocuments()` | Count matching docs | `User.countDocuments({ role: 'ngo' })` |
| `findOneAndUpdate()` | Find + update atomically | Returns updated doc |
| `updateMany()` | Update all matching | Bulk update |
| `deleteMany()` | Delete all matching | Clear all requests |
| `populate()` | Join referenced docs | Replace ObjectId with full doc |
| `select('-password')` | Exclude field | `-` prefix = exclude |
| `sort('-createdAt')` | Sort descending | `-` prefix = descending |

---

## 13. Common Interview Questions

**Q: What is Mongoose middleware (hooks)?**
> Functions that run before/after certain Mongoose operations. `pre('save')` runs before `.save()`. Used here to hash passwords automatically.

**Q: What is the difference between `findById` and `findOne`?**
> `findById(id)` is shorthand for `findOne({ _id: id })`. Both return one document.

**Q: What is `{ new: true }` in `findByIdAndUpdate`?**
> By default, Mongoose returns the document BEFORE the update. `{ new: true }` returns the document AFTER the update.

**Q: Why use `async/await` instead of callbacks?**
> Cleaner, readable code. Avoids "callback hell". Error handling with try-catch is straightforward.

**Q: What is CORS and why is it needed?**
> Cross-Origin Resource Sharing. Browser blocks requests from one origin (localhost:5173) to another (localhost:5000) by default. The `cors` middleware adds headers to allow this.

**Q: How does password hashing work?**
> `bcrypt.hash(password, 10)` — 10 is salt rounds (cost factor). Higher = slower but more secure. bcrypt adds a random salt to prevent rainbow table attacks. The hash is one-way — you can't reverse it, only compare.

**Q: What happens if JWT_SECRET changes?**
> All existing tokens become invalid because the signature verification fails. All users get logged out.
