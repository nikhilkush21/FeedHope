# FeedHope — Frontend Deep Dive (Interview Study)

---

## 1. Tech Stack & Why

| Package | Purpose | Why Used |
|---|---|---|
| `react 19` | UI library | Component-based, virtual DOM, reusable UI |
| `vite` | Build tool | Faster than CRA, instant HMR, ES modules |
| `react-router-dom v7` | Client routing | SPA navigation without page reload |
| `axios` | HTTP client | Cleaner than fetch, interceptors support |
| `tailwindcss` | CSS framework | Utility classes, no custom CSS files needed |
| `framer-motion` | Animations | Declarative animations for React |
| `react-hot-toast` | Notifications | Simple toast alerts |
| `@heroicons/react` | Icons | SVG icons as React components |

---

## 2. Project Structure & Responsibility

```
src/
├── api/index.js          → All API calls in one place (single source of truth)
├── components/           → Reusable UI pieces used across pages
│   ├── Navbar.jsx        → Top navigation bar
│   ├── DonationCard.jsx  → Card to display one donation
│   ├── StatCard.jsx      → Stat display box with icon + number
│   └── ProtectedRoute.jsx→ Route guard based on auth + role
├── context/
│   ├── AuthContext.jsx   → Global user state (who is logged in)
│   └── ThemeContext.jsx  → Dark/light mode state
├── hooks/
│   └── useCountUp.js     → Custom hook for animated number counter
├── pages/                → One file per page/screen
├── utils/helpers.jsx     → Shared utility functions + StatusBadge component
└── App.jsx               → Route definitions
```

---

## 3. api/index.js — Axios Setup

```js
const API = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api` });

// Interceptor: attach JWT to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Interview Q: What is an Axios interceptor?**
> A function that runs before every request (request interceptor) or after every response (response interceptor). Here it automatically attaches the JWT token to every API call so we don't repeat it in every function.

**Interview Q: What is `import.meta.env`?**
> Vite's way to access environment variables. Variables must be prefixed with `VITE_` to be exposed to the browser. `process.env` is Node.js only — doesn't work in Vite.

**All API functions exported:**
```js
// Auth
export const registerUser  = (data) => API.post('/auth/register', data);
export const loginUser     = (data) => API.post('/auth/login', data);
export const fetchMe       = ()     => API.get('/auth/me');

// Donations
export const createDonation    = (data) => API.post('/donations', data);
export const fetchMyDonations  = ()     => API.get('/donations/my');
export const fetchNearby       = (params) => API.get('/donations/nearby', { params });
export const fetchAllDonations = ()     => API.get('/donations/all');
export const fetchDonation     = (id)   => API.get(`/donations/${id}`);
export const updateDonation    = (id, data) => API.put(`/donations/${id}`, data);
export const deleteDonation    = (id)   => API.delete(`/donations/${id}`);

// Requests
export const createRequest         = (data) => API.post('/requests', data);
export const fetchNgoRequests      = ()     => API.get('/requests/ngo');
export const fetchDonationRequests = (id)   => API.get(`/requests/donation/${id}`);
export const updateRequestStatus   = (id, status) => API.put(`/requests/${id}/status`, { status });
export const fetchAllRequests      = ()     => API.get('/requests/all');

// Admin
export const fetchAdminStats    = ()     => API.get('/admin/stats');
export const fetchAllUsers      = ()     => API.get('/admin/users');
export const verifyUser         = (id)   => API.put(`/admin/users/${id}/verify`);
export const rejectUser         = (id)   => API.put(`/admin/users/${id}/reject`);
export const toggleUserActive   = (id)   => API.put(`/admin/users/${id}/toggle-active`);
export const deleteUser         = (id)   => API.delete(`/admin/users/${id}`);
export const adminAssignRequest = (data) => API.post('/admin/assign-request', data);
export const clearAllRequests   = ()     => API.delete('/admin/requests/clear-all');
```

---

## 4. Context — Global State

### AuthContext.jsx

