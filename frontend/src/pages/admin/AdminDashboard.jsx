import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchAdminStats, fetchAllUsers, fetchAllDonations, fetchAllRequests,
  verifyUser, rejectUser, toggleUserActive, deleteUser,
} from '../../api';
import StatCard from '../../components/StatCard.jsx';
import { StatusBadge, formatDateTime } from '../../utils/helpers.jsx';

export default function AdminDashboard() {
  const [stats, setStats]         = useState({});
  const [users, setUsers]         = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests]   = useState([]);
  const [tab, setTab]             = useState('overview');
  const [loading, setLoading]     = useState(true);
  const navigate                  = useNavigate();

  const loadAll = async () => {
    try {
      const [s, u, d, r] = await Promise.all([
        fetchAdminStats(), fetchAllUsers(), fetchAllDonations(), fetchAllRequests(),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setDonations(d.data);
      setRequests(r.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleVerify = async (id) => {
    try {
      await verifyUser(id);
      toast.success('NGO approved successfully');
      loadAll();
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this NGO verification request?')) return;
    try {
      await rejectUser(id);
      toast.success('NGO rejected');
      loadAll();
    } catch { toast.error('Failed to reject'); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleUserActive(id);
      toast.success(data.message);
      loadAll();
    } catch { toast.error('Failed to toggle'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      loadAll();
    } catch { toast.error('Failed to delete'); }
  };

  // NGOs pending verification: role=ngo, not verified, still active
  const pendingNGOs   = users.filter((u) => u.role === 'ngo' && !u.isVerified && u.isActive);
  const rejectedNGOs  = users.filter((u) => u.role === 'ngo' && !u.isVerified && !u.isActive);
  const approvedNGOs  = users.filter((u) => u.role === 'ngo' && u.isVerified);

  const tabs = [
    ['overview',     '📊 Overview'],
    ['ngo-verify',   `🏢 NGO Verifications ${pendingNGOs.length > 0 ? `(${pendingNGOs.length})` : ''}`],
    ['users',        '👥 Users'],
    ['donations',    '📦 Donations'],
    ['requests',     '📋 Requests'],
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Platform overview and management</p>
        </div>
        {/* Switch View Button */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/donor/dashboard')}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            🍽️ Switch to Donor View
          </button>
          <button
            onClick={() => navigate('/ngo/dashboard')}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            🏢 Switch to NGO View
          </button>
        </div>
      </div>

      {/* Pending NGO alert banner */}
      {pendingNGOs.length > 0 && (
        <div
          className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 flex items-center justify-between cursor-pointer hover:bg-yellow-100 transition-colors"
          onClick={() => setTab('ngo-verify')}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">
                {pendingNGOs.length} NGO verification {pendingNGOs.length === 1 ? 'request' : 'requests'} pending
              </p>
              <p className="text-sm text-yellow-600">Click to review and approve or reject</p>
            </div>
          </div>
          <span className="text-yellow-700 font-medium text-sm">Review →</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 flex-wrap">
        {tabs.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === key ? 'bg-white shadow text-primary-700' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard label="Total Users"       value={stats.totalUsers}         icon="👥" color="primary" />
              <StatCard label="Donors"            value={stats.totalDonors}        icon="🍽️" color="orange" />
              <StatCard label="NGOs"              value={stats.totalNGOs}          icon="🏢" color="blue" />
              <StatCard label="Pending NGOs"      value={stats.pendingNGOs ?? 0}   icon="⏳" color="orange" />
              <StatCard label="Total Donations"   value={stats.totalDonations}     icon="📦" color="primary" />
              <StatCard label="Pending Donations" value={stats.pendingDonations}   icon="🕐" color="orange" />
              <StatCard label="Collected"         value={stats.collectedDonations} icon="🎉" color="primary" />
              <StatCard label="Total Requests"    value={stats.totalRequests}      icon="📋" color="blue" />
            </div>
          )}

          {/* ── NGO Verifications ── */}
          {tab === 'ngo-verify' && (
            <div className="space-y-6">

              {/* Pending */}
              <div>
                <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
                  Pending Verification ({pendingNGOs.length})
                </h2>
                {pendingNGOs.length === 0 ? (
                  <div className="card text-center py-10">
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-gray-500">No pending NGO verification requests.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {pendingNGOs.map((ngo) => (
                      <NGOVerificationCard
                        key={ngo._id}
                        ngo={ngo}
                        onApprove={() => handleVerify(ngo._id)}
                        onReject={() => handleReject(ngo._id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Approved */}
              <div>
                <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Approved NGOs ({approvedNGOs.length})
                </h2>
                {approvedNGOs.length === 0 ? (
                  <p className="text-gray-400 text-sm">No approved NGOs yet.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {approvedNGOs.map((ngo) => (
                      <NGOVerificationCard
                        key={ngo._id}
                        ngo={ngo}
                        approved
                        onReject={() => handleReject(ngo._id)}
                        onToggle={() => handleToggle(ngo._id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Rejected */}
              {rejectedNGOs.length > 0 && (
                <div>
                  <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                    Rejected NGOs ({rejectedNGOs.length})
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {rejectedNGOs.map((ngo) => (
                      <NGOVerificationCard
                        key={ngo._id}
                        ngo={ngo}
                        rejected
                        onApprove={() => handleVerify(ngo._id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Users ── */}
          {tab === 'users' && (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Name', 'Email', 'Role', 'Verified', 'Active', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 capitalize">{u.role}</td>
                      <td className="px-4 py-3">
                        {u.isVerified
                          ? <span className="text-green-600 font-medium">✓ Verified</span>
                          : <span className="text-yellow-600">Pending</span>}
                      </td>
                      <td className="px-4 py-3">
                        {u.isActive
                          ? <span className="text-green-600">Active</span>
                          : <span className="text-red-500">Inactive</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{formatDateTime(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {u.role === 'ngo' && !u.isVerified && u.isActive && (
                            <button onClick={() => handleVerify(u._id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">
                              Approve
                            </button>
                          )}
                          {u.role !== 'admin' && (
                            <button onClick={() => handleToggle(u._id)} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
                          {u.role !== 'admin' && (
                            <button onClick={() => handleDelete(u._id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Donations ── */}
          {tab === 'donations' && (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['Food Type', 'Quantity', 'Donor', 'Status', 'Address', 'Created'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {donations.map((d) => (
                    <tr key={d._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{d.foodType}</td>
                      <td className="px-4 py-3">{d.quantity}</td>
                      <td className="px-4 py-3 text-gray-500">{d.donor?.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{d.pickupAddress}</td>
                      <td className="px-4 py-3 text-gray-400">{formatDateTime(d.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Requests ── */}
          {tab === 'requests' && (
            <div className="card overflow-x-auto p-0">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['NGO', 'Donation', 'Donor', 'Status', 'Requested'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{r.ngo?.organizationName || r.ngo?.name}</td>
                      <td className="px-4 py-3">{r.donation?.foodType} — {r.donation?.quantity}</td>
                      <td className="px-4 py-3 text-gray-500">{r.donation?.donor?.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3 text-gray-400">{formatDateTime(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── NGO Verification Card Component ──
function NGOVerificationCard({ ngo, approved, rejected, onApprove, onReject, onToggle }) {
  return (
    <div className={`card border-l-4 ${
      approved ? 'border-l-green-500' :
      rejected  ? 'border-l-red-400'  :
                  'border-l-yellow-400'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-gray-900">{ngo.organizationName || ngo.name}</p>
          <p className="text-sm text-gray-500">{ngo.email}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          approved ? 'bg-green-100 text-green-700' :
          rejected  ? 'bg-red-100 text-red-700'    :
                      'bg-yellow-100 text-yellow-700'
        }`}>
          {approved ? '✓ Approved' : rejected ? '✗ Rejected' : '⏳ Pending'}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600 mb-4">
        {ngo.registrationNumber && <p>🪪 Reg No: {ngo.registrationNumber}</p>}
        {ngo.phone   && <p>📞 {ngo.phone}</p>}
        {ngo.address && <p>📍 {ngo.address}</p>}
        <p>🗓 Registered: {formatDateTime(ngo.createdAt)}</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {!approved && onApprove && (
          <button onClick={onApprove} className="btn-primary text-sm py-1.5 flex-1">
            ✓ Approve
          </button>
        )}
        {!rejected && onReject && (
          <button onClick={onReject} className="btn-danger text-sm py-1.5 flex-1">
            ✗ Reject
          </button>
        )}
        {approved && onToggle && (
          <button onClick={onToggle} className="btn-secondary text-sm py-1.5 flex-1">
            {ngo.isActive ? 'Deactivate' : 'Activate'}
          </button>
        )}
      </div>
    </div>
  );
}
