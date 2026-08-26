# FeedHop - Project Report

## Table of Contents

| Topic | Page No. |
|-------|----------|
| Certificate | 1 |
| Acknowledgement | 2 |
| **Chapter 1: Introduction** | 3 |
| 1.1 Overview & Motivation | 4 |
| 1.2 Organization of Project Report | 4 |
| **Chapter 2: Software Requirement Analysis** | 5 |
| 2.1 Requirement Analysis | 5 |
| &nbsp;&nbsp;&nbsp;2.1.1 Hardware Requirement | 5 |
| &nbsp;&nbsp;&nbsp;2.1.2 Software Requirement | 6 |
| &nbsp;&nbsp;&nbsp;2.1.3 Tools and Technologies | 6 |
| 2.2 Feasibility Study | 7 |
| &nbsp;&nbsp;&nbsp;2.2.1 Technical Feasibility | 6 |
| &nbsp;&nbsp;&nbsp;2.2.3 Economical Feasibility | 8 |
| 2.3 Analysis | 8 |
| 2.4 Summary of Modules | 9 |
| **Chapter 3: Software Design** | 10 |
| 3.1 DFD | 10 |
| &nbsp;&nbsp;&nbsp;DFD Level 0 | 12 |
| &nbsp;&nbsp;&nbsp;DFD Level 1 | 13 |
| 3.2 ER | 14 |
| &nbsp;&nbsp;&nbsp;ER Diagram | 15 |
| 3.3 Database Design | 16 |
| **Chapter 4: Implementation & User Interface** | 16 |
| **Chapter 5: Software Testing** | 20 |
| 5.1 Testing | 20 |
| 5.2 Objectives of Software Testing | 21 |
| 5.3 Principles of Software Testing | 21 |
| &nbsp;&nbsp;&nbsp;5.3.1 White Box Testing | 21 |
| &nbsp;&nbsp;&nbsp;5.3.2 Black Box Testing | 21 |
| 5.4 Testing Fundamentals | 21 |
| 5.5 Testing Information | 22 |
| Conclusion | 23 |
| References | 24 |
| Geotag Image | 25 |

---

## Chapter 1: Introduction

### 1.1 Overview & Motivation

Food waste is one of the most pressing global challenges. Millions of tonnes of edible food are discarded every day by restaurants, hotels, households, and events — while at the same time, a large portion of the population goes hungry. The gap between food surplus and food need exists not because of a lack of food, but because of a lack of an efficient system to connect those who have excess food with those who need it.

**FeedHop** is a web-based food donation management platform designed to bridge this gap. It connects **food donors** (individuals, restaurants, or organizations) with verified **NGOs** (Non-Governmental Organizations) that can collect and distribute the food to those in need. An **Admin** oversees the entire platform — verifying NGOs, managing users, monitoring donations, and assigning requests when needed.

The motivation behind FeedHop is to:
- Reduce food waste at the source by making donation simple and accessible.
- Empower NGOs with a digital tool to discover and request available food donations.
- Provide transparency and accountability through an admin-controlled verification system.
- Create a scalable, real-time platform that can be adopted by communities, cities, or organizations.

### 1.2 Organization of Project Report

This report is organized into five chapters:

- **Chapter 1 – Introduction:** Provides an overview of the project, its motivation, and the structure of this report.
- **Chapter 2 – Software Requirement Analysis:** Covers hardware and software requirements, tools and technologies used, feasibility study, and a summary of system modules.
- **Chapter 3 – Software Design:** Presents the Data Flow Diagrams (DFD), Entity-Relationship (ER) diagram, and database design.
- **Chapter 4 – Implementation & User Interface:** Describes the implementation of key modules and showcases the user interface screens.
- **Chapter 5 – Software Testing:** Explains the testing strategies, objectives, and test cases used to validate the system.

---

## Chapter 2: Software Requirement Analysis

### 2.1 Requirement Analysis

Requirement analysis is the process of identifying the needs and conditions that the system must satisfy. For FeedHop, requirements were gathered by studying the problem of food waste, the workflow of NGOs, and the needs of food donors.

#### 2.1.1 Hardware Requirement

