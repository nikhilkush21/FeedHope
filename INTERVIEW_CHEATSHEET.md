# FeedHope — Interview Quick Reference Cheatsheet

---

## Project Summary (30-second pitch)

> FeedHope is a full-stack MERN food donation platform. Donors list surplus food, verified NGOs send pickup requests, and admins manage the entire platform. Built with React + Vite on the frontend and Node.js + Express + MongoDB on the backend. JWT-based authentication with role-based access control for 3 roles: donor, ngo, admin.

---

## Full Data Flow (One Request End to End)

```
1. NGO clicks "Request This Donation"
2. Frontend: createRequest({ donationId, message }) → POST /api/requests
3. Axios interceptor adds: Authorization: Bearer <token>
4. Backend: protect middleware verifies JWT → sets req.user
5. Backend: authorize('ngo','admin') checks req.user.role
6. requestController.create:
   - Checks duplicate request (same ngo + donation)
   - Creates Request document in MongoDB
   - Returns 201 with request data
7. Frontend: toast.success('Request sent!')
8. Re-fetches nearby donations + requests to update UI
```

---

## Authentication Flow

```
Register/Login → JWT token returned
     ↓
localStorage.setItem('token', token)
     ↓
Every API call → Axios interceptor adds Bearer token
     ↓
Backend protect middleware → jwt.verify() → req.user set
     ↓
authorize(...roles) → checks req.user.role
     ↓
Controller runs with req.user available
```

---

## Role Permissions Summary

| Action | donor | ngo | admin |
|--------|-------|-----|-------|
| Create donation | ✅ | ❌ | ✅ |
| View own donations | ✅ | ❌ | ✅ |
| View all donations | ❌ | ❌ | ✅ |
| Browse nearby donations | ❌ | ✅ | ✅ |
| Send pickup request | ❌ | ✅ | ✅ |
| Accept/reject request | ✅ | ❌ | ✅ |
| Mark collected | ❌ | ✅ | ✅ |
| Verify NGOs | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| View platform stats | ❌ | ❌ | ✅ |

---

## Database Schema Summary

### User
```
name, email (unique), password (hashed), role (donor/ngo/admin),
isVerified, isActive, phone, address, organizationName, registrationNumber
```

### Donation
```
donor (ref: User), foodType, description, quantity, pickupAddress,
preparationTime, expiryTime, coordinates,
status (pending/accepted/collected/expired/cancelled),
assignedTo (ref: User)
```

### Request
```
ngo (ref: User), donation (ref: Donation), message,
status (pending/accepted/rejected/collected), collectedAt
```

---

## Status Flows

```
Donation:  pending → accepted → collected
                   ↘ expired / cancelled

Request:   pending → accepted → collected
                   ↘ rejected
```

**When request is accepted:**
- Donation status → `accepted`, `assignedTo` = NGO
- All other pending requests for same donation → auto `rejected`

**When request is collected:**
- Request `collectedAt` = current timestamp
- Donation status → `collected`

---

## API Endpoints Quick Reference

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                          [auth]

POST   /api/donations                        [donor,admin]
GET    /api/donations/my                     [donor,admin]
GET    /api/donations/nearby                 [auth]
GET    /api/donations/all                    [admin]
GET    /api/donations/:id                    [auth]
PUT    /api/donations/:id                    [donor,admin]
DELETE /api/donations/:id                    [donor,admin]

POST   /api/requests                         [ngo,admin]
GET    /api/requests/ngo                     [ngo,admin]
GET    /api/requests/all                     [admin]
GET    /api/requests/donation/:donationId    [auth]
PUT    /api/requests/:id/status              [donor,ngo,admin]

