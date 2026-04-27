import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import css from './Contact.module.css';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState({ address: '', phone: '', email: '' });

  useEffect(() => {
    api.get('/website-content').then(data => {
      if (data) setContactInfo({ address: data.officeAddress, phone: data.officePhone, email: data.officeEmail });
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section container animate-fade-in">
      <div className={css.wrapper}>
        <div className={css.infoPanel}>
          <h1>Get In Touch</h1>
          <p>Whether you have a question, suggestion, or want to collaborate — we'd love to hear from you.</p>
          
          <div className={css.contactDetails}>
            <div className={css.contactItem}>
              <h3>📍 Address</h3>
              <p>{contactInfo.address}</p>
            </div>
            <div className={css.contactItem}>
              <h3>📞 Phone</h3>
              <p>{contactInfo.phone}</p>
            </div>
            <div className={css.contactItem}>
              <h3>✉️ Email</h3>
              <p>{contactInfo.email}</p>
            </div>
          </div>
        </div>

        <form className={css.contactForm} onSubmit={handleSubmit}>
          <div className={css.formRow}>
            <div className={css.inputGroup}>
              <label>Your Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className={css.inputGroup}>
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
          </div>
          <div className={css.inputGroup}>
            <label>Subject</label>
            <input type="text" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
          </div>
          <div className={css.inputGroup}>
            <label>Message</label>
            <textarea rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} required></textarea>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="loader-spinner" style={{width:20,height:20,borderWidth:2}}></span> : <><Send size={18}/> Send Message</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
