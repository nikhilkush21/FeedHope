import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useCountUp from '../hooks/useCountUp';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const features = [
  { icon: '🍽️', title: 'Share Your Food',   desc: 'Got leftovers? List them in under 2 minutes. Whether you\'re a home cook, restaurant, or event organizer — every meal counts.' },
  { icon: '🤝', title: 'Trusted NGOs',       desc: 'Every NGO on FeedHope is personally verified by our team. Your food goes to people who truly need it.' },
  { icon: '📍', title: 'Right Around You',   desc: 'We match your donation with the nearest NGO automatically, so food gets picked up fast — before it goes to waste.' },
  { icon: '💚', title: 'See Your Impact',    desc: 'Watch your donation go from listed to collected in real time. You\'ll know exactly who you helped and when.' },
];

const stats = [
  { value: 1000,  suffix: '+', label: 'Meals Shared',   icon: '🍱' },
  { value: 500,   suffix: '+', label: 'Caring Donors',  icon: '👨‍🍳' },
  { value: 120,   suffix: '+', label: 'Partner NGOs',   icon: '🤝' },
  { value: 50,    suffix: '+', label: 'Cities Reached', icon: '🌆' },
];

const steps = [
  { step: '01', title: 'Join Us',        desc: 'Create your free account as a Donor or NGO — takes less than 2 minutes.' },
  { step: '02', title: 'List or Browse', desc: 'Donors post their surplus food. NGOs browse what\'s available nearby.' },
  { step: '03', title: 'Connect',        desc: 'An NGO sends a pickup request. The donor reviews and approves it.' },
  { step: '04', title: 'Feed Someone',   desc: 'The NGO collects the food and delivers it to people who need it most.' },
];

const impactCards = [
  {
    img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80',
    tag: 'Community Kitchens',
    title: 'Hot Meals for Families in Need',
    desc: 'Every evening, local restaurants and home cooks list their surplus on FeedHope. Within hours, a verified NGO picks it up and serves it to families who went to bed hungry the night before.',
  },
  {
    img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
    tag: 'Zero Food Waste',
    title: 'Your Leftovers, Their Lifeline',
    desc: 'Weddings, corporate events, and birthday parties leave behind mountains of untouched food. FeedHope turns what would\'ve been thrown away into someone\'s most important meal of the day.',
  },
  {
    img: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=600&q=80',
    tag: 'Verified Network',
    title: 'People You Can Trust',
    desc: 'We personally verify every NGO before they can receive donations. So when you share your food on FeedHope, you can rest easy knowing it\'s in good hands — and going to the right people.',
  },
];

