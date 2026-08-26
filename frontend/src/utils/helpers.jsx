export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (date) =>
  date ? new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const isExpired = (date) => date && new Date(date) < new Date();

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`badge-${status}`}>{label}</span>;
};
