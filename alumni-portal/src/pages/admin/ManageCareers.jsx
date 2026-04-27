import { useState, useEffect } from 'react';
import { Briefcase, Edit, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const ManageCareers = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', organization: '', location: '', jobType: 'Full-time',
    description: '', requirements: '', salary: '', applyEmail: '',
    applyUrl: '', deadline: '', isPublished: true
  });

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      const res = await api.get('/careers/admin-all');
      setCareers(res.items || res.data || []);
    } catch {
      toast.error('Failed to fetch careers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      title: '', organization: '', location: '', jobType: 'Full-time',
      description: '', requirements: '', salary: '', applyEmail: '',
      applyUrl: '', deadline: '', isPublished: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (career) => {
    setEditingId(career.id);
    setFormData({
      title: career.title || '',
      organization: career.organization || '',
      location: career.location || '',
      jobType: career.jobType || 'Full-time',
      description: career.description || '',
      requirements: career.requirements || '',
      salary: career.salary || '',
      applyEmail: career.applyEmail || '',
      applyUrl: career.applyUrl || '',
      deadline: career.deadline ? new Date(career.deadline).toISOString().split('T')[0] : '',
      isPublished: career.isPublished
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job posting forever?')) return;
    try {
      await api.delete(`/careers/${id}`);
      toast.success('Deleted successfully');
      fetchCareers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requirements: formData.requirements || null,
        salary: formData.salary || null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      if (editingId) {
        await api.put(`/careers/${editingId}`, payload);
        toast.success('Job updated successfully');
      } else {
        await api.post('/careers', payload);
        toast.success('Job posted successfully');
      }
      setIsModalOpen(false);
      fetchCareers();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  if (loading) return <div className="p-4" style={{display:'flex',justifyContent:'center'}}><span className="loader-spinner"></span></div>;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <Briefcase size={28} /> Manage Careers
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Post and manage job opportunities for alumni.</p>
        </div>
        <button onClick={handleOpenNew} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Job
        </button>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Job Title</th>
              <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Organization</th>
              <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Deadline</th>
              <th style={{ padding: '1rem', color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {careers.map(job => (
              <tr key={job.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem' }}>
                  <strong>{job.title}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{job.jobType}</div>
                </td>
                <td style={{ padding: '1rem' }}>{job.organization}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${job.isPublished ? 'badge-success' : 'badge-gray'}`}>
                    {job.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => handleOpenEdit(job)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem' }}><Edit size={16}/></button>
                    <button onClick={() => handleDelete(job.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', color: '#ef4444', borderColor: '#ef4444' }}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {careers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No jobs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '100%', overflowY: 'auto', backgroundColor: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{editingId ? 'Edit Job Posting' : 'Add New Job Posting'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Job Title *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-control" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Organization *</label>
                  <input type="text" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className="form-control" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location *</label>
                  <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="form-control" required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Job Type</label>
                  <select value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})} className="form-control">
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Deadline</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="form-control" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Salary Info (Optional)</label>
                <input type="text" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="e.g. ৳80k - ৳100k, or 'Negotiable'" className="form-control" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Job Description *</label>
                <textarea rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-control" required></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Requirements (Optional)</label>
                <textarea rows={3} value={formData.requirements} onChange={e => setFormData({...formData, requirements: e.target.value})} className="form-control"></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                 <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Application Email</label>
                   <input type="email" value={formData.applyEmail} onChange={e => setFormData({...formData, applyEmail: e.target.value})} placeholder="Email to send resumes to" className="form-control" />
                 </div>
                 <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>External Application URL</label>
                   <input type="url" value={formData.applyUrl} onChange={e => setFormData({...formData, applyUrl: e.target.value})} placeholder="https://careers.company.com/job" className="form-control" />
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                <input type="checkbox" id="isPublished" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} style={{ width: '1.2rem', height: '1.2rem' }} />
                <label htmlFor="isPublished" style={{ fontWeight: 600, cursor: 'pointer' }}>Publish immediately (Visible to public)</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Post Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageCareers;
