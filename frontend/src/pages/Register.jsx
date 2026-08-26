import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'donor', phone: '', address: '', organizationName: '', registrationNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.role === 'ngo' && !form.organizationName) return toast.error('Organization name is required');
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      const { data } = await registerUser(payload);
      login(data, data.token);
      toast.success('Welcome to FeedHope! 🎉');
      if (data.role === 'ngo') toast('Your NGO is pending admin verification. We\'ll get you approved soon!', { icon: '⏳' });
      navigate(data.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-up">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">🌿</div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Let's get you started</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">Sign in here</Link>
          </p>
        </div>

        <div className="card shadow-card">
          {/* Role toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6 border border-slate-200 dark:border-slate-700">
            {[['donor', '🍽️ I want to donate food'], ['ngo', '🤝 We\'re an NGO']].map(([r, label]) => (
              <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  form.role === r ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-soft' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Your phone number" className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Email *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="input-field" required />
            </div>

            {form.role === 'ngo' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-200 dark:border-brand-800">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Organization Name *</label>
                  <input name="organizationName" value={form.organizationName} onChange={handleChange} placeholder="e.g. Helping Hands Foundation" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Registration No.</label>
                  <input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} placeholder="NGO/2024/001" className="input-field" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Address</label>
              <input name="address" value={form.address} onChange={handleChange} placeholder="Your city or full address" className="input-field" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder="Min 6 characters" className="input-field pr-10" required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm transition-colors">
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Confirm Password *</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} placeholder="Repeat password" className="input-field" required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <><span className="spinner-sm" />Creating your account...</> : 'Create My Account →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