```js
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load: check if token exists, fetch user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    fetchMe()
      .then((res) => setUser(res.data))
      .catch(() => { localStorage.removeItem('token'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login  = (userData, token) => {
    localStorage.setItem('token', token);
    setUser({ ...userData });
  };
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Interview Q: Why `loading` state in AuthContext?**
> On page refresh, the app needs to verify the token with the server before rendering. Without `loading`, ProtectedRoute would redirect to login before the token check completes — causing a flash/redirect even for valid sessions.

**Interview Q: What is React Context?**
> A way to share state across components without prop drilling. Any component wrapped in `AuthProvider` can access `user`, `login`, `logout` via `useAuth()` hook.

**Interview Q: Why store token in localStorage?**
> Persists across page refreshes. Alternative is memory (lost on refresh) or cookies (need backend setup). localStorage is simple but vulnerable to XSS — acceptable for this project scope.

---

### ThemeContext.jsx

```js
export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Interview Q: What is lazy initial state `useState(() => ...)`?**
> The function is only called once on mount. Without the function wrapper, `localStorage.getItem` would run on every render. Lazy initialization is a performance optimization.

**Interview Q: How does Tailwind dark mode work here?**
> Tailwind's `darkMode: 'class'` config means dark styles apply when the `dark` class is on `<html>`. `document.documentElement.classList.toggle('dark', dark)` adds/removes it.

---

## 5. ProtectedRoute.jsx — Route Guard

```js
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="spinner" />;           // Wait for auth check
  if (!user) return <Navigate to="/login" replace />;        // Not logged in
  if (roles && !roles.includes(user.role))
    return <Navigate to="/" replace />;                      // Wrong role
  return children;                                           // Authorized
}
```

**Usage in App.jsx:**
```jsx
<Route path="/donor/dashboard" element={
  <ProtectedRoute roles={['donor', 'admin']}>
    <DonorDashboard />
  </ProtectedRoute>
} />
```

**Interview Q: What does `replace` do in `<Navigate>`?**
> Replaces the current history entry instead of pushing a new one. So pressing browser Back doesn't return to the protected page.

**Interview Q: Why check `loading` first?**
> If we check `!user` before loading completes, user is null (initial state) and we'd redirect to login even for authenticated users. We wait for the auth check to finish first.

---

## 6. App.jsx — Routing Structure

```jsx
function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin && <Navbar />}   {/* Admin has its own sidebar */}
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Donor */}
        <Route path="/donor/dashboard" element={
          <ProtectedRoute roles={['donor','admin']}><DonorDashboard /></ProtectedRoute>
        } />

        {/* Admin — nested routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
        }>
          <Route index             element={<AdminOverview />} />
          <Route path="ngo-verify" element={<AdminNGOVerify />} />
          <Route path="users"      element={<AdminUsers />} />
          {/* ... */}
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
```

**Interview Q: What are nested routes in React Router?**
> Child routes render inside the parent's `<Outlet />`. AdminLayout renders the sidebar + topbar, and `<Outlet />` renders the active child page (Overview, Users, etc.) inside it.

**Interview Q: What is `<Route index>`?**
> The default child route rendered when the parent path matches exactly. `/admin` renders `AdminOverview` because it's the index route.

**Interview Q: What is `path="*"`?**
> Wildcard — matches any path not matched above. Used as a 404 fallback, redirecting to home.

---

## 7. Custom Hook — useCountUp.js

```js
export default function useCountUp(target, duration = 1800) {
  const [count,   setCount]   = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // IntersectionObserver: trigger when element enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();   // Cleanup
  }, []);

  // Animate count from 0 to target
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));  // ~60fps
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);   // Cleanup
  }, [visible, target, duration]);

  return { count, ref };
}
```

**Usage:**
```jsx
function StatCounter({ value }) {
  const { count, ref } = useCountUp(value);
  return <div ref={ref}>{count}</div>;
}
```

**Interview Q: What is IntersectionObserver?**
> A browser API that fires a callback when an element enters/exits the viewport. Used here to start the count animation only when the stat is visible on screen.

