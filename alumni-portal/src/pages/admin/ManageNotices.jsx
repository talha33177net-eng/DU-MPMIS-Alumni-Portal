import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Bell } from 'lucide-react';
import { format } from 'date-fns';

const ManageNotices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', category: '', attachmentUrl: '',
    isPinned: false, isPublished: true, expiresAt: ''
  });
  const [editId, setEditId] = useState(null);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notices?per_page=100`);
      if (res.data && Array.isArray(res.data)) setNotices(res.data);
      else setNotices(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleOpenModal = (notice = null) => {
    if (notice) {
      setEditId(notice.id);
      setFormData({
        title: notice.title || '', content: notice.content || '',
        category: notice.category || '', attachmentUrl: notice.attachmentUrl || '',
        isPinned: notice.isPinned || false, isPublished: notice.isPublished !== undefined ? notice.isPublished : true,
        expiresAt: notice.expiresAt ? notice.expiresAt.substring(0, 16) : ''
      });
    } else {
      setEditId(null);
      setFormData({
        title: '', content: '', category: '', attachmentUrl: '',
        isPinned: false, isPublished: true, expiresAt: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        expiresAt: formData.expiresAt ? formData.expiresAt : null
      };

      if (editId) {
        await api.put(`/notices/${editId}`, payload);
        toast.success('Notice updated');
      } else {
        await api.post(`/notices`, payload);
        toast.success('Notice created');
      }
      setShowModal(false);
      fetchNotices();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await api.delete(`/notices/${id}`);
        toast.success('Notice deleted');
        fetchNotices();
      } catch (err) {
        toast.error('Failed to delete notice');
      }
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <Bell size={28} /> Manage Notices
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Broadcast announcements and important updates to members.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Notice
        </button>
      </div>

      <div className="admin-card">
        {loading ? <p style={{color: 'var(--text-muted)'}}>Loading notices...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notices.map(n => (
                <tr key={n.id}>
                  <td>
                    <div style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>
                      {n.isPinned && <span style={{marginRight: '0.5rem'}}>📌</span>}
                      {n.title}
                    </div>
                  </td>
                  <td>
                    <div style={{color: 'var(--text-secondary)'}}>{n.category || 'General'}</div>
                  </td>
                  <td>
                    <div style={{color: 'var(--text-primary)'}}>
                      {n.isPublished 
                        ? (n.publishedAt ? n.publishedAt.substring(0, 10) : 'Published')
                        : 'Draft'}
                    </div>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenModal(n)} style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(n.id)} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{background: 'var(--background-secondary)', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2 style={{marginTop: 0, color: 'var(--accent-color)'}}>{editId ? 'Edit Notice' : 'Create Notice'}</h2>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Content</label>
                <textarea required rows="5" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}}></textarea>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Upload PDF Document</label>
                <input 
                  type="file" 
                  accept="application/pdf,.pdf"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const fd = new FormData();
                      fd.append('file', file);
                      try {
                         const res = await api.post('/website-content/upload?purpose=notices', fd, {
                           headers: { 'Content-Type': 'multipart/form-data' }
                         });
                         setFormData({...formData, attachmentUrl: typeof res.data === 'string' ? res.data : res});
                         toast.success('PDF uploaded successfully');
                      } catch (err) {
                         toast.error('PDF upload failed');
                      }
                    }
                  }} 
                  style={{width: '100%', padding: '0.4rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} 
                />
                {formData.attachmentUrl && <div style={{fontSize:'0.8rem', marginTop:'0.5rem', color:'var(--text-muted)'}}>Current: {formData.attachmentUrl}</div>}
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)'}}>
                  <input type="checkbox" checked={formData.isPinned} onChange={e => setFormData({...formData, isPinned: e.target.checked})} />
                  Pinned
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)'}}>
                  <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} />
                  Published
                </label>
              </div>

              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                <button type="button" onClick={() => setShowModal(false)} style={{padding: '0.5rem 1rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--text-muted)', borderRadius: '4px', cursor: 'pointer'}}>Cancel</button>
                <button type="submit" style={{padding: '0.5rem 1rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageNotices;
