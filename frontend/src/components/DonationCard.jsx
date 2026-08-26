import { StatusBadge, formatDateTime } from '../utils/helpers.jsx';

export default function DonationCard({ donation, actions }) {
  return (
    <div className="card hover:border-brand-300 hover:shadow-card transition-all duration-300 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{donation.foodType}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Qty: <span className="text-slate-700 dark:text-slate-300 font-medium">{donation.quantity}</span></p>
        </div>
        <StatusBadge status={donation.status} />
      </div>

      {donation.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic border-l-2 border-brand-300 pl-3 bg-brand-50 dark:bg-brand-900/20 py-1.5 rounded-r-lg">"{donation.description}"</p>
      )}

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="text-base">📍</span>
          <span className="truncate">{donation.pickupAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="text-base">🕐</span>
          <span>Prepared: {formatDateTime(donation.preparationTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="text-base">⏰</span>
          <span>Expires: {formatDateTime(donation.expiryTime)}</span>
        </div>
        {donation.donor && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="text-base">👤</span>
            <span>{donation.donor.name} — {donation.donor.phone || donation.donor.email}</span>
          </div>
        )}
      </div>

      {actions && <div className="flex gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">{actions}</div>}
    </div>
  );
}
