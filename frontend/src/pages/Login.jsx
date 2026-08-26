import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../api';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key: 'donor', label: 'Donor',  icon: '🍽️', desc: 'I share surplus food',        ring: 'ring-brand-400',  activeBg: 'bg-brand-500',  hint: null },
  { key: 'ngo',   label: 'NGO',    icon: '🤝', desc: 'We collect & feed people',    ring: 'ring-blue-400',   activeBg: 'bg-blue-600',   hint: null },
  { key: 'admin', label: 'Admin',  icon: '🛡️', desc: 'Platform administrator',       ring: 'ring-purple-400', activeBg: 'bg-purple-600', hint: { email: 'admin@feedhope.com', password: 'admin123' } },
];

export default function Login() {
  const [searchParams] = useSearchParams();
  const initRole    = ROLES.find((r) => r.key === searchParams.get('role'))?.key || 'donor';
  const [activeRole, setActiveRole] = useState(initRole);
  const [form,  setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    const role = ROLES.find((r) => r.key === searchParams.get('role'))?.key || 'donor';
    setActiveRole(role);
    setForm({ email: '', password: '' });
    setShowPw(false);
  }, [searchParams]);

  const role = ROLES.find((r) => r.key === activeRole);

  const switchRole = (key) => { setActiveRole(key); setForm({ email: '', password: '' }); setShowPw(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('All fields are required');
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      if (data.role !== activeRole) toast(`Logged in as ${data.role}`, { icon: 'ℹ️' });
      login(data, data.token);
      toast.success(`Good to have you back, ${data.name}! 👋`);
      navigate(data.role === 'admin' ? '/admin' : data.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Can\'t reach the server right now. Please check your connection and try again.');
      } else {
        toast.error(err.response.data?.message || 'Invalid email or password.');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm space-y-4 animate-fade-up">

        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-lg shadow-sm">🌿</div>
            <span className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Feed<span className="text-brand-500">Hope</span></span>
          </Link>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Welcome back — let's pick up where you left off.</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((r) => (
            <button key={r.key} onClick={() => switchRole(r.key)}
              className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border-2 transition-all duration-200 ${
                activeRole === r.key
                  ? `${r.activeBg} border-transparent shadow-md text-white`
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-soft'
              }`}>
              <span className="text-lg">{r.icon}</span>
              <span className={`text-xs font-bold ${activeRole === r.key ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{r.label}</span>
              <span className={`text-xs text-center leading-tight ${activeRole === r.key ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>{r.desc}</span>
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="card shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
              activeRole === 'donor' ? 'bg-brand-100' : activeRole === 'ngo' ? 'bg-blue-100' : 'bg-purple-100'
            }`}>{role.icon}</div>
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{role.label} Login</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">{role.desc}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Email address</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={`${role.label.toLowerCase()}@example.com`} className="input-field text-sm py-2" required />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" className="input-field text-sm py-2 pr-10" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {role.hint && (
              <button type="button" onClick={() => setForm({ email: role.hint.email, password: role.hint.password })}
                className="w-full flex items-center justify-between bg-purple-50 border border-purple-200 hover:border-purple-300 rounded-xl px-3 py-2 transition-colors group">
                <div className="text-left">
                  <p className="text-xs font-semibold text-purple-700">Use demo credentials</p>
                  <p className="text-xs text-purple-400 mt-0.5">{role.hint.email}</p>
                </div>
                <span className="text-xs text-purple-600 font-semibold">Fill →</span>
              </button>
            )}

            <button type="submit" disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${
                activeRole === 'donor' ? 'bg-brand-500 hover:bg-brand-600' :
                activeRole === 'ngo'   ? 'bg-blue-600   hover:bg-blue-700'   :
                                         'bg-purple-600 hover:bg-purple-700'
              }`}>
              {loading ? <><span className="spinner-sm" />Signing in...</> : `Sign in as ${role.label} →`}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">Create one free</Link>
        </p>
      </div>
    </div>
  );
}