| Component | Minimum Requirement |
|-----------|-------------------|
| Processor | Intel Core i3 or equivalent |
| RAM | 4 GB |
| Storage | 20 GB free disk space |
| Network | Broadband Internet connection |
| Display | 1280 x 720 resolution or higher |

For the **server/deployment environment:**
- A cloud server or VPS with at least 1 vCPU and 1 GB RAM (e.g., AWS EC2, DigitalOcean Droplet)
- MongoDB Atlas (cloud-hosted database) — no dedicated DB server hardware required

#### 2.1.2 Software Requirement

| Software | Purpose |
|----------|---------|
| Node.js (v18+) | Backend JavaScript runtime |
| MongoDB (Atlas) | NoSQL database for storing users, donations, requests |
| npm | Package manager for Node.js and frontend dependencies |
| Web Browser (Chrome/Firefox) | Accessing the frontend application |
| Git | Version control |
| VS Code | Code editor (development) |
| Postman | API testing during development |

#### 2.1.3 Tools and Technologies

**Backend:**
- **Node.js + Express.js** — RESTful API server
- **MongoDB + Mongoose** — Database and ODM (Object Document Mapper)
- **bcryptjs** — Password hashing for secure authentication
- **jsonwebtoken (JWT)** — Stateless authentication via Bearer tokens
- **dotenv** — Environment variable management
- **cors** — Cross-Origin Resource Sharing for frontend-backend communication
- **nodemon** — Auto-restart server during development

**Frontend:**
- **React 19** — Component-based UI library
- **Vite** — Fast frontend build tool and dev server
- **React Router DOM v7** — Client-side routing
- **Tailwind CSS** — Utility-first CSS framework for styling
- **Axios** — HTTP client for API calls
- **Framer Motion** — Animations and transitions
- **React Hot Toast** — Notification toasts
- **@heroicons/react** — Icon library

**Architecture Pattern:**
- **MVC (Model-View-Controller)** on the backend
- **Context API** for global state management on the frontend (AuthContext, ThemeContext)

### 2.2 Feasibility Study

#### 2.2.1 Technical Feasibility

FeedHop is technically feasible because:
- All technologies used (Node.js, React, MongoDB) are mature, open-source, and widely supported.
- The MERN-like stack (MongoDB, Express, React, Node) is well-documented with a large developer community.
- JWT-based authentication is a proven, stateless approach suitable for REST APIs.
- MongoDB Atlas provides free-tier cloud hosting, making database setup straightforward.
- Vite and Tailwind CSS enable rapid frontend development with minimal configuration.
- The system can be deployed on any cloud provider (AWS, Heroku, Render, Vercel) with minimal effort.

#### 2.2.3 Economical Feasibility

FeedHop can be built and deployed at minimal cost:
- All frameworks and libraries used are **free and open-source**.
- **MongoDB Atlas** offers a free M0 cluster suitable for development and small-scale production.
- **Render / Railway / Vercel** offer free tiers for hosting the backend and frontend.
- Development requires only a standard laptop and an internet connection.
- No licensing fees are required for any component of the stack.

For a production-scale deployment, costs would be limited to cloud hosting (estimated ₹500–₹2000/month for a small VPS) and a custom domain name.

### 2.3 Analysis

FeedHop involves three types of users, each with distinct roles and workflows:

**Donor:**
- Registers and logs in to the platform.
- Creates food donation listings with details such as food type, quantity, pickup address, preparation time, and expiry time.
- Views incoming requests from NGOs for their donations.
- Accepts or rejects NGO requests.
- Tracks the status of their donations (pending → accepted → collected).

**NGO:**
- Registers with organization details (name, registration number, address).
- Awaits admin verification before accessing the platform.
- Browses available (pending) food donations.
- Sends collection requests with an optional message to donors.
- Marks donations as collected once picked up.

**Admin:**
- Has full oversight of the platform.
- Verifies or rejects NGO registrations.
- Manages all users (activate/deactivate/delete).
- Views all donations and requests.
- Can manually assign a donation to an NGO.
- Monitors platform statistics (total users, donations, requests, pending NGOs, collected donations).

### 2.4 Summary of Modules