GET    /api/admin/stats                      [admin]
GET    /api/admin/users                      [admin]
PUT    /api/admin/users/:id/verify           [admin]
PUT    /api/admin/users/:id/reject           [admin]
PUT    /api/admin/users/:id/toggle-active    [admin]
DELETE /api/admin/users/:id                  [admin]
POST   /api/admin/assign-request             [admin]
DELETE /api/admin/requests/clear-all         [admin]
```

---

## Key Code Patterns

### Middleware chaining
```js
router.get('/stats', protect, authorize('admin'), controller.getStats);
// protect → authorize → controller (each calls next())
```

### Promise.all for parallel queries
```js
const [users, donations, requests] = await Promise.all([
  User.countDocuments(),
  Donation.countDocuments(),
  Request.countDocuments(),
]);
```

### Auto-reject other requests on accept
```js
await Request.updateMany(
  { donation: donationId, _id: { $ne: acceptedRequestId }, status: 'pending' },
  { status: 'rejected' }
);
```

### Axios interceptor
```js
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Context consumption
```js
const { user, login, logout } = useAuth();
const { dark, toggle } = useTheme();
```

### Protected route
```jsx
<ProtectedRoute roles={['donor', 'admin']}>
  <DonorDashboard />
</ProtectedRoute>
```

### Network vs server error
```js
catch (err) {
  if (!err.response) toast.error('Server unreachable');
  else toast.error(err.response.data?.message);
}
```

---

## Top Interview Questions & Answers

**Q: Explain the project in 2 minutes.**
> FeedHope connects food donors with NGOs. Donors register, list surplus food with pickup address and expiry time. Verified NGOs browse available donations and send pickup requests. Donors approve/reject requests. When approved, other requests are auto-rejected. NGO marks food as collected. Admins oversee everything — verify NGOs, manage users, assign donations manually. Built with React frontend, Express backend, MongoDB database, JWT auth.

**Q: How is authentication implemented?**
> JWT-based. On login, server creates a token with `jwt.sign({ id }, secret, { expiresIn: '7d' })`. Frontend stores it in localStorage. Every API request attaches it via Axios interceptor. Backend `protect` middleware verifies it with `jwt.verify()` and attaches the user to `req.user`.

**Q: How is authorization (role-based access) implemented?**
> `authorize(...roles)` middleware checks `req.user.role` against allowed roles. Returns 403 if not allowed. Used on every protected route: `router.post('/', protect, authorize('donor'), controller)`.

**Q: How does the NGO verification flow work?**
> NGO registers → `isVerified: false, isActive: true` by default. Admin sees pending NGOs in dashboard. Admin clicks Approve → `PUT /api/admin/users/:id/verify` → sets `isVerified: true`. NGO can now send requests. Admin can also reject → `isVerified: false, isActive: false`.

**Q: What happens when a donor accepts an NGO request?**
> `PUT /api/requests/:id/status` with `{ status: 'accepted' }`. Controller: sets request status to accepted, updates donation `status: 'accepted'` and `assignedTo: ngo._id`, then `updateMany` rejects all other pending requests for that donation.

**Q: How is the admin dashboard stats fetched efficiently?**
> `Promise.all` runs 8 `countDocuments()` queries in parallel. All execute simultaneously, total time = slowest single query, not sum of all.

**Q: What is the seed.js file for?**
> Creates the default admin account (`admin@feedhope.com / admin123`). Run once with `node seed.js`. Uses `deleteOne` first to prevent duplicate key error on re-run.

**Q: How does dark mode work?**
> ThemeContext toggles the `dark` class on `document.documentElement`. Tailwind's `darkMode: 'class'` config applies `dark:` prefixed styles when that class exists. Preference saved in localStorage.

**Q: Why are routes like `/nearby` defined before `/:id`?**
> Express matches routes top to bottom. If `/:id` came first, `/nearby` would be treated as id = "nearby". Specific routes must come before parameterized ones.

**Q: How does the modal in AdminAssignRequest work?**
> `selected` state holds the chosen donation (null = closed). When not null, a fixed full-screen overlay renders with the assignment form. Clicking Cancel sets `selected` back to null, closing the modal.

---

## Environment Variables

```
# Backend/.env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/feedhope
JWT_SECRET=any_random_secret_string

# frontend/.env
VITE_API_URL=http://localhost:5000
```

---

## Run Commands

```bash
# Backend
cd Backend
npm install
node seed.js        # Create admin account (once)
npm run dev         # nodemon server.js → http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev         # vite → http://localhost:5173
```

---

## Default Admin Login
```
Email:    admin@feedhope.com
Password: admin123
```
