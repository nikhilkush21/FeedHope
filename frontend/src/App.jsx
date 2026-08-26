import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public / Donor / NGO pages
import Home           from './pages/Home.jsx';
import Login          from './pages/Login.jsx';
import Register       from './pages/Register.jsx';
import DonorDashboard from './pages/donor/DonorDashboard.jsx';
import DonationForm   from './pages/donor/DonationForm.jsx';
import DonorRequests  from './pages/donor/DonorRequests.jsx';
import NgoDashboard   from './pages/ngo/NgoDashboard.jsx';

// Admin pages

import AdminLayout        from './pages/admin/AdminLayout.jsx';
import AdminOverview      from './pages/admin/AdminOverview.jsx';
import AdminNGOVerify     from './pages/admin/AdminNGOVerify.jsx';
import AdminAssignRequest from './pages/admin/AdminAssignRequest.jsx';
import AdminUsers         from './pages/admin/AdminUsers.jsx';
import AdminDonations     from './pages/admin/AdminDonations.jsx';
import AdminRequests      from './pages/admin/AdminRequests.jsx';

// Hide global Navbar on admin routes (admin has its own sidebar)
function Layout() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Donor */}
        <Route path="/donor/dashboard" element={
          <ProtectedRoute roles={['donor', 'admin']}><DonorDashboard /></ProtectedRoute>
        } />
        <Route path="/donor/donate" element={
          <ProtectedRoute roles={['donor', 'admin']}><DonationForm /></ProtectedRoute>
        } />
        <Route path="/donor/requests/:donationId" element={
          <ProtectedRoute roles={['donor', 'admin']}><DonorRequests /></ProtectedRoute>
        } />

        {/* NGO */}
        <Route path="/ngo/dashboard" element={
          <ProtectedRoute roles={['ngo', 'admin']}><NgoDashboard /></ProtectedRoute>
        } />

        {/* Admin — nested routes inside AdminLayout */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
        }>
          <Route index             element={<AdminOverview />} />
          <Route path="ngo-verify"     element={<AdminNGOVerify />} />
          <Route path="assign-request" element={<AdminAssignRequest />} />
          <Route path="users"          element={<AdminUsers />} />
          <Route path="donations"      element={<AdminDonations />} />
          <Route path="requests"       element={<AdminRequests />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Layout />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