**Interview Q: Why `return () => observer.disconnect()` in useEffect?**
> Cleanup function — runs when component unmounts. Prevents memory leaks by stopping the observer when the component is no longer in the DOM.

**Interview Q: What is `useRef`?**
> Returns a mutable object `{ current: ... }` that persists across renders without causing re-renders. Used here to attach to a DOM element so IntersectionObserver can watch it.

---

## 8. utils/helpers.jsx

```js
export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) : '—';

export const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : '—';

export const isExpired = (date) => date && new Date(date) < new Date();

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`badge-${status}`}>{label}</span>;
};
```

**Interview Q: What does `'en-IN'` locale do?**
> Formats date in Indian English style: `01 Jan 2024`. Different locales give different formats.

**Interview Q: Why is StatusBadge in utils instead of components?**
> It's a tiny presentational piece used in many places. No separate file needed — grouped with other helpers.

---

## 9. Components

### DonationCard.jsx
Reusable card that displays one donation. Accepts `donation` object and `actions` (buttons) as props:

```jsx
export default function DonationCard({ donation, actions }) {
  return (
    <div className="card ...">
      <h3>{donation.foodType}</h3>
      <StatusBadge status={donation.status} />
      <p>Qty: {donation.quantity}</p>
      <p>📍 {donation.pickupAddress}</p>
      <p>🕐 Prepared: {formatDateTime(donation.preparationTime)}</p>
      <p>⏰ Expires: {formatDateTime(donation.expiryTime)}</p>
      {donation.donor && <p>👤 {donation.donor.name}</p>}
      {actions && <div>{actions}</div>}   {/* Flexible action buttons */}
    </div>
  );
}
```

**Interview Q: Why pass `actions` as a prop?**
> The same card is used in DonorDashboard (with Delete/View buttons), NgoDashboard (with Request button), and AdminDonations (with Delete button). Passing actions as a prop makes the card reusable without knowing what buttons to show.

---

### StatCard.jsx
Displays a stat with icon, number, label, and color theme:

```jsx
export default function StatCard({ label, value, icon, color = 'green' }) {
  const colors = {
    green:  'bg-brand-50 text-brand-600 ring-brand-200',
    blue:   'bg-blue-50  text-blue-600  ring-blue-200',
    yellow: 'bg-amber-50 text-amber-600 ring-amber-200',
    // ...
  };
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ... ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
```

---

### Navbar.jsx — Key Logic

```jsx
const dashboardPath =
  user?.role === 'admin' ? '/admin' :
  user?.role === 'ngo'   ? '/ngo/dashboard' : '/donor/dashboard';
```

- Shows different links based on `user.role`
- Mobile hamburger menu with `open` state
- Dark mode toggle using `useTheme()`
- `user?.role` — optional chaining, safe if user is null

---

## 10. Pages Deep Dive

### Login.jsx

```jsx
const ROLES = [
  { key: 'donor', label: 'Donor',  activeBg: 'bg-brand-500',  hint: null },
  { key: 'ngo',   label: 'NGO',    activeBg: 'bg-blue-600',   hint: null },
  { key: 'admin', label: 'Admin',  activeBg: 'bg-purple-600',
    hint: { email: 'admin@feedhope.com', password: 'admin123' } },
];

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const { data } = await loginUser(form);
    login(data, data.token);           // Store in context + localStorage
    navigate(data.role === 'admin' ? '/admin' : ...);
  } catch (err) {
    if (!err.response) {
      // Network error — server not running
      toast.error("Can't reach the server right now...");
    } else {
      toast.error(err.response.data?.message || 'Invalid email or password.');
    }
  }
};
```

**Interview Q: What is `e.preventDefault()`?**
> Prevents the default form submission which would reload the page. We handle submission manually with JavaScript.

**Interview Q: How do you differentiate network error from server error in Axios?**
> If `err.response` is undefined, it's a network error (server not running, no internet). If `err.response` exists, the server responded with an error status (400, 401, etc.).