| Module | Description |
|--------|-------------|
| **Authentication Module** | User registration, login, JWT token generation, and protected route access |
| **Donor Module** | Create donations, view own donations, manage NGO requests (accept/reject) |
| **NGO Module** | Browse available donations, send collection requests, mark as collected |
| **Admin Module** | Verify NGOs, manage users, view all data, assign requests, view statistics |
| **Request Management Module** | Create, view, and update the status of donation requests between NGOs and donors |
| **Admin Dashboard Module** | Overview statistics with animated stat cards for platform monitoring |

---

## Chapter 3: Software Design

### 3.1 DFD

A Data Flow Diagram (DFD) represents the flow of data within the system. It shows how data moves between external entities, processes, and data stores.

#### DFD Level 0 (Context Diagram)

The Level 0 DFD shows FeedHop as a single process interacting with three external entities:

```
+--------+       Donation Details        +----------+       NGO Requests        +---------+
| Donor  | ---------------------------> |          | <------------------------ |   NGO   |
|        | <--------------------------- | FeedHop  | ------------------------> |         |
+--------+   Request Status / Updates   |  System  |   Available Donations     +---------+
                                        |          |
+--------+       Admin Actions          |          |       Platform Stats       
| Admin  | ---------------------------> |          | <--------------------------
|        | <--------------------------- +----------+   User / Donation Data     
+--------+   Reports / Confirmations                                            
```

- **Donor** provides food donation data and receives request status updates.
- **NGO** browses donations and submits collection requests.
- **Admin** manages users, verifies NGOs, and monitors the system.

#### DFD Level 1

The Level 1 DFD breaks the system into its core processes:

```
Donor ──────────────► [1.0 Manage Donations] ──────────────► Donation Store (MongoDB)
                              │                                       │
                              ▼                                       ▼
                      [2.0 Manage Requests] ◄──────────── NGO ──► Request Store (MongoDB)
                              │
                              ▼
                      [3.0 Authentication] ◄──────────── All Users ──► User Store (MongoDB)
                              │
                              ▼
                      [4.0 Admin Control] ◄──────────── Admin ──► All Stores
```

**Process Descriptions:**
- **1.0 Manage Donations** — Handles creation, retrieval, update, and deletion of food donations.
- **2.0 Manage Requests** — Handles NGO requests for donations, status updates (accepted/rejected/collected).
- **3.0 Authentication** — Handles user registration, login, JWT issuance, and route protection.
- **4.0 Admin Control** — Handles NGO verification, user management, statistics, and manual assignment.

### 3.2 ER

The Entity-Relationship diagram models the data entities in FeedHop and their relationships.

#### ER Diagram

**Entities and Attributes:**

**User**
- `_id` (PK), `name`, `email`, `password`, `role` (donor/ngo/admin), `isVerified`, `isActive`, `phone`, `organizationName`, `registrationNumber`, `address`, `createdAt`

**Donation**
- `_id` (PK), `donor` (FK → User), `foodType`, `description`, `quantity`, `pickupAddress`, `preparationTime`, `expiryTime`, `coordinates`, `status` (pending/accepted/collected/expired/cancelled), `assignedTo` (FK → User), `createdAt`

**Request**
- `_id` (PK), `ngo` (FK → User), `donation` (FK → Donation), `message`, `status` (pending/accepted/rejected/collected), `collectedAt`, `createdAt`

**Relationships:**
```
User (Donor) ──── 1:N ──── Donation       (A donor can create many donations)
User (NGO)   ──── 1:N ──── Request        (An NGO can make many requests)
Donation     ──── 1:N ──── Request        (A donation can receive many requests)
Donation     ──── N:1 ──── User (NGO)     (assignedTo — a donation is assigned to one NGO)
```

### 3.3 Database Design

FeedHop uses **MongoDB** (NoSQL) with **Mongoose** ODM. Below are the three collections:

