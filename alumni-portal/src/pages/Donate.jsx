import { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';

const Donate = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    donationType: 'General Fund',
    amount: '',
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Stub for actual API call to payment gateway or transaction record
      // await api.post('/transactions', form);
      setTimeout(() => {
        toast.success(`Thank you for your generous donation of ৳${form.amount}!`);
        setForm({ donationType: 'General Fund', amount: '', name: '', email: '', phone: '', message: '' });
        setLoading(false);
      }, 1500);
    } catch (err) {
      toast.error('Failed to process donation. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="section container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Heart size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          Support Our Mission
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Your contributions help DU MPMIS organize events, support alumni in need, and give back to our department.
        </p>
      </div>

      <div className="card" style={{ padding: '3rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Donation Type</label>
              <select 
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
                value={form.donationType}
                onChange={e => setForm({...form, donationType: e.target.value})}
                required
              >
                <option value="General Fund">General Fund</option>
                <option value="Event Sponsorship">Event Sponsorship</option>
                <option value="Scholarship Program">Scholarship Program</option>
                <option value="Welfare Fund">Welfare Fund (For Alumni in Need)</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Amount (BDT)</label>
              <input 
                type="number" 
                min="100"
                placeholder="e.g. 5000"
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Your Name</label>
              <input 
                type="text" 
                placeholder="Full Name"
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Email Address</label>
              <input 
                type="email" 
                placeholder="email@example.com"
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Phone Number</label>
            <input 
              type="tel" 
              placeholder="+880..."
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Message (Optional)</label>
            <textarea 
              rows="4"
              placeholder="Any message to accompany your donation?"
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%', resize: 'vertical' }}
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1.1rem' }} disabled={loading}>
            {loading ? <span className="loader-spinner" style={{width: 20, height: 20, borderWidth: 2}}></span> : `Donate ৳${form.amount || '0'} Securely`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
