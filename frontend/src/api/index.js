import axios from 'axios';

const API = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api` })
;

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser  = (data) => API.post('/auth/register', data);
export const loginUser     = (data) => API.post('/auth/login', data);
export const fetchMe       = ()     => API.get('/auth/me');

// Donations
export const createDonation   = (data) => API.post('/donations', data);
export const fetchMyDonations = ()     => API.get('/donations/my');
export const fetchNearby      = (params) => API.get('/donations/nearby', { params });
export const fetchAllDonations= ()     => API.get('/donations/all');
export const fetchDonation    = (id)   => API.get(`/donations/${id}`);
export const updateDonation   = (id, data) => API.put(`/donations/${id}`, data);
export const deleteDonation   = (id)   => API.delete(`/donations/${id}`);

// Requests
export const createRequest         = (data) => API.post('/requests', data);
export const fetchNgoRequests      = ()     => API.get('/requests/ngo');
export const fetchDonationRequests = (donationId) => API.get(`/requests/donation/${donationId}`);
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