**Interview Q: What is `useSearchParams`?**
> React Router hook to read URL query params. Used here to pre-select role from URL: `/login?role=ngo` pre-selects the NGO tab.

---

### Register.jsx — Key Logic

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
  if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
  if (form.role === 'ngo' && !form.organizationName) return toast.error('Organization name required');

  const { confirmPassword, ...payload } = form;  // Remove confirmPassword before sending
  const { data } = await registerUser(payload);
  login(data, data.token);

  if (data.role === 'ngo') toast('Your NGO is pending admin verification', { icon: '⏳' });
  navigate(data.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard');
};
```

**Interview Q: Why destructure `confirmPassword` out of payload?**
> `confirmPassword` is only for frontend validation. The backend doesn't need it and doesn't have that field. We use object destructuring rest syntax to exclude it.

---

### DonationForm.jsx — Geolocation

```jsx
const getLocation = () => {
  if (!navigator.geolocation) return toast.error('Geolocation not supported');
  setLocating(true);
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setForm((f) => ({
        ...f,
        coordinates: [pos.coords.longitude, pos.coords.latitude]
      }));
      toast.success('Location captured!');
      setLocating(false);
    },
    () => { toast.error('Could not get location'); setLocating(false); }
  );
};
```

**Interview Q: What is the Geolocation API?**
> Browser built-in API (`navigator.geolocation`) to get user's GPS coordinates. Requires user permission. Returns `{ latitude, longitude, accuracy }`.

**Interview Q: Why `[longitude, latitude]` order?**
> GeoJSON standard uses `[longitude, latitude]` (x, y). MongoDB geospatial queries also follow this convention.

---

### DonorDashboard.jsx — Filter Logic

```jsx
const counts = {
  total:     donations.length,
  pending:   donations.filter((d) => d.status === 'pending').length,
  accepted:  donations.filter((d) => d.status === 'accepted').length,
  collected: donations.filter((d) => d.status === 'collected').length,
};

const filtered = filter === 'all'
  ? donations
  : donations.filter((d) => d.status === filter);
```

**Interview Q: Why filter on frontend instead of making new API calls?**
> Data is already fetched. Filtering in memory is instant. Making a new API call per filter tab would be slower and waste bandwidth.

---

### NgoDashboard.jsx — Key Logic

```jsx
// Track which donations this NGO already requested
const myRequestedIds = new Set(requests.map((r) => r.donation?._id));

// Show different UI based on request state
{myRequestedIds.has(d._id)
  ? <span>Already requested</span>
  : !user?.isVerified
    ? <span>Verify your NGO to send requests</span>
    : <button onClick={() => handleRequest(d._id)}>Request</button>
}
```

**Interview Q: Why use `Set` for `myRequestedIds`?**
> `Set.has()` is O(1) lookup vs Array `includes()` which is O(n). For large lists, Set is much faster.

**Mark as collected:**
```jsx
const handleCollected = async (requestId) => {
  await updateRequestStatus(requestId, 'collected');
  // Backend sets collectedAt timestamp and updates donation status
};
```

---

### AdminLayout.jsx — Sidebar with Outlet

```jsx
// Sidebar nav items
const navItems = [
  { to: '/admin',                icon: '📊', label: 'Overview', end: true },
  { to: '/admin/ngo-verify',     icon: '🏢', label: 'NGO Verifications' },
  { to: '/admin/assign-request', icon: '📨', label: 'Assign to NGO' },
  { to: '/admin/users',          icon: '👥', label: 'Users' },
  { to: '/admin/donations',      icon: '📦', label: 'Donations' },
  { to: '/admin/requests',       icon: '📋', label: 'Requests' },
];

// NavLink applies active styles automatically
<NavLink to={item.to} end={item.end}
  className={({ isActive }) => isActive ? 'active-style' : 'normal-style'}
>