function StatCounter({ value, suffix, label, icon }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center py-5 px-3 shadow-soft hover:border-brand-200 dark:hover:border-brand-700 hover:shadow-card transition-all">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{count.toLocaleString()}{suffix}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-100 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <motion.div
          className="relative max-w-5xl mx-auto px-4 py-24 text-center"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeIn} className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse-slow" />
            Fighting Food Waste Since 2024
          </motion.div>

          <motion.h1 variants={fadeIn} className="text-5xl sm:text-7xl font-extrabold text-slate-900 dark:text-slate-50 mb-6 leading-tight tracking-tight">
            Good Food.<br />
            <span className="text-brand-500">Good People.</span><br />
            No Waste.
          </motion.h1>

          <motion.p variants={fadeIn} className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Someone near you has more food than they need. Someone else has none.
            FeedHope brings them together — simply, quickly, and with care.
          </motion.p>

          <motion.div variants={fadeIn} className="flex gap-3 justify-center flex-wrap">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'ngo' ? '/ngo/dashboard' : '/donor/dashboard'}
                className="btn-primary text-base py-3 px-8">Go to My Dashboard →</Link>
            ) : (
              <>
                <Link to="/login?role=donor" className="btn-primary text-base py-3 px-6">🍽️ I Want to Donate</Link>
                <Link to="/login?role=ngo"   className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-sm">🤝 We're an NGO</Link>
              </>
            )}
          </motion.div>

          {!user && (
            <motion.p variants={fadeIn} className="mt-4 text-slate-400 dark:text-slate-500 text-sm">
              New here?{' '}
              <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold transition-colors">Create your free account →</Link>
            </motion.p>
          )}

          <motion.div variants={fadeIn} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((s) => <StatCounter key={s.label} {...s} />)}
          </motion.div>
        </motion.div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">It's Simple</span>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">How It Works</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm max-w-md mx-auto">From your kitchen to someone's plate — here's how FeedHope makes it happen.</p>
          </motion.div>
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            {steps.map((s, i) => (
              <motion.div key={s.step} variants={fadeUp} className="card-hover group relative">
                <div className="text-5xl font-black text-brand-300 dark:text-brand-700 group-hover:text-brand-500 transition-colors mb-3">{s.step}</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && <div className="hidden lg:block absolute top-8 -right-3 text-slate-300 dark:text-slate-600 text-xl">→</div>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Why FeedHope</span>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Built Around People</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm max-w-md mx-auto">We built FeedHope to be as easy as possible — because when food is going to waste, every minute matters.</p>
          </motion.div>
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.2 }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="card group hover:border-brand-300 hover:shadow-card transition-all duration-300"
              >
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-2xl mb-4 group-hover:bg-brand-100 transition-colors">{f.icon}</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Impact Stories ── */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3">Real Stories</span>
            <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100">Food That Found a Home</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto text-sm leading-relaxed">
              Behind every donation is a real person who chose to care. Here's what that looks like in practice.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.15 }}
          >
            {impactCards.map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-soft hover:shadow-card hover:border-brand-200 transition-all duration-300 group"
              >
                <div className="overflow-hidden h-44">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <span className="inline-block bg-brand-50 dark:bg-brand-300/30 text-brand-700 dark:text-brand-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-3">{card.tag}</span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-800 text-base mb-2">{card.title}</h3>
                  <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 bg-brand-500 rounded-2xl px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div>
              <p className="text-white font-bold text-lg">You could be part of this.</p>
              <p className="text-brand-100 text-sm mt-0.5">It takes 2 minutes to sign up and make someone's day.</p>
            </div>
            {!user && (
              <div className="flex gap-3 flex-shrink-0">
                <Link to="/register" className="bg-white text-brand-600 hover:bg-brand-50 font-bold py-2.5 px-6 rounded-xl transition-all text-sm">Join for Free</Link>
                <Link to="/login"    className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-6 rounded-xl border border-brand-400 transition-all text-sm">Sign In</Link>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 dark:bg-slate-950 py-8 px-4 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center text-xs">🌿</div>
                <span className="font-extrabold text-white">Feed<span className="text-brand-400">Hope</span></span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">Bridging food surplus and hunger — one meal at a time.</p>
              <p className="text-slate-500 text-xs">1786 Fifth Street, Berkeley, CA 94710</p>
              <p className="text-slate-500 text-xs">
                📞 <a href="tel:5108457382" className="hover:text-brand-400 transition-colors">510-845-7382</a>
                <span className="mx-1.5 text-slate-700">·</span>
                📠 510-809-3364
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Quick Links</p>
              <ul className="space-y-1.5">
                {[['/', 'Home'], ['/register', 'Register'], ['/login', 'Login']].map(([to, label]) => (
                  <li key={to}><Link to={to} className="text-slate-500 hover:text-brand-400 text-xs transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-slate-400 font-semibold text-xs uppercase tracking-widest mb-3">Join As</p>
              <ul className="space-y-1.5">
                {[['/login?role=donor', 'Food Donor'], ['/login?role=ngo', 'NGO Partner'], ['/login?role=admin', 'Admin']].map(([to, label]) => (
                  <li key={to}><Link to={to} className="text-slate-500 hover:text-brand-400 text-xs transition-colors">{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-1.5">
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} FeedHope Foundation. All rights reserved.</p>
            <p className="text-slate-600 text-xs">501(c)(3) Nonprofit · Tax ID: 38-2231279</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
