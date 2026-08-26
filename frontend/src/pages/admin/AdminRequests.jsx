import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchAllRequests, clearAllRequests } from '../../api';
import { StatusBadge, formatDateTime } from '../../utils/helpers.jsx';

const STATUSES = ['all', 'pending', 'accepted', 'rejected', 'collected'];

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [clearing, setClearing] = useState(false);

  const loadRequests = () => {
    setLoading(true);
    fetchAllRequests()
      .then(({ data }) => setRequests(data))
      .catch(() => toast.error('Failed to load requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, []);

  const handleClearAll = async () => {
    if (!window.confirm(`Are you sure you want to delete all ${requests.length} requests? This cannot be undone.`)) return;
    setClearing(true);
    try {
      await clearAllRequests();
      setRequests([]);
      toast.success('All requests cleared');
    } catch {
      toast.error('Failed to clear requests');
    } finally {
      setClearing(false);
    }
  };

  const filtered = requests
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => !search ||
      r.ngo?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.ngo?.organizationName?.toLowerCase().includes(search.toLowerCase()) ||
      r.donation?.foodType?.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="page-title">Requests</h2>
        <p className="page-sub">All NGO donation requests</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search NGO or food type..." className="input-field max-w-xs" />
        <div className="tab-bar">
          {STATUSES.map((s) => <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'tab-item-active' : 'tab-item capitalize'}>{s}</button>)}
        </div>
        <span className="text-sm text-slate-400">{filtered.length} requests</span>
        <button
          onClick={handleClearAll}
          disabled={clearing || requests.length === 0}
          className="ml-auto flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
        >
          {clearing ? <span className="spinner" /> : '🗑️'}
          Clear All Requests
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="spinner mr-3" />Loading...
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto shadow-card">
          <table className="tbl">
            <thead>
              <tr>{['NGO','Donation','Donor','Status','Message','Requested','Collected At'].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-slate-400">No requests found</td></tr>
                : filtered.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <p className="font-medium text-slate-700 dark:text-slate-300">{r.ngo?.organizationName || r.ngo?.ngoName || r.ngo?.name}</p>
                      <p className="text-xs text-slate-400">{r.ngo?.email}</p>
                    </td>
                    <td>
                      <p className="text-slate-700 dark:text-slate-300">{r.donation?.foodType}</p>
                      <p className="text-xs text-slate-400">{r.donation?.quantity}</p>
                    </td>
                    <td className="text-slate-500">{r.donation?.donor?.name || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td className="text-slate-500 max-w-[140px] truncate">{r.message || '—'}</td>
                    <td className="text-slate-400 whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                    <td className="text-slate-400 whitespace-nowrap">{r.collectedAt ? formatDateTime(r.collectedAt) : '—'}</td>
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
