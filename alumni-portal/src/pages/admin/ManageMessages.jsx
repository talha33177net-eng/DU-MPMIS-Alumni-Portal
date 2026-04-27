import { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle, MailOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const ManageMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const result = await api.get('/contact');
      // Extract from Pagination logic
      setMessages(result.items || result.data || []);
    } catch (err) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      toast.success('Marked as read');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await api.delete(`/contact/${id}`);
      toast.success('Message deleted');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="p-4" style={{display:'flex',justifyContent:'center'}}><span className="loader-spinner"></span></div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <Mail size={28} /> Manage Messages Inbox
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>Review and respond to messages submitted via the public Contact Us page.</p>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
             <MailOpen size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
             <h3>Inbox is empty</h3>
             <p>No contact messages have been received yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: msg.isRead ? 'var(--bg-secondary)' : '#fff', position: 'relative' }}>
                 {!msg.isRead && <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => markRead(msg.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14}/> Mark Read</button>
                 </div>}
                 <button onClick={() => deleteMessage(msg.id)} title="Delete Message" style={{ position: 'absolute', top: '1.5rem', right: msg.isRead ? '1.5rem' : '8.5rem', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}><Trash2 size={18}/></button>

                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                   {msg.isRead ? <MailOpen size={18} style={{ color: 'var(--text-muted)' }} /> : <Mail size={18} style={{ color: 'var(--accent-color)' }} />}
                   <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: msg.isRead ? 500 : 700, color: 'var(--text-primary)' }}>{msg.subject || 'No Subject'}</h3>
                 </div>
                 <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>From: <strong style={{color:'var(--text-primary)'}}>{msg.name}</strong> ({msg.email}) {msg.phone && `| ${msg.phone}`}</p>
                 <div style={{ background: '#f8fafc', padding: '1.2rem', borderRadius: '6px', whiteSpace: 'pre-wrap', color: '#334155', borderLeft: '3px solid var(--border-color)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                   {msg.message}
                 </div>
                 <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Submitted: {new Date(msg.submittedAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default ManageMessages;
