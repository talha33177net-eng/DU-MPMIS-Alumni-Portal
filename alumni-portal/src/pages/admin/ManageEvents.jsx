import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', venue: '', eventDate: '',
    registrationDeadline: '', isRegistrationOpen: true, maxAttendees: '', registrationFee: 0,
    status: 'Upcoming', isPublished: true, coverImage: ''
  });
  const [editId, setEditId] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetches published events. Backend might need update to return unpublished to admins.
      const res = await api.get(`/events?per_page=100`);
      if (res.data && Array.isArray(res.data)) setEvents(res.data);
      else setEvents(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditId(event.id);
      setFormData({
        title: event.title, description: event.description, venue: event.venue,
        eventDate: event.eventDate.substring(0,16), 
        registrationDeadline: event.registrationDeadline ? event.registrationDeadline.substring(0,16) : '',
        isRegistrationOpen: event.isRegistrationOpen, registrationFee: event.registrationFee || 0,
        maxAttendees: event.maxAttendees || '',
        status: event.status, isPublished: event.isPublished, coverImage: event.coverImage || ''
      });
    } else {
      setEditId(null);
      setFormData({
        title: '', description: '', venue: '', eventDate: '',
        registrationDeadline: '', isRegistrationOpen: true, maxAttendees: '', registrationFee: 0,
        status: 'Upcoming', isPublished: true, coverImage: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
        registrationFee: formData.registrationFee ? parseFloat(formData.registrationFee) : 0,
        registrationDeadline: formData.registrationDeadline || null
      };

      if (editId) {
        await api.put(`/events/${editId}`, payload);
        toast.success('Event updated');
      } else {
        await api.post(`/events`, payload);
        toast.success('Event created');
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        toast.success('Event deleted');
        fetchEvents();
      } catch (err) {
        toast.error(err.message || 'Failed to delete');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      toast.loading('Uploading image...', { id: 'imgUpload' });
      const res = await api.post('/events/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = res.data || res;
      setFormData(prev => ({ ...prev, coverImage: imageUrl }));
      toast.success('Image uploaded', { id: 'imgUpload' });
    } catch (err) {
      toast.error('Image upload failed', { id: 'imgUpload' });
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <Calendar size={28} /> Manage Events
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Plan and manage upcoming DU MPMIS alumni gatherings.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Event
        </button>
      </div>

      <div className="admin-card">
        {loading ? <p style={{color: 'var(--text-muted)'}}>Loading events...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date & Venue</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td>
                    <div style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>{ev.title}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Registrations: {ev.registrationCount}/{ev.maxAttendees || 'âˆž'}</div>
                  </td>
                  <td>
                    <div style={{color: 'var(--text-primary)'}}>{format(new Date(ev.eventDate), 'PPp')}</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{ev.venue}</div>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                      background: ev.isPublished ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: ev.isPublished ? '#10b981' : '#f59e0b'
                    }}>
                      {ev.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => handleOpenModal(ev)} style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}} title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(ev.id)} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}} title="Delete">
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
          <div className="card" style={{ width: '100%', maxWidth: '800px', maxHeight: '100%', overflowY: 'auto', backgroundColor: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--surface-color)', zIndex: 10 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{editId ? 'Edit Event' : 'Create Event'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-control" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description *</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-control"></textarea>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Cover Image</label>
                {formData.coverImage && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <img loading="lazy" src={`${import.meta.env.PROD ? '' : 'http://localhost:5001'}${formData.coverImage}`} alt="Cover preview" style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="form-control" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Venue *</label>
                  <input required type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} className="form-control" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Fee (৳)</label>
                  <input type="number" min="0" step="1" value={formData.registrationFee} onChange={e => setFormData({...formData, registrationFee: e.target.value})} placeholder="0 = Free" className="form-control" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Event Date *</label>
                  <input required type="datetime-local" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="form-control" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Registration Deadline</label>
                  <input type="datetime-local" value={formData.registrationDeadline} onChange={e => setFormData({...formData, registrationDeadline: e.target.value})} className="form-control" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="form-control">
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Max Attendees</label>
                  <input type="number" value={formData.maxAttendees} onChange={e => setFormData({...formData, maxAttendees: e.target.value})} placeholder="Leave blank for unlimited" className="form-control" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isRegistrationOpen} onChange={e => setFormData({...formData, isRegistrationOpen: e.target.checked})} style={{ width: '1.1rem', height: '1.1rem' }} />
                  Registration Open
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} style={{ width: '1.1rem', height: '1.1rem' }} />
                  Publish immediately
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Create Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;

