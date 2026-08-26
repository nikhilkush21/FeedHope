import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchNearby, fetchNgoRequests, createRequest, updateRequestStatus } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';
import DonationCard from '../../components/DonationCard.jsx';
import StatCard from '../../components/StatCard.jsx';
import { StatusBadge, formatDateTime } from '../../utils/helpers.jsx';

export default function NgoDashboard() {
  const { user }                  = useAuth();
  const [donations, setDonations] = useState([]);
  const [requests,  setRequests]  = useState([]);
  const [tab,       setTab]       = useState('nearby');
  const [loading,   setLoading]   = useState(true);
  const [coords,    setCoords]    = useState(null);
  const [message,   setMessage]   = useState('');

  const loadNearby = async (lng, lat) => {
    try { const { data } = await fetchNearby(lng && lat ? { lng, lat, maxDistance: 20000 } : {}); setDonations(data); }
    catch { toast.error('Failed to load nearby donations'); }
  };
  const loadRequests = async () => {
    try { const { data } = await fetchNgoRequests(); setRequests(data); }
    catch { toast.error('Failed to load requests'); }
  };

  useEffect(() => {
    setLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => { const { longitude: lng, latitude: lat } = pos.coords; setCoords({ lng, lat }); Promise.all([loadNearby(lng, lat), loadRequests()]).finally(() => setLoading(false)); },
      () => { Promise.all([loadNearby(), loadRequests()]).finally(() => setLoading(false)); }
    );
  }, []);

  const handleRequest = async (donationId) => {
    try { await createRequest({ donationId, message }); toast.success('Request sent!'); setMessage(''); loadNearby(coords?.lng, coords?.lat); loadRequests(); }
    catch (err) { toast.error(err.response?.data?.message || 'Request failed'); }
  };
  const handleCollected = async (requestId) => {
    try { await updateRequestStatus(requestId, 'collected'); toast.success('Marked as collected!'); loadRequests(); }
    catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const myRequestedIds = new Set(requests.map((r) => r.donation?._id));
  const active    = requests.filter((r) => ['pending', 'accepted'].includes(r.status));
  const completed = requests.filter((r) => r.status === 'collected');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
          Welcome, <span className="text-brand-500">{user?.organizationName || user?.name?.split(' ')[0]}</span> 👋
        </h1>

        {!user?.isVerified && user?.isActive && (
          <div className="mt-3 alert-warning flex items-start gap-3">
            <span className="text-xl">⏳</span>
            <div>
              <p className="font-semibold">Verification Pending</p>
              <p className="text-sm mt-0.5 opacity-80">Your NGO is awaiting admin approval. You can browse but cannot send requests until verified.</p>
            </div>
          </div>
        )}
        {!user?.isVerified && !user?.isActive && (
          <div className="mt-3 alert-danger flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-semibold">Verification Rejected</p>
              <p className="text-sm mt-0.5 opacity-80">Your NGO verification was rejected. Please contact support.</p>
            </div>
          </div>
        )}
        {user?.isVerified && <p className="text-brand-600 font-semibold mt-1 text-sm">✓ Verified NGO</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Nearby Donations" value={donations.length}  icon="📍" color="orange" />
        <StatCard label="My Requests"      value={requests.length}   icon="📋" color="blue" />
        <StatCard label="Active"           value={active.length}     icon="⏳" color="yellow" />
        <StatCard label="Collected"        value={completed.length}  icon="🎉" color="green" />
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        {[['nearby','📍 Nearby'],['active','⏳ Active'],['completed','✅ Completed']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={tab === key ? 'tab-item-active' : 'tab-item'}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 dark:text-slate-500">
          <span className="spinner mr-3" />Loading...
        </div>
      ) : (
        <>
          {tab === 'nearby' && (
            <div>
              {!coords && (
                <div className="alert-warning text-sm mb-4">⚠️ Location unavailable — showing all pending donations. Enable location for nearby results.</div>
              )}
              {donations.length === 0
                ? <div className="card text-center py-14 shadow-card"><p className="text-4xl mb-3">🔍</p><p className="text-slate-500 dark:text-slate-400">No pending donations nearby.</p></div>
                : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {donations.map((d) => (
                      <DonationCard key={d._id} donation={d}
                        actions={
                          myRequestedIds.has(d._id)
                            ? <span className="text-sm text-blue-600 font-semibold">✓ Already requested</span>
                            : !user?.isVerified
                              ? <span className="text-sm text-amber-600">⏳ Verify your NGO to send requests</span>
                              : <div className="w-full space-y-2">
                                  <input placeholder="Optional message to donor..." className="input-field text-sm" value={message} onChange={(e) => setMessage(e.target.value)} />
                                  <button onClick={() => handleRequest(d._id)} className="btn-primary w-full text-sm py-2">Request This Donation</button>
                                </div>
                        }
                      />
                    ))}
                  </div>
              }
            </div>
          )}

          {tab === 'active' && (
            <div className="space-y-3">
              {active.length === 0
                ? <div className="card text-center py-14 shadow-card"><p className="text-4xl mb-3">📭</p><p className="text-slate-500 dark:text-slate-400">No active requests.</p></div>
                : active.map((r) => (
                  <div key={r._id} className="card shadow-soft">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{r.donation?.foodType} — {r.donation?.quantity}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">📍 {r.donation?.pickupAddress}</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">Requested: {formatDateTime(r.createdAt)}</p>
                    {r.status === 'accepted' && (
                      <button onClick={() => handleCollected(r._id)} className="btn-success text-sm py-2">✓ Mark as Collected</button>
                    )}
                  </div>
                ))
              }
            </div>
          )}

          {tab === 'completed' && (
            <div className="space-y-3">
              {completed.length === 0
                ? <div className="card text-center py-14 shadow-card"><p className="text-4xl mb-3">🎉</p><p className="text-slate-500 dark:text-slate-400">No completed collections yet.</p></div>
                : completed.map((r) => (
                  <div key={r._id} className="card shadow-soft">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-100">{r.donation?.foodType} — {r.donation?.quantity}</h3>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">📍 {r.donation?.pickupAddress}</p>
                    <p className="text-sm text-brand-600 font-medium mt-1">Collected: {formatDateTime(r.collectedAt)}</p>
                  </div>
                ))
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}