// Child pages render here
<main><Outlet /></main>
```

**Interview Q: Difference between `Link` and `NavLink`?**
> `NavLink` provides an `isActive` boolean in its className/style function, allowing active link styling. `Link` is plain navigation with no active state.

**Interview Q: What is `end` prop on NavLink?**
> Without `end`, `/admin` would match as active for all `/admin/*` routes. `end: true` means it only matches exactly `/admin`.

---

### AdminAssignRequest.jsx — Modal Pattern

```jsx
const [selected, setSelected] = useState(null);  // null = modal closed

// Open modal
<button onClick={() => setSelected(donation)}>Assign to NGO</button>

// Modal
{selected && (
  <div className="fixed inset-0 z-50 bg-black/40">
    <div className="modal-content">
      {/* Form to select NGO */}
      <button onClick={() => setSelected(null)}>Cancel</button>
      <button onClick={handleAssign}>Assign</button>
    </div>
  </div>
)}
```

**Interview Q: How is this modal implemented without a library?**
> Using conditional rendering (`selected && ...`) and Tailwind's `fixed inset-0` for full-screen overlay. `z-50` ensures it appears above everything else.

---

## 11. State Management Patterns Used

### Local state (useState)
Used for component-specific data: form values, loading flags, filter tabs, modal open/close.

### Global state (Context)
Used for data needed across many components: `user` (auth), `dark` (theme).

### Derived state
Computed from existing state, not stored separately:
```jsx
const filtered = donations.filter((d) => d.status === filter);
const counts = { pending: donations.filter(...).length };
```

**Interview Q: Why not use Redux?**
> This app has simple global state (just user + theme). Context API is sufficient. Redux adds complexity that isn't needed here.

---

## 12. React Hooks Used

| Hook | Where Used | Purpose |
|------|-----------|---------|
| `useState` | Everywhere | Local component state |
| `useEffect` | Data fetching, subscriptions | Side effects after render |
| `useContext` | useAuth, useTheme | Consume context values |
| `useRef` | useCountUp | DOM reference, persists without re-render |
| `useNavigate` | Forms, logout | Programmatic navigation |
| `useParams` | DonorRequests | Get URL params (`:donationId`) |
| `useSearchParams` | Login | Read URL query string |
| `useLocation` | App.jsx Layout | Check current pathname |

---

## 13. Common Interview Questions

**Q: What is the virtual DOM?**
> React keeps a lightweight copy of the real DOM in memory. On state change, it diffs the new virtual DOM with the old one and only updates the changed parts in the real DOM. This is faster than re-rendering everything.

**Q: What is the difference between controlled and uncontrolled components?**
> Controlled: form value is stored in React state (`value={form.email}`). Uncontrolled: form value is in the DOM, accessed via ref. All forms here are controlled.

**Q: What is prop drilling and how is it avoided here?**
> Passing props through many component levels. Avoided using Context — `useAuth()` gives any component access to user without passing it as props.

**Q: What is the useEffect dependency array?**
> Controls when the effect runs. `[]` = run once on mount. `[id]` = run when id changes. No array = run after every render.

**Q: What is a custom hook?**
> A function starting with `use` that uses other hooks. `useCountUp` is a custom hook — it encapsulates IntersectionObserver + animation logic so any component can use it with one line.

**Q: What is `Promise.all` used for in AdminOverview?**
> Fetches stats, users, donations, and requests simultaneously instead of sequentially. All 4 API calls run in parallel, reducing total wait time.

**Q: How does dark mode work?**
> ThemeContext adds/removes the `dark` class on `<html>`. Tailwind's `dark:` prefix applies styles only when that class is present. Preference is saved in localStorage.

**Q: What is `useNavigate` vs `<Link>`?**
> `<Link>` is declarative navigation in JSX. `useNavigate()` is programmatic — used after form submission, logout, or any action that needs to redirect.

**Q: What is optional chaining (`?.`)?**
> Safely accesses nested properties. `user?.name` returns undefined instead of throwing if `user` is null/undefined. Used extensively since `user` starts as null.

**Q: How does the token persist across page refresh?**
> Token is in localStorage. On app load, AuthContext's useEffect reads it, calls `/api/auth/me` to verify it, and sets the user state. If token is invalid, it's removed and user stays null.
