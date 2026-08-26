# 🌿 FeedHope

> **Bridging food surplus and hunger — one meal at a time.**

FeedHope is a full-stack food donation platform that connects **Donors**, **NGOs**, and **Admins** to reduce food waste and feed those in need. Donors list surplus food, verified NGOs request pickups, and admins oversee the entire platform.

---

## 📁 Project Structure

```
FeedHope/
├── Backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection (Mongoose)
│   ├── controllers/
│   │   ├── authController.js       # Register, Login, GetMe
│   │   ├── donationController.js   # CRUD for donations
│   │   ├── requestController.js    # NGO pickup requests
│   │   └── adminController.js      # Admin stats, user & request management
│   ├── middleware/
│   │   └── auth.js                 # JWT protect + role-based authorize
│   ├── models/
│   │   ├── User.js                 # User schema (donor / ngo / admin)
│   │   ├── Donation.js             # Donation schema
│   │   └── Request.js              # Pickup request schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── donations.js
│   │   ├── requests.js
│   │   └── admin.js
│   ├── seed.js                     # Creates default admin account
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── api/
    │   │   └── index.js            # All Axios API calls
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── DonationCard.jsx
    │   │   ├── StatCard.jsx
    │   │   └── ProtectedRoute.jsx  # Role-based route guard
    │   ├── context/
    │   │   ├── AuthContext.jsx     # Global auth state (JWT + user)
    │   │   └── ThemeContext.jsx    # Dark/light mode
    │   ├── hooks/
    │   │   └── useCountUp.js       # Animated number counter
    │   ├── pages/
    │   │   ├── Home.jsx            # Landing page with stats & features
    │   │   ├── Login.jsx           # Role-based login (donor/ngo/admin)
    │   │   ├── Register.jsx        # Registration with NGO fields
    │   │   ├── donor/
    │   │   │   ├── DonorDashboard.jsx
    │   │   │   ├── DonationForm.jsx    # Create donation with geolocation
    │   │   │   └── DonorRequests.jsx   # View NGO requests per donation
    │   │   ├── ngo/
    │   │   │   └── NgoDashboard.jsx    # Browse & request donations
    │   │   └── admin/
    │   │       ├── AdminLayout.jsx     # Sidebar layout
    │   │       ├── AdminOverview.jsx   # Stats dashboard
    │   │       ├── AdminNGOVerify.jsx  # Verify/reject NGOs
    │   │       ├── AdminAssignRequest.jsx
    │   │       ├── AdminUsers.jsx
    │   │       ├── AdminDonations.jsx
    │   │       └── AdminRequests.jsx
    │   ├── utils/
    │   │   └── helpers.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── index.jsx
    ├── .env
    ├── package.json
    ├── tailwind.config.cjs
    └── vite.config.js
```

---

## ⚙️ Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS, Framer Motion         |
| Backend    | Node.js, Express.js                                 |
| Database   | MongoDB Atlas (Mongoose)                            |
| Auth       | JWT (jsonwebtoken), bcryptjs (password hashing)     |
| HTTP       | Axios (with JWT interceptor)                        |
| UI Extras  | react-hot-toast, @heroicons/react, framer-motion    |

---

## 👥 User Roles

| Role    | What They Can Do                                                              |
|---------|-------------------------------------------------------------------------------|
| `donor` | Create, view, update, delete own donations; approve/reject NGO requests       |
| `ngo`   | Browse available donations; send pickup requests; mark as collected           |
| `admin` | Full access — manage users, verify NGOs, manage donations & requests          |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/feedhope.git
cd FeedHope
```

---

### 2. Backend Setup

```bash
cd Backend
npm install
```

Update `Backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/feedhope
JWT_SECRET=your_secret_key_here
```

**Seed the default admin account:**

```bash
node seed.js
# Admin created: admin@feedhope.com / admin123
```

**Start the backend:**

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Backend runs at → `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Update `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

**Start the frontend:**

```bash
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## 🔌 API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth — `/api/auth`

| Method | Endpoint    | Access  | Description         |
|--------|-------------|---------|---------------------|
| POST   | `/register` | Public  | Register a new user |
| POST   | `/login`    | Public  | Login & get token   |
| GET    | `/me`       | Private | Get current user    |

**Register / Login body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "donor",
  "phone": "9999999999",
  "address": "Delhi, India",
  "organizationName": "",
  "registrationNumber": ""
}
```

**Response:**
```json
{
  "token": "<jwt>",
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "donor",
  "isVerified": false
}
```

---

### Donations — `/api/donations`

| Method | Endpoint   | Access        | Description             |
|--------|------------|---------------|-------------------------|
| POST   | `/`        | donor, admin  | Create a donation       |
| GET    | `/my`      | donor, admin  | Get my donations        |
| GET    | `/nearby`  | All auth      | Get pending donations   |
| GET    | `/all`     | admin         | Get all donations       |
| GET    | `/:id`     | All auth      | Get single donation     |
| PUT    | `/:id`     | donor, admin  | Update donation         |
| DELETE | `/:id`     | donor, admin  | Delete donation         |

**Donation body:**
```json
{
  "foodType": "Rice & Dal",
  "description": "Freshly cooked, enough for 20 people",
  "quantity": "20 plates",
  "pickupAddress": "123 Main St, Delhi",
  "preparationTime": "2024-01-01T10:00:00Z",
  "expiryTime": "2024-01-01T18:00:00Z",
  "coordinates": [77.2090, 28.6139]
}
```

**Donation status flow:**
```
pending → accepted → collected
                  ↘ expired / cancelled
