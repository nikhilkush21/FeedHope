import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchAllDonations, deleteDonation } from '../../api';
import { StatusBadge, formatDateTime } from '../../utils/helpers.jsx';

const STATUSES = ['all', 'pending', 'accepted', 'collected', 'expired', 'cancelled'];

export default function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [filter,    setFilter]    = useState('all');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);

  const load = async () => {
    try { const { data } = await fetchAllDonations(); setDonations(data); }
    catch { toast.error('Failed to load donations'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this donation?')) return;
    try { await deleteDonation(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const filtered = donations
    .filter((d) => filter === 'all' || d.status === filter)
    .filter((d) => !search || d.foodType?.toLowerCase().includes(search.toLowerCase()) || d.donor?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="page-title">Donations</h2>
        <p className="page-sub">All food donations on the platform</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search food type or donor..." className="input-field max-w-xs" />
        <div className="tab-bar">
          {STATUSES.map((s) => <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'tab-item-active' : 'tab-item capitalize'}>{s}</button>)}
        </div>
        <span className="text-sm text-slate-400">{filtered.length} donations</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="spinner mr-3" />Loading...
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto shadow-card">
          <table className="tbl">
            <thead>
              <tr>{['Food Type','Quantity','Donor','Accepted By','Status','Address','Created',''].map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} className="text-center py-12 text-slate-400">No donations found</td></tr>
                : filtered.map((d) => (
                  <tr key={d._id}>
                    <td className="font-medium text-slate-700">{d.foodType}</td>
                    <td className="text-slate-600">{d.quantity}</td>
                    <td className="text-slate-500">{d.donor?.name || '—'}</td>
                    <td className="text-slate-500">{d.acceptedBy?.organizationName || d.acceptedBy?.name || '—'}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td className="text-slate-500 max-w-[160px] truncate">{d.pickupAddress}</td>
                    <td className="text-slate-400 whitespace-nowrap">{formatDateTime(d.createdAt)}</td>
                    <td><button onClick={() => handleDelete(d._id)} className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors ring-1 ring-red-200">Delete</button></td>
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
