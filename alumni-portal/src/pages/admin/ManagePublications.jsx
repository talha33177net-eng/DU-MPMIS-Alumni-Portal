import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';

const ManagePublications = () => {
  const [pubType, setPubType] = useState('AGM_Reports');

  const getCategoryTitle = (val) => {
    switch (val) {
      case 'AGM_Reports': return 'AGM Reports';
      case 'Souvenirs': return 'Souvenirs';
      case 'Finance_Reports': return 'Finance Reports';
      default: return 'Publications';
    }
  };

  const categoryTitle = getCategoryTitle(pubType);
  const categoryValue = pubType;
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', category: categoryValue, attachmentUrl: '',
    isPublished: true, publishedAt: ''
  });
  const [editId, setEditId] = useState(null);

  const fetchPublications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/publications?category=${categoryValue}&per_page=100`);
      if (res.data && Array.isArray(res.data)) setPublications(res.data);
      else setPublications(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error(`Failed to load ${categoryTitle}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [categoryValue]);

  const handleOpenModal = (pub = null) => {
    if (pub) {
      setEditId(pub.id);
      setFormData({
        title: pub.title || '', content: pub.content || '',
        category: categoryValue, attachmentUrl: pub.attachmentUrl || '',
        isPublished: pub.isPublished !== undefined ? pub.isPublished : true,
        publishedAt: pub.publishedAt ? pub.publishedAt.substring(0, 16) : ''
      });
    } else {
      setEditId(null);
      setFormData({
        title: '', content: '', category: categoryValue, attachmentUrl: '',
        isPublished: true, publishedAt: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        category: categoryValue,
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : new Date().toISOString()
      };

      if (editId) {
        await api.put(`/publications/${editId}`, payload);
        toast.success(`${categoryTitle} updated`);
      } else {
        await api.post(`/publications`, payload);
        toast.success(`${categoryTitle} created`);
      }
      setShowModal(false);
      fetchPublications();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete this ${categoryTitle}?`)) {
      try {
        await api.delete(`/publications/${id}`);
        toast.success('Document deleted');
        fetchPublications();
      } catch (err) {
        toast.error('Failed to delete document');
      }
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
        <button 
          onClick={() => setPubType('AGM_Reports')}
          style={{padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer', background: pubType === 'AGM_Reports' ? 'var(--accent-color)' : 'var(--surface-color)', color: pubType === 'AGM_Reports' ? 'white' : 'var(--text-muted)'}}
        >
          AGM Reports
        </button>
        <button 
          onClick={() => setPubType('Souvenirs')}
          style={{padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer', background: pubType === 'Souvenirs' ? 'var(--accent-color)' : 'var(--surface-color)', color: pubType === 'Souvenirs' ? 'white' : 'var(--text-muted)'}}
        >
          Souvenirs
        </button>
        <button 
          onClick={() => setPubType('Finance_Reports')}
          style={{padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer', background: pubType === 'Finance_Reports' ? 'var(--accent-color)' : 'var(--surface-color)', color: pubType === 'Finance_Reports' ? 'white' : 'var(--text-muted)'}}
        >
          Finance Reports
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', marginTop: '1.5rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <BookOpen size={28} /> Manage {categoryTitle}
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Upload and organize official DU MPMIS reports and Souvenirs.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Document
        </button>
      </div>

      <div className="admin-card">
        {loading ? <p style={{color: 'var(--text-muted)'}}>Loading {categoryTitle}...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Published</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {publications.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>
                      {p.title}
                    </div>
                  </td>
                  <td>
                    <div style={{color: 'var(--text-primary)'}}>
                      {p.isPublished 
                        ? (p.publishedAt ? p.publishedAt.substring(0, 10) : 'Published')
                        : 'Draft'}
                    </div>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenModal(p)} style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {publications.length === 0 && (
                <tr><td colSpan="3" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>No documents found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{background: 'var(--background-secondary)', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2 style={{marginTop: 0, color: 'var(--accent-color)'}}>{editId ? 'Edit Document' : 'Upload Document'}</h2>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Document Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Upload PDF</label>
                <input 
                  type="file" 
                  accept=".pdf, application/pdf"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const fd = new FormData();
                      fd.append('file', file);
                      try {
                         const res = await api.post('/website-content/upload?purpose=publications', fd, {
                           headers: { 'Content-Type': 'multipart/form-data' }
                         });
                         setFormData({...formData, attachmentUrl: typeof res.data === 'string' ? res.data : res});
                         toast.success('PDF uploaded');
                      } catch (err) {
                         toast.error('File upload failed');
                      }
                    }
                  }} 
                  style={{width: '100%', padding: '0.4rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} 
                />
                {formData.attachmentUrl && <div style={{fontSize:'0.8rem', marginTop:'0.5rem', color:'green'}}><a href={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${formData.attachmentUrl}`} target="_blank" rel="noreferrer" style={{color: '#3b82f6'}}>View Active Attachment</a></div>}
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
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

export default ManagePublications;

