import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate         = useNavigate();
  const [open, setOpen]  = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  const dashboardPath =
    user?.role === 'admin' ? '/admin' :
    user?.role === 'ngo'   ? '/ngo/dashboard' : '/donor/dashboard';

  const ThemeBtn = () => (
    <button onClick={toggle} className="btn-ghost p-2 text-lg" title={dark ? 'Light mode' : 'Dark mode'}>
      {dark ? '☀️' : '🌙'}
    </button>
  );

  return (
    <nav className="backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main row */}
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm text-lg">🌿</div>
            <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Feed<span className="text-brand-500">Hope</span></span>
          </Link>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <>
                <Link to={dashboardPath} className="btn-ghost text-sm">Dashboard</Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-200 max-w-[120px] truncate font-medium">{user.name}</span>
                  <span className={`text-xs font-semibold capitalize px-1.5 py-0.5 rounded-md ${
                    user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' :
                    user.role === 'ngo'   ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'     :
                                            'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300'
                  }`}>{user.role}</span>
                </div>
                <ThemeBtn />
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-4">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login?role=donor" className="btn-ghost text-sm">🍽️ Donor</Link>
                <Link to="/login?role=ngo"   className="btn-ghost text-sm">🏢 NGO</Link>
                <Link to="/login?role=admin" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all">🛡️ Admin</Link>
                <ThemeBtn />
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-1">
            <ThemeBtn />
            <button className="btn-ghost p-2" onClick={() => setOpen(!open)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {open
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="sm:hidden pb-4 pt-3 space-y-1 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold text-white">{user.name?.[0]?.toUpperCase()}</div>
                  <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{user.name}</span>
                  <span className="text-xs text-brand-600 dark:text-brand-400 capitalize font-semibold">({user.role})</span>
                </div>
                <Link to={dashboardPath} onClick={() => setOpen(false)} className="block px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Dashboard</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login?role=donor" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-brand-700 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors">🍽️ Login as Donor</Link>
                <Link to="/login?role=ngo"   onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">🏢 Login as NGO</Link>
                <Link to="/login?role=admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">🛡️ Admin Portal</Link>
                <Link to="/register"         onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Register</Link>
              </>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}
