import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createDonation } from '../../api';

const initialForm = { foodType: '', quantity: '', description: '', preparationTime: '', expiryTime: '', pickupAddress: '', coordinates: [0, 0] };

const Field = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-600 mb-1.5">
      {label} {required && <span className="text-brand-500">*</span>}
    </label>
    {children}
  </div>
);

export default function DonationForm() {
  const [form, setForm]         = useState(initialForm);
  const [loading, setLoading]   = useState(false);
  const [locating, setLocating] = useState(false);
  const navigate                = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setForm((f) => ({ ...f, coordinates: [pos.coords.longitude, pos.coords.latitude] })); toast.success('Location captured!'); setLocating(false); },
      () => { toast.error('Could not get location'); setLocating(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { foodType, quantity, preparationTime, expiryTime, pickupAddress } = form;
    if (!foodType || !quantity || !preparationTime || !expiryTime || !pickupAddress) return toast.error('Please fill all required fields');
    if (new Date(expiryTime) <= new Date(preparationTime)) return toast.error('Expiry must be after preparation time');
    setLoading(true);
    try { await createDonation(form); toast.success('Your donation is live! NGOs nearby can now see it 🎉'); navigate('/donor/dashboard'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to create donation'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button onClick={() => navigate('/donor/dashboard')} className="btn-ghost text-sm mb-4 -ml-2">← Back to Dashboard</button>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Share Some Food</h1>
        <p className="text-slate-500 mt-1">Tell us about what you'd like to donate — we'll find the right NGO nearby</p>
      </div>

      <div className="card shadow-card space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Food Type" required>
              <input name="foodType" value={form.foodType} onChange={handleChange}
                placeholder="e.g. Rice & Dal, Biryani, Sandwiches" className="input-field" required />
            </Field>
            <Field label="Quantity" required>
              <input name="quantity" value={form.quantity} onChange={handleChange}
                placeholder="e.g. 5 kg, 20 plates, 2 trays" className="input-field" required />
            </Field>
          </div>

          <Field label="Description">
            <textarea name="description" value={form.description} onChange={handleChange}
              placeholder="Anything helpful — allergies, packaging, freshness..." rows={3} className="input-field resize-none" />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Preparation Time" required>
              <input type="datetime-local" name="preparationTime" value={form.preparationTime} onChange={handleChange} className="input-field" required />
            </Field>
            <Field label="Expiry Time" required>
              <input type="datetime-local" name="expiryTime" value={form.expiryTime} onChange={handleChange} className="input-field" required />
            </Field>
          </div>

          <Field label="Pickup Address" required>
            <input name="pickupAddress" value={form.pickupAddress} onChange={handleChange}
              placeholder="Full address where the NGO can pick up" className="input-field" required />
          </Field>

          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200">
            <button type="button" onClick={getLocation} disabled={locating} className="btn-secondary text-sm py-2">
              {locating ? '⏳ Getting...' : '📍 Use My Location'}
            </button>
            {form.coordinates[0] !== 0 && (
              <span className="text-sm text-brand-600 font-semibold">
                ✓ Location set ({form.coordinates[1].toFixed(4)}, {form.coordinates[0].toFixed(4)})
              </span>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/donor/dashboard')} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><span className="spinner-sm" />Listing your donation...</> : 'List My Donation 🍽️'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
