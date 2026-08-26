import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchDonationRequests, updateRequestStatus } from '../../api';
import { StatusBadge, formatDateTime } from '../../utils/helpers.jsx';

export default function DonorRequests() {
  const { donationId }          = useParams();
  const navigate                = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const load = async () => {
    try { const { data } = await fetchDonationRequests(donationId); setRequests(data); }
    catch { toast.error('Failed to load requests'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [donationId]);

  const handleStatus = async (requestId, status) => {
    try { await updateRequestStatus(requestId, status); toast.success(`Request ${status}`); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/donor/dashboard')} className="btn-ghost text-sm">← Back</button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">NGO Requests</h1>
          <p className="text-slate-500 text-sm">Review and respond to NGO requests for this donation</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <span className="spinner mr-3" />Loading...
        </div>
      ) : requests.length === 0 ? (
        <div className="card text-center py-14 shadow-card">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-800 font-semibold">No requests yet</p>
          <p className="text-slate-500 text-sm mt-1">NGOs haven't requested this donation yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <div key={r._id} className="card shadow-card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-slate-800">{r.ngo?.organizationName || r.ngo?.name}</p>
                  <p className="text-sm text-slate-500">{r.ngo?.email} {r.ngo?.phone && `· ${r.ngo.phone}`}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {r.message && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 mb-3">
                  <p className="text-sm text-slate-600 italic">"{r.message}"</p>
                </div>
              )}

              <p className="text-xs text-slate-400 mb-4">Requested: {formatDateTime(r.createdAt)}</p>

              {r.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleStatus(r._id, 'accepted')} className="btn-success text-sm py-2 flex-1">✓ Accept</button>
                  <button onClick={() => handleStatus(r._id, 'rejected')} className="btn-danger  text-sm py-2 flex-1">✗ Reject</button>
                </div>
              )}
              {r.status === 'accepted' && <p className="text-sm text-brand-600 font-semibold">✓ You accepted this NGO's request</p>}
              {r.status === 'collected' && <p className="text-sm text-brand-600 font-semibold">🎉 Collected on {formatDateTime(r.collectedAt)}</p>}
              {r.status === 'rejected' && <p className="text-sm text-red-500 font-semibold">✗ You rejected this request</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
