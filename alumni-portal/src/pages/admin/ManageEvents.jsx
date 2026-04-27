import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
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
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{background: 'var(--background-secondary)', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2 style={{marginTop: 0, color: 'var(--accent-color)'}}>{editId ? 'Edit Event' : 'Create Event'}</h2>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              
              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} />
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Description</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}}></textarea>
              </div>

              <div>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Cover Image</label>
                {formData.coverImage && (
                   <div style={{marginBottom: '0.5rem'}}>
                     <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${formData.coverImage}`} alt="Cover preview" style={{width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px'}} />
                   </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} />
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <div style={{flex: 2}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Venue</label>
                  <input required type="text" value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} />
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Fee (৳)</label>
                  <input type="number" min="0" step="1" value={formData.registrationFee} onChange={e => setFormData({...formData, registrationFee: e.target.value})} placeholder="0 = Free" style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} />
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Event Date</label>
                  <input required type="datetime-local" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} />
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Registration Deadline</label>
                  <input type="datetime-local" value={formData.registrationDeadline} onChange={e => setFormData({...formData, registrationDeadline: e.target.value})} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} />
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}}>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)'}}>Max Attendees</label>
                  <input type="number" value={formData.maxAttendees} onChange={e => setFormData({...formData, maxAttendees: e.target.value})} placeholder="Leave blank for unlimited" style={{width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px'}} />
                </div>
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)'}}>
                  <input type="checkbox" checked={formData.isRegistrationOpen} onChange={e => setFormData({...formData, isRegistrationOpen: e.target.checked})} />
                  Registration Open
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

export default ManageEvents;