**Users Collection**
```json
{
  "_id": "ObjectId",
  "name": "String (required)",
  "email": "String (required, unique)",
  "password": "String (hashed with bcrypt)",
  "role": "String (enum: donor | ngo | admin)",
  "isVerified": "Boolean (default: false)",
  "isActive": "Boolean (default: true)",
  "phone": "String",
  "organizationName": "String",
  "registrationNumber": "String",
  "address": "String",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Donations Collection**
```json
{
  "_id": "ObjectId",
  "donor": "ObjectId (ref: User)",
  "foodType": "String (required)",
  "description": "String",
  "quantity": "String (required)",
  "pickupAddress": "String (required)",
  "preparationTime": "Date",
  "expiryTime": "Date",
  "coordinates": "[Number] (default: [0, 0])",
  "status": "String (enum: pending | accepted | collected | expired | cancelled)",
  "assignedTo": "ObjectId (ref: User, default: null)",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Requests Collection**
```json
{
  "_id": "ObjectId",
  "ngo": "ObjectId (ref: User)",
  "donation": "ObjectId (ref: Donation)",
  "message": "String",
  "status": "String (enum: pending | accepted | rejected | collected)",
  "collectedAt": "Date",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

**Key Design Decisions:**
- Passwords are never stored in plain text — bcrypt hashing is applied via a Mongoose `pre('save')` hook.
- `assignedTo` on Donation is set when a request is accepted, linking the donation directly to the NGO.
- When a request is accepted, all other pending requests for the same donation are automatically rejected.
- `coordinates` field on Donation is reserved for future geolocation-based filtering.

---

## Chapter 4: Implementation & User Interface

FeedHop is implemented as a full-stack web application with a **React** frontend and a **Node.js/Express** backend connected to **MongoDB Atlas**.

### Project Structure

```
updated FeedHop/
├── Backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── donationController.js
│   │   ├── requestController.js
│   │   └── adminController.js
│   ├── middleware/auth.js     # JWT protect & authorize middleware
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Donation.js
│   │   └── Request.js
│   ├── routes/               # Express route definitions
│   │   ├── auth.js
│   │   ├── donations.js
│   │   ├── requests.js
│   │   └── admin.js
│   └── server.js             # Entry point
└── frontend/
    └── src/
        ├── api/index.js       # Axios instance
        ├── components/        # Reusable UI components
        ├── context/           # AuthContext, ThemeContext
        ├── pages/
        │   ├── donor/         # DonorDashboard, DonationForm, DonorRequests
        │   ├── ngo/           # NgoDashboard
        │   └── admin/         # AdminLayout, AdminOverview, AdminUsers, etc.
        └── App.jsx            # Routes definition
```

### API Endpoints

**Authentication** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register a new user (donor or NGO) |
| POST | `/login` | Login and receive JWT token |
| GET | `/me` | Get current authenticated user |

**Donations** (`/api/donations`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Donor/Admin | Create a new donation |
| GET | `/my` | Donor/Admin | Get own donations |
| GET | `/nearby` | All | Get pending donations (with optional location filter) |
| GET | `/all` | Admin | Get all donations |
| GET | `/:id` | All | Get a single donation |
| PUT | `/:id` | Donor/Admin | Update a donation |
| DELETE | `/:id` | Donor/Admin | Delete a donation |

**Requests** (`/api/requests`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | NGO/Admin | Create a collection request |
| GET | `/ngo` | NGO/Admin | Get own NGO requests |
| GET | `/all` | Admin | Get all requests |
| GET | `/donation/:donationId` | All | Get requests for a donation |
| PUT | `/:id/status` | Donor/NGO/Admin | Update request status |

**Admin** (`/api/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Platform statistics |
| GET | `/users` | All users |
| PUT | `/users/:id/verify` | Verify an NGO |
| PUT | `/users/:id/reject` | Reject an NGO |
| PUT | `/users/:id/toggle-active` | Activate/deactivate a user |
| DELETE | `/users/:id` | Delete a user |
| POST | `/assign-request` | Manually assign a donation to an NGO |
| DELETE | `/requests/clear-all` | Clear all requests |

### Key Implementation Details

**Authentication Flow:**
1. User registers → password hashed via bcrypt → JWT token returned.
2. On login → credentials verified → JWT token returned (7-day expiry).
3. Protected routes use the `protect` middleware to verify the Bearer token.
4. Role-based access is enforced via the `authorize(...roles)` middleware.

**Donation Lifecycle:**
```
pending → accepted (when donor accepts an NGO request) → collected (when NGO marks pickup)
       → expired / cancelled (if not acted upon)
```

**Request Acceptance Logic:**
- When a donor accepts one NGO's request, all other pending requests for the same donation are automatically set to `rejected`.
- The donation's `assignedTo` field is updated to the accepted NGO's ID.

### User Interface Screens

**1. Home Page**
- Landing page with platform introduction, call-to-action buttons for Login and Register.

**2. Register / Login**
- Separate registration forms for Donors and NGOs.
- NGOs provide additional fields: organization name, registration number, address.
- Login returns a JWT stored in AuthContext for session management.

**3. Donor Dashboard**
- Lists all donations created by the logged-in donor.
- Shows donation status (pending, accepted, collected) with color-coded badges.
- Links to view incoming NGO requests per donation.

**4. Donation Form**
- Form to create a new food donation with fields: food type, description, quantity, pickup address, preparation time, expiry time.

**5. Donor Requests View**
- Shows all NGO requests for a specific donation.
- Donor can accept or reject each request.

**6. NGO Dashboard**
- Lists all available (pending) food donations.
- NGO can send a collection request with an optional message.
- Shows status of previously submitted requests.

**7. Admin Dashboard**
- Overview panel with animated stat cards: Total Users, Total Donations, Total Requests, Pending NGOs, Collected Donations.
- Sub-pages: NGO Verification, User Management, All Donations, All Requests, Assign Request.

**8. Admin NGO Verify**
- Lists all NGOs pending verification.
- Admin can verify or reject each NGO.

**9. Admin Users**
- Full user list with options to activate/deactivate or delete users.

**10. Admin Assign Request**
- Admin can manually assign a pending donation to a specific NGO.

---

## Chapter 5: Software Testing

### 5.1 Testing

Software testing is the process of evaluating a system or its components to find whether it satisfies the specified requirements. For FeedHop, testing was performed at multiple levels to ensure correctness, security, and usability of the application.

Testing was carried out on:
- Individual API endpoints (unit/integration testing via Postman)
- User interface flows (manual black-box testing)
- Authentication and authorization logic (security testing)
- Database operations (data integrity testing)

### 5.2 Objectives of Software Testing

The objectives of testing FeedHop were:
1. To verify that all API endpoints return correct responses for valid inputs.
2. To ensure unauthorized users cannot access protected routes.
3. To validate that the donation lifecycle (pending → accepted → collected) transitions correctly.
4. To confirm that accepting one NGO request automatically rejects all other pending requests for the same donation.
5. To verify that NGOs cannot access the platform before admin verification.
6. To ensure the admin can manage users, donations, and requests without errors.
7. To test the frontend UI for correct rendering, form validation, and navigation.

### 5.3 Principles of Software Testing

#### 5.3.1 White Box Testing

White box testing (also called structural testing) involves testing the internal logic and code structure of the application. The tester has full knowledge of the source code.

White box testing was applied to:
- **Authentication logic** — Verifying that the `protect` middleware correctly decodes JWT tokens and rejects invalid/expired tokens.
- **Password hashing** — Confirming that the `pre('save')` hook in the User model hashes passwords before storing them.
- **Request acceptance logic** — Tracing through the `updateStatus` controller to verify that accepting a request correctly updates the donation status and rejects competing requests via `Request.updateMany`.
- **Role-based authorization** — Testing the `authorize(...roles)` middleware with different user roles to confirm correct access control.

#### 5.3.2 Black Box Testing

Black box testing involves testing the system from the user's perspective without knowledge of the internal code. Inputs are provided and outputs are verified against expected results.

Black box testing was applied to:
- **User Registration** — Testing with valid data, duplicate email, and missing required fields.
- **User Login** — Testing with correct credentials, wrong password, and disabled account.
- **Donation Creation** — Testing with all required fields, missing fields, and unauthorized roles.
- **NGO Request Flow** — Testing the full flow: NGO sends request → Donor accepts → Donation marked collected.
- **Admin Verification** — Testing NGO verification and rejection from the admin panel.
- **UI Navigation** — Testing all page routes, protected route redirects, and role-based navigation.

### 5.4 Testing Fundamentals

| Term | Description |
|------|-------------|
| **Test Case** | A set of conditions and inputs used to verify a specific feature |
| **Test Suite** | A collection of related test cases |
| **Expected Output** | The correct result that the system should produce |
| **Actual Output** | The result that the system actually produces |
| **Pass** | Actual output matches expected output |
| **Fail** | Actual output does not match expected output |

Testing was performed using:
- **Postman** — For API endpoint testing with different request bodies, headers, and authentication tokens.
- **Browser DevTools** — For inspecting network requests, console errors, and UI rendering.
- **Manual Testing** — For end-to-end user flow validation across all three roles (Donor, NGO, Admin).

### 5.5 Testing Information

**Sample Test Cases:**

| Test ID | Module | Test Case | Input | Expected Output | Status |
|---------|--------|-----------|-------|-----------------|--------|
| TC-01 | Auth | Register new donor | Valid name, email, password, role=donor | 201 Created, JWT token returned | Pass |
| TC-02 | Auth | Register with existing email | Duplicate email | 400 "Email already in use" | Pass |
| TC-03 | Auth | Login with valid credentials | Correct email & password | 200 OK, JWT token | Pass |
| TC-04 | Auth | Login with wrong password | Incorrect password | 401 "Invalid credentials" | Pass |
| TC-05 | Auth | Access protected route without token | No Authorization header | 401 "No token" | Pass |
| TC-06 | Donation | Create donation as donor | Valid donation data + donor JWT | 201 Created, donation object | Pass |
| TC-07 | Donation | Create donation as NGO | Valid data + NGO JWT | 403 "Forbidden" | Pass |
| TC-08 | Request | NGO sends request | Valid donationId + NGO JWT | 201 Created, request object | Pass |
| TC-09 | Request | NGO sends duplicate request | Same donationId again | 400 "Already requested" | Pass |
| TC-10 | Request | Donor accepts NGO request | status=accepted + donor JWT | 200 OK, donation status → accepted, other requests → rejected | Pass |
| TC-11 | Request | NGO marks collected | status=collected + NGO JWT | 200 OK, donation status → collected | Pass |
| TC-12 | Admin | Verify NGO | PUT /admin/users/:id/verify | 200 OK, isVerified=true | Pass |
| TC-13 | Admin | Toggle user active status | PUT /admin/users/:id/toggle-active | 200 OK, isActive toggled | Pass |
| TC-14 | Admin | Get platform stats | GET /admin/stats + admin JWT | 200 OK, stats object with counts | Pass |
| TC-15 | Admin | Non-admin access admin route | GET /admin/stats + donor JWT | 403 "Forbidden" | Pass |

---

## Conclusion

FeedHop successfully addresses the problem of food waste by providing a structured, role-based platform that connects food donors with verified NGOs. The system streamlines the entire donation lifecycle — from listing surplus food to confirming collection — while giving administrators full control over platform integrity through NGO verification and user management.

The project demonstrates the practical application of modern web technologies including React, Node.js, Express, and MongoDB to solve a real-world social problem. The JWT-based authentication system ensures secure access, while the role-based authorization model guarantees that each user type can only perform actions appropriate to their role.

Key achievements of FeedHop:
- A fully functional three-role system (Donor, NGO, Admin) with distinct dashboards and workflows.
- Secure authentication with bcrypt password hashing and JWT token management.
- Automated request management — accepting one request automatically rejects competing requests.
- An admin panel with real-time statistics and full platform oversight.
- A responsive, modern UI built with React and Tailwind CSS.

Future enhancements could include:
- Real-time notifications using WebSockets (Socket.io) when a request is accepted or rejected.
- Geolocation-based donation discovery using the existing `coordinates` field.
- Mobile application using React Native.
- Email notifications for key events (registration, verification, request updates).
- Analytics dashboard with charts for donation trends over time.

---

## References

1. Node.js Documentation — https://nodejs.org/en/docs
2. Express.js Documentation — https://expressjs.com
3. MongoDB Documentation — https://www.mongodb.com/docs
4. Mongoose ODM Documentation — https://mongoosejs.com/docs
5. React Documentation — https://react.dev
6. React Router Documentation — https://reactrouter.com
7. Tailwind CSS Documentation — https://tailwindcss.com/docs
8. Vite Documentation — https://vitejs.dev/guide
9. JSON Web Tokens (JWT) — https://jwt.io/introduction
10. bcryptjs — https://www.npmjs.com/package/bcryptjs
11. Axios Documentation — https://axios-http.com/docs/intro
12. Framer Motion — https://www.framer.com/motion

---

## Geotag Image

> *(Attach the geotag/location image of the project development site here as required by the institution.)*
