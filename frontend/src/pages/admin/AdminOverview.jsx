import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchAdminStats, fetchAllUsers, fetchAllDonations, fetchAllRequests } from '../../api';
import StatCard from '../../components/StatCard.jsx';
import { StatusBadge, formatDateTime } from '../../utils/helpers.jsx';

export default function AdminOverview() {
  const [stats,           setStats]           = useState({});
  const [recentDonations, setRecentDonations] = useState([]);
  const [recentRequests,  setRecentRequests]  = useState([]);
  const [pendingNGOs,     setPendingNGOs]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchAdminStats(), fetchAllUsers(), fetchAllDonations(), fetchAllRequests()])
      .then(([s, u, d, r]) => {
        setStats(s.data);
        setPendingNGOs(u.data.filter((x) => x.role === 'ngo' && !x.isVerified && x.isActive));
        setRecentDonations(d.data.slice(0, 5));
        setRecentRequests(r.data.slice(0, 5));
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-slate-400">
      <span className="spinner mr-3" />Loading...
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="page-title">Overview</h2>
        <p className="page-sub">Platform summary at a glance</p>
      </div>

      {pendingNGOs.length > 0 && (
        <div onClick={() => navigate('/admin/ngo-verify')}
          className="alert-warning flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">
                {pendingNGOs.length} NGO verification {pendingNGOs.length === 1 ? 'request' : 'requests'} pending
              </p>
              <p className="text-sm mt-0.5 opacity-80">Click to review and approve</p>
            </div>
          </div>
          <span className="font-semibold text-sm">Review →</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users"       value={stats.totalUsers         ?? 0} icon="👥" color="blue" />
        <StatCard label="Donors"            value={stats.totalDonors        ?? 0} icon="🍽️" color="orange" />
        <StatCard label="NGOs"              value={stats.totalNGOs          ?? 0} icon="🏢" color="purple" />
        <StatCard label="Pending NGOs"      value={stats.pendingNGOs        ?? 0} icon="⏳" color="yellow" />
        <StatCard label="Total Donations"   value={stats.totalDonations     ?? 0} icon="📦" color="orange" />
        <StatCard label="Pending Donations" value={stats.pendingDonations   ?? 0} icon="🕐" color="yellow" />
        <StatCard label="Collected"         value={stats.collectedDonations ?? 0} icon="🎉" color="green" />
        <StatCard label="Total Requests"    value={stats.totalRequests      ?? 0} icon="📋" color="blue" />
      </div>

      {/* Quick Actions */}
      <div className="card p-0 overflow-hidden shadow-card">
        <div className="card-header"><h3>Quick Actions</h3></div>
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {[
            { icon: '🏢', label: 'Verify NGOs',   sub: 'Approve or reject NGO registrations',      path: '/admin/ngo-verify' },
            { icon: '📨', label: 'Assign to NGO', sub: 'Send pending donations to verified NGOs',  path: '/admin/assign-request' },
            { icon: '👥', label: 'Manage Users',  sub: 'View, activate or deactivate users',       path: '/admin/users' },
          ].map((a) => (
            <button key={a.path} onClick={() => navigate(a.path)}
              className="flex items-center gap-3 px-5 py-4  hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-left w-full">
              <span className="text-2xl">{a.icon}</span>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{a.label}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{a.sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-0 overflow-hidden shadow-card">
          <div className="card-header">
            <h3>Recent Donations</h3>
            <button onClick={() => navigate('/admin/donations')} className="text-sm text-brand-600 hover:text-brand-700 font-semibold">View all →</button>
          </div>
          {recentDonations.length === 0
            ? <p className="text-slate-600 dark:text-slate-400 text-sm text-center py-10">No donations yet</p>
            : <ul className="divide-y divide-slate-100">
                {recentDonations.map((d) => (
                  <li key={d._id} className="flex items-center justify-between px-5 py-3  hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{d.foodType} — {d.quantity}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{d.donor?.name} · {formatDateTime(d.createdAt)}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </li>
                ))}
              </ul>
          }
        </div>

        <div className="card p-0 overflow-hidden shadow-card">
          <div className="card-header">
            <h3>Recent Requests</h3>
            <button onClick={() => navigate('/admin/requests')} className="text-sm text-brand-600 hover:text-brand-700 font-semibold">View all →</button>
          </div>
          {recentRequests.length === 0
            ? <p className="text-slate-600 dark:text-slate-400 text-sm text-center py-10">No requests yet</p>
            : <ul className="divide-y divide-slate-100">
                {recentRequests.map((r) => (
                  <li key={r._id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{r.ngo?.organizationName || r.ngo?.ngoName || r.ngo?.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{r.donation?.foodType} · {formatDateTime(r.createdAt)}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </li>
                ))}
              </ul>
          }
        </div>
      </div>
    </div>
  );
}