```

---

### Requests — `/api/requests`

| Method | Endpoint                 | Access              | Description                  |
|--------|--------------------------|---------------------|------------------------------|
| POST   | `/`                      | ngo, admin          | Create a pickup request      |
| GET    | `/ngo`                   | ngo, admin          | Get my NGO's requests        |
| GET    | `/all`                   | admin               | Get all requests             |
| GET    | `/donation/:donationId`  | All auth            | Get requests for a donation  |
| PUT    | `/:id/status`            | donor, ngo, admin   | Update request status        |

**Request body:**
```json
{
  "donationId": "<donation_id>",
  "message": "We can pick up by 3 PM today"
}
```

**Request status flow:**
```
pending → accepted → collected
        ↘ rejected
```

> When a request is `accepted`, all other pending requests for the same donation are auto-rejected and the donation status becomes `accepted`.

---

### Admin — `/api/admin`

| Method | Endpoint                     | Access | Description               |
|--------|------------------------------|--------|---------------------------|
| GET    | `/stats`                     | admin  | Platform-wide stats       |
| GET    | `/users`                     | admin  | Get all users             |
| PUT    | `/users/:id/verify`          | admin  | Verify NGO (isVerified)   |
| PUT    | `/users/:id/reject`          | admin  | Reject NGO                |
| PUT    | `/users/:id/toggle-active`   | admin  | Enable / disable user     |
| DELETE | `/users/:id`                 | admin  | Delete user               |
| POST   | `/assign-request`            | admin  | Manually assign donation  |
| DELETE | `/requests/clear-all`        | admin  | Clear all requests        |

**Stats response:**
```json
{
  "totalUsers": 50,
  "totalDonations": 120,
  "totalRequests": 80,
  "totalNGOs": 15,
  "totalDonors": 34,
  "pendingNGOs": 3,
  "pendingDonations": 22,
  "collectedDonations": 60
}
```

---

## 🗺️ Frontend Routes

| Path                           | Role           | Page                    |
|--------------------------------|----------------|-------------------------|
| `/`                            | Public         | Home / Landing          |
| `/login`                       | Public         | Login (donor/ngo/admin) |
| `/register`                    | Public         | Register                |
| `/donor/dashboard`             | donor, admin   | Donor Dashboard         |
| `/donor/donate`                | donor, admin   | Create Donation Form    |
| `/donor/requests/:donationId`  | donor, admin   | View NGO Requests       |
| `/ngo/dashboard`               | ngo, admin     | NGO Dashboard           |
| `/admin`                       | admin          | Admin Overview          |
| `/admin/ngo-verify`            | admin          | Verify NGOs             |
| `/admin/assign-request`        | admin          | Assign Requests         |
| `/admin/users`                 | admin          | Manage Users            |
| `/admin/donations`             | admin          | Manage Donations        |
| `/admin/requests`              | admin          | Manage Requests         |

---

## 🔐 Authentication Flow

1. User registers or logs in → receives a JWT token
2. Token is stored in `localStorage`
3. Every API request attaches the token via Axios interceptor:
   ```js
   config.headers.Authorization = `Bearer ${token}`;
   ```
4. Backend `protect` middleware verifies the token and attaches `req.user`
5. `authorize(...roles)` middleware checks role access per route

---

## 🌐 Environment Variables

### `Backend/.env`

| Variable     | Description                          |
|--------------|--------------------------------------|
| `PORT`       | Server port (default: `5000`)        |
| `MONGO_URI`  | MongoDB Atlas connection string      |
| `JWT_SECRET` | Secret key for signing JWT tokens    |

### `frontend/.env`

| Variable        | Description                        |
|-----------------|------------------------------------|
| `VITE_API_URL`  | Backend base URL (e.g. `http://localhost:5000`) |

---

## 📦 Dependencies

### Backend
| Package         | Purpose                    |
|-----------------|----------------------------|
| `express`       | Web framework              |
| `mongoose`      | MongoDB ODM                |
| `bcryptjs`      | Password hashing           |
| `jsonwebtoken`  | JWT auth                   |
| `cors`          | Cross-origin requests      |
| `dotenv`        | Environment variables      |
| `nodemon`       | Dev auto-reload            |

### Frontend
| Package              | Purpose                        |
|----------------------|--------------------------------|
| `react` + `react-dom`| UI library                     |
| `react-router-dom`   | Client-side routing            |
| `axios`              | HTTP client                    |
| `tailwindcss`        | Utility-first CSS              |
| `framer-motion`      | Page & component animations    |
| `react-hot-toast`    | Toast notifications            |
| `@heroicons/react`   | Icon library                   |

---

## 🧪 Default Admin Credentials

Run `node seed.js` inside the `Backend/` folder to create:

```
Email:    admin@feedhope.com
Password: admin123
```

> Change these credentials after first login in production.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use and modify.

---

> © 2024 FeedHope Foundation · Fighting Food Waste Since 2024
