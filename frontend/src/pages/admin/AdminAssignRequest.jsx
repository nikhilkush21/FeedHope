import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchAllDonations, fetchAllUsers, adminAssignRequest, fetchAllRequests } from '../../api';
import { StatusBadge, formatDateTime } from '../../utils/helpers.jsx';

const orgName = (u) => u.organizationName || u.ngoName || u.name;

export default function AdminAssignRequest() {
  const [donations, setDonations] = useState([]);
  const [ngos,      setNgos]      = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState(null);
  const [ngoId,     setNgoId]     = useState('');
  const [message,   setMessage]   = useState('');
  const [assigning, setAssigning] = useState(false);

  const load = async () => {
    try {
      const [d, u, r] = await Promise.all([fetchAllDonations(), fetchAllUsers(), fetchAllRequests()]);
      setDonations(d.data.filter((x) => x.status === 'pending'));
      setNgos(u.data.filter((x) => x.role === 'ngo' && x.isVerified));
      setRequests(r.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const alreadyRequestedNgoIds = (donationId) =>
    new Set(requests.filter((r) => r.donation?._id === donationId || r.donation === donationId).map((r) => r.ngo?._id || r.ngo));

  const handleAssign = async () => {
    if (!ngoId) return toast.error('Please select an NGO');
    setAssigning(true);
    try {
      await adminAssignRequest({ donationId: selected._id, ngoId, message });
      toast.success('Request assigned successfully');
      setSelected(null); setNgoId(''); setMessage('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign'); }
    finally { setAssigning(false); }
  };

  const filtered = donations.filter((d) =>
    !search ||
    d.foodType?.toLowerCase().includes(search.toLowerCase()) ||
    d.donor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.pickupAddress?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h2 className="page-title">Assign Requests to NGOs</h2>
        <p className="page-sub">Browse pending donations and manually assign them to a verified NGO</p>
      </div>

      <div className="alert-info flex items-start gap-3">
        <span className="text-lg mt-0.5">ℹ️</span>
        <p className="text-sm">Select a pending donation, choose a verified NGO, and click Assign. The donor can then accept or reject the request.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center py-4 shadow-soft"><p className="text-2xl font-bold text-brand-600">{donations.length}</p><p className="text-xs text-slate-400 mt-1">Pending Donations</p></div>
        <div className="card text-center py-4 shadow-soft"><p className="text-2xl font-bold text-brand-600">{ngos.length}</p><p className="text-xs text-slate-400 mt-1">Verified NGOs</p></div>
        <div className="card text-center py-4 shadow-soft"><p className="text-2xl font-bold text-blue-600">{requests.length}</p><p className="text-xs text-slate-400 mt-1">Total Requests</p></div>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by food type, donor or address..." className="input-field max-w-md" />

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <span className="spinner mr-3" />Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 shadow-card">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-slate-800 font-semibold">No pending donations</p>
          <p className="text-slate-400 text-sm mt-1">All donations have been assigned or collected</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((d) => {
            const existingIds = alreadyRequestedNgoIds(d._id);
            return (
              <div key={d._id} className="card flex flex-col gap-3 hover:border-brand-300 hover:shadow-card transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">{d.foodType}</h3>
                    <p className="text-sm text-slate-500">Qty: {d.quantity}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                {d.description && <p className="text-sm text-slate-500 italic">"{d.description}"</p>}
                <div className="space-y-1 text-sm text-slate-500">
                  <p>📍 {d.pickupAddress}</p>
                  <p>👤 <span className="text-slate-700">{d.donor?.name}</span></p>
                  <p>⏰ Expires: {formatDateTime(d.expiryTime)}</p>
                </div>
                {existingIds.size > 0 && (
                  <div className="alert-info py-2 px-3 text-xs">📋 {existingIds.size} NGO{existingIds.size > 1 ? 's have' : ' has'} already requested this</div>
                )}
                <button onClick={() => { setSelected(d); setNgoId(''); setMessage(''); }} className="btn-primary text-sm py-2 mt-auto">
                  🏢 Assign to NGO
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Assign to NGO</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none transition-colors">&times;</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-1 text-sm border border-slate-200">
                <p className="font-semibold text-slate-800">{selected.foodType} — {selected.quantity}</p>
                <p className="text-slate-500">📍 {selected.pickupAddress}</p>
                <p className="text-slate-500">👤 {selected.donor?.name}</p>
                <p className="text-slate-500">⏰ Expires: {formatDateTime(selected.expiryTime)}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Select Verified NGO <span className="text-brand-500">*</span></label>
                {ngos.length === 0
                  ? <div className="alert-warning text-sm">⚠️ No verified NGOs available. Verify an NGO first.</div>
                  : <select value={ngoId} onChange={(e) => setNgoId(e.target.value)} className="input-field">
                      <option value="">— Choose an NGO —</option>
                      {ngos.map((n) => {
                        const already = alreadyRequestedNgoIds(selected._id).has(n._id);
                        return <option key={n._id} value={n._id} disabled={already}>{orgName(n)}{already ? ' (already requested)' : ''}</option>;
                      })}
                    </select>
                }
              </div>

              {ngoId && (() => { const n = ngos.find((x) => x._id === ngoId); return n ? (
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 text-sm text-brand-700 space-y-0.5">
                  <p className="font-semibold">{orgName(n)}</p>
                  <p className="text-brand-500">{n.email}</p>
                  {n.phone && <p>{n.phone}</p>}
                </div>
              ) : null; })()}

              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1.5">Message (optional)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g. Please collect before 6 PM" rows={3} className="input-field resize-none" />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAssign} disabled={assigning || !ngoId || ngos.length === 0} className="btn-primary flex-1">
                {assigning ? <><span className="spinner-sm" />Assigning...</> : '✓ Assign Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
