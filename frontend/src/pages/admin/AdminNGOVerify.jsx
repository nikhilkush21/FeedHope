import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { fetchAllUsers, verifyUser, rejectUser, toggleUserActive } from '../../api';
import { formatDateTime } from '../../utils/helpers.jsx';

const orgName = (u) => u.organizationName || u.ngoName || u.name;

export default function AdminNGOVerify() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try { const { data } = await fetchAllUsers(); setUsers(data.filter((u) => u.role === 'ngo')); }
    catch { toast.error('Failed to load NGOs'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try { await verifyUser(id); toast.success('NGO approved'); load(); } catch { toast.error('Failed to approve'); }
  };
  const handleReject = async (id) => {
    if (!window.confirm('Reject this NGO?')) return;
    try { await rejectUser(id); toast.success('NGO rejected'); load(); } catch (err) { toast.error(err?.response?.data?.message || 'Failed to reject'); }
  };
  const handleToggle = async (id) => {
    try { const { data } = await toggleUserActive(id); toast.success(data.message); load(); } catch { toast.error('Failed'); }
  };

  const pending  = users.filter((u) => u.role === 'ngo' && !u.isVerified &&  u.isActive);
  const approved = users.filter((u) => u.role === 'ngo' &&  u.isVerified);
  const rejected = users.filter((u) => u.role === 'ngo' && !u.isVerified && !u.isActive);

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-slate-400">
      <span className="spinner mr-3" />Loading...
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h2 className="page-title">NGO Verifications</h2>
        <p className="page-sub">Review and approve NGO registration requests</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <span className="bg-amber-50 text-amber-700 ring-1 ring-amber-400 text-sm font-semibold px-4 py-1.5 rounded-full">⏳ Pending: {pending.length}</span>
        <span className="bg-brand-50 text-brand-700 ring-1 ring-brand-400 text-sm font-semibold px-4 py-1.5 rounded-full">✓ Approved: {approved.length}</span>
        <span className="bg-red-50 text-red-700 ring-1 ring-red-400 text-sm font-semibold px-5 py-1.5 rounded-full">✗ Rejected: {rejected.length}</span>
      </div>

      <Section title="Pending Verification" dot="bg-amber-400" count={pending.length} empty="No pending NGO requests 🎉" >
        {pending.map((ngo) => <NGOCard key={ngo._id} ngo={ngo} status="pending" onApprove={() => handleApprove(ngo._id)} onReject={() => handleReject(ngo._id)} />)}
      </Section>


      <Section title="Approved NGOs" dot="bg-brand-500" count={approved.length} empty="No approved NGOs yet">
        {approved.map((ngo) => <NGOCard key={ngo._id} ngo={ngo} status="approved" onReject={() => handleReject(ngo._id)} onToggle={() => handleToggle(ngo._id)} />)}
      </Section>

      {rejected.length > 0 && (
        <Section title="Rejected NGOs" dot="bg-red-400" count={rejected.length} empty="">
          {rejected.map((ngo) => <NGOCard key={ngo._id} ngo={ngo} status="rejected" onApprove={() => handleApprove(ngo._id)} />)}
        </Section>
      )}
    </div>
  );
}

function Section({ title, dot, count, empty, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title} <span className="text-slate-400">({count})</span></h3>
      </div>
      {count === 0
        ? <div className="card text-center py-10 text-slate-400">{empty}</div>
        : <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{children}</div>
      }
    </div>
  );
}

function NGOCard({ ngo, status, onApprove, onReject, onToggle }) {
  const border = { pending: 'border-l-amber-400', approved: 'border-l-brand-500', rejected: 'border-l-red-400' };
  const badge  = { pending: 'bg-amber-50 text-amber-700 ring-amber-200', approved: 'bg-brand-50 text-brand-700 ring-brand-200', rejected: 'bg-red-50 text-red-700 ring-red-200' };
  const label  = { pending: '⏳ Pending', approved: '✓ Approved', rejected: '✗ Rejected' };

  return (
    <div className={`card border-l-4 ${border[status]} flex flex-col gap-3 shadow-soft text-slate-800  dark:text-slate-100`}>
      <div className="flex justify-between items-start">
        <div >
          <p className="font-semibold">{orgName(ngo)}</p>
          <p className="text-sm ">{ngo.email}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${badge[status]}`}>{label[status]}</span>
      </div>

      <div className="space-y-1 text-sm ">
        {ngo.registrationNumber && <p>🪪 Reg: <span className="">{ngo.registrationNumber}</span></p>}
        {ngo.phone   && <p>📞 <span className="">{ngo.phone}</span></p>}
        {ngo.address && <p>📍 <span className=" truncate">{ngo.address}</span></p>}
        <p>🗓 <span className="">{formatDateTime(ngo.createdAt)}</span></p>
      </div>

      <div className="flex gap-2 pt-1">
        {status === 'pending'  && <><button onClick={onApprove} className="btn-success text-sm py-1.5 flex-1">✓ Approve</button><button onClick={onReject} className="btn-danger text-sm py-1.5 flex-1">✗ Reject</button></>}
        {status === 'approved' && <><button onClick={onReject}  className="btn-danger text-sm py-1.5 flex-1">✗ Revoke</button><button onClick={onToggle} className="btn-secondary text-sm py-1.5 flex-1">{ngo.isActive ? 'Deactivate' : 'Activate'}</button></>}
        {status === 'rejected' && <button onClick={onApprove} className="btn-success text-sm py-1.5 w-full">↩ Re-approve</button>}
      </div>
    </div>
  );
}
