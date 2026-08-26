import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchMyDonations, deleteDonation } from '../../api';
import { useAuth } from '../../context/AuthContext.jsx';
import DonationCard from '../../components/DonationCard.jsx';
import StatCard from '../../components/StatCard.jsx';

export default function DonorDashboard() {
  const { user }                  = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');

  const load = async () => {
    try { const { data } = await fetchMyDonations(); setDonations(data); }
    catch { toast.error('Failed to load donations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this donation?')) return;
    try { await deleteDonation(id); toast.success('Donation deleted'); setDonations((p) => p.filter((d) => d._id !== id)); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const counts = {
    total:     donations.length,
    pending:   donations.filter((d) => d.status === 'pending').length,
    accepted:  donations.filter((d) => d.status === 'accepted').length,
    collected: donations.filter((d) => d.status === 'collected').length,
  };

  const filtered = filter === 'all' ? donations : donations.filter((d) => d.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Hey, <span className="text-brand-500">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your food donations and see who you've helped</p>
        </div>
        <Link to="/donor/donate" className="btn-primary">
          <span>+</span> Share Food
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Shared"   value={counts.total}     icon="📦" color="green" />
        <StatCard label="Waiting"         value={counts.pending}   icon="⏳" color="yellow" />
        <StatCard label="Accepted"        value={counts.accepted}  icon="✅" color="blue" />
        <StatCard label="Delivered"       value={counts.collected} icon="🎉" color="green" />
      </div>

      {/* Filter tabs */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Your Donations</h2>
          <div className="tab-bar">
            {['all','pending','accepted','collected'].map((s) => (
              <button key={s} onClick={() => setFilter(s)}
                className={filter === s ? 'tab-item-active' : 'tab-item capitalize'}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-500">
            <div className="spinner mx-auto mb-3" />
            Loading donations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-16 shadow-card">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-slate-800 dark:text-slate-100 font-semibold text-lg mb-2">Nothing shared yet</p>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Your first donation could be someone's next meal. It only takes a minute!</p>
            <Link to="/donor/donate" className="btn-primary">Share Food Now</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((d) => (
              <DonationCard key={d._id} donation={d}
                actions={
                  d.status === 'pending' ? (
                    <>
                      <Link to={`/donor/requests/${d._id}`} className="btn-secondary text-sm py-1.5 flex-1 text-center">View Requests</Link>
                      <button onClick={() => handleDelete(d._id)} className="btn-danger text-sm py-1.5 px-3">Delete</button>
                    </>
                  ) : (
                    <Link to={`/donor/requests/${d._id}`} className="btn-secondary text-sm py-1.5 w-full text-center">View Requests</Link>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
