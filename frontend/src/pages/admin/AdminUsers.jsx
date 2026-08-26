import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchAllUsers, verifyUser, toggleUserActive, deleteUser } from '../../api';
import { formatDateTime } from '../../utils/helpers.jsx';

const ROLES = ['all', 'donor', 'ngo', 'admin'];

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await fetchAllUsers(); setUsers(data); }
    catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleVerify = async (id) => { try { await verifyUser(id);      toast.success('User verified'); load(); } catch { toast.error('Failed'); } };
  const handleToggle = async (id) => { try { const { data } = await toggleUserActive(id); toast.success(data.message); load(); } catch { toast.error('Failed'); } };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try { await deleteUser(id); toast.success('User deleted'); load(); } catch { toast.error('Failed'); }
  };

  const filtered = users
    .filter((u) => filter === 'all' || u.role === filter)
    .filter((u) => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const roleBadge = {
    admin: 'bg-purple-50 text-purple-700 ring-purple-200',
    ngo:   'bg-blue-50   text-blue-700   ring-blue-200',
    donor: 'bg-brand-50  text-brand-700  ring-brand-200',
  };

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="page-title">Users</h2>
        <p className="page-sub">Manage all platform users</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." className="input-field max-w-xs" />
        <div className="tab-bar">
          {ROLES.map((r) => (
            <button key={r} onClick={() => setFilter(r)} className={filter === r ? 'tab-item-active' : 'tab-item capitalize'}>{r}</button>
          ))}
        </div>
        <span className="text-sm text-slate-400">{filtered.length} users</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="spinner mr-3" />Loading...
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto shadow-card">
          <table className="tbl">
            <thead>
              <tr>
                {['User', 'Email', 'Role', 'Verified', 'Status', 'Joined', 'Actions'].map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">No users found</td></tr>
                : filtered.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-100">{u.name}</span>
                      </div>
                    </td>
                    <td className="text-slate-500">{u.email}</td>
                    <td><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 capitalize ${roleBadge[u.role] || ''}`}>{u.role}</span></td>
                    <td>{u.isVerified ? <span className="text-brand-600 font-semibold">✓ Yes</span> : <span className="text-amber-600">Pending</span>}</td>
                    <td>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${u.isActive ? 'bg-brand-50 text-brand-700 ring-brand-200' : 'bg-red-50 text-red-700 ring-red-200'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-slate-400 whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
                    <td>
                      <div className="flex gap-1.5 flex-wrap">
                        {u.role === 'ngo' && !u.isVerified && u.isActive && (
                          <button onClick={() => handleVerify(u._id)} className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg hover:bg-brand-100 transition-colors ring-1 ring-brand-200">Approve</button>
                        )}
                        {u.role !== 'admin' && (
                          <button onClick={() => handleToggle(u._id)} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition-colors ring-1 ring-amber-200 whitespace-nowrap">
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDelete(u._id)} className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors ring-1 ring-red-200">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
