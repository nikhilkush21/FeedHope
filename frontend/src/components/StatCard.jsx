export default function StatCard({ label, value, icon, color = 'green' }) {
  const colors = {
    green:   'bg-brand-50  dark:bg-brand-900/30  text-brand-600  dark:text-brand-400  ring-brand-200  dark:ring-brand-800',
    blue:    'bg-blue-50   dark:bg-blue-900/30   text-blue-600   dark:text-blue-400   ring-blue-200   dark:ring-blue-800',
    yellow:  'bg-amber-50  dark:bg-amber-900/30  text-amber-600  dark:text-amber-400  ring-amber-200  dark:ring-amber-800',
    orange:  'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 ring-orange-200 dark:ring-orange-800',
    purple:  'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 ring-purple-200 dark:ring-purple-800',
    red:     'bg-red-50    dark:bg-red-900/30    text-red-600    dark:text-red-400    ring-red-200    dark:ring-red-800',
    primary: 'bg-brand-50  dark:bg-brand-900/30  text-brand-600  dark:text-brand-400  ring-brand-200  dark:ring-brand-800',
  };
  return (
    <div className="card flex items-center gap-4 hover:border-brand-200 dark:hover:border-brand-700 transition-colors">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ring-1 flex-shrink-0 ${colors[color] || colors.green}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
