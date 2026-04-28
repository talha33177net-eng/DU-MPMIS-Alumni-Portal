import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, FileText, X } from 'lucide-react';
import { format } from 'date-fns';

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', content: '', coverImage: '', isPublished: true
  });
  const [editId, setEditId] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/blogs?per_page=100`);
      if (res.data && Array.isArray(res.data)) setBlogs(res.data);
      else setBlogs(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenModal = (blog = null) => {
    if (blog) {
      setEditId(blog.id);
      setFormData({
        title: blog.title || '', content: blog.content || '',
        coverImage: blog.coverImage || '', isPublished: blog.isPublished
      });
    } else {
      setEditId(null);
      setFormData({
        title: '', content: '', coverImage: '', isPublished: true
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      setUploading(true);
      const res = await api.post('/blogs/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData({...formData, coverImage: res.data?.data || res.data?.path || res.data || res});
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/blogs/${editId}`, formData);
        toast.success('Blog updated');
      } else {
        await api.post(`/blogs`, formData);
        toast.success('Blog created');
      }
      setShowModal(false);
      fetchBlogs();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await api.delete(`/blogs/${id}`);
        toast.success('Blog deleted');
        fetchBlogs();
      } catch (err) {
        toast.error('Failed to delete blog');
      }
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <FileText size={28} /> Manage Blogs
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Write and publish blog posts to the alumni community.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Blog
        </button>
      </div>

      <div className="admin-card">
        {loading ? <p style={{color: 'var(--text-muted)'}}>Loading blogs...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title / Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>{b.title}</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{b.category} • {b.viewCount} views</div>
                  </td>
                  <td>
                    <div style={{color: 'var(--text-primary)'}}>{b.authorName}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{b.publishedAt ? format(new Date(b.publishedAt), 'PP') : 'Draft'}</div>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                      background: b.isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: b.isPublished ? '#10b981' : '#f59e0b'
                    }}>
                      {b.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenModal(b)} style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(b.id)} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}>
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
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '750px', maxHeight: '100%', overflowY: 'auto', backgroundColor: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--surface-color)', zIndex: 10 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{editId ? 'Edit Blog Post' : 'Create Blog Post'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-control" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Content (HTML or Markdown)</label>
                <textarea rows="10" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="form-control" style={{ fontFamily: 'monospace' }}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cover Image Upload</label>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="form-control" />
                {uploading && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Uploading...</div>}
                {formData.coverImage && <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginTop: '0.5rem' }}>✓ Image selected: {formData.coverImage.split('/').pop()}</div>}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} style={{ width: '1.1rem', height: '1.1rem' }} />
                  Publish immediately
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Publish Blog'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlogs;
