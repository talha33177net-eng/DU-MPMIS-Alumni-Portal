import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Check, Users, X } from 'lucide-react';

const ManageMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberTypeFilter, setMemberTypeFilter] = useState('General'); // 'LifeTime' or 'General' or 'InMemoriam'
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', memberType: 'General', studentId: '', homeDistrictOrCity: '',
    nationality: '', bloodGroup: '', maritalStatus: '', spouseName: '', dateOfBirth: '', gender: '',
    batch: '', passingYear: '', currentDesignation: '', currentOrganization: '', workCity: '',
    facebookUrl: '', linkedInUrl: '', dateOfDeath: '', bio: '', profilePhoto: '', isActive: true, sortOrder: 0
  });
  const [editId, setEditId] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(memberTypeFilter === 'Pending' ? `/members/pending?per_page=100` : `/members/${memberTypeFilter}?per_page=100`);
      if (res.data && Array.isArray(res.data)) setMembers(res.data);
      else setMembers(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error(`Failed to load ${memberTypeFilter} members`);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [memberTypeFilter]);

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditId(member.id);
      setFormData({
        fullName: member.fullName || '', phone: member.phone || '', email: member.email || '',
        memberType: member.memberType || 'General', studentId: member.studentId || '', homeDistrictOrCity: member.homeDistrictOrCity || '',
        nationality: member.nationality || '', bloodGroup: member.bloodGroup || '', maritalStatus: member.maritalStatus || '', 
        spouseName: member.spouseName || '', dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split('T')[0] : '', gender: member.gender || '',
        batch: member.batch || '', passingYear: member.passingYear || '', currentDesignation: member.currentDesignation || '', 
        currentOrganization: member.currentOrganization || '', workCity: member.workCity || '',
        facebookUrl: member.facebookUrl || '', linkedInUrl: member.linkedInUrl || '', dateOfDeath: member.dateOfDeath ? member.dateOfDeath.split('T')[0] : '', bio: member.bio || '',
        profilePhoto: member.profilePhoto || '', isActive: member.isActive !== undefined ? member.isActive : true, sortOrder: member.sortOrder || 0
      });
    } else {
      setEditId(null);
      setFormData({
        fullName: '', phone: '', email: '', memberType: memberTypeFilter, studentId: '', homeDistrictOrCity: '',
        nationality: '', bloodGroup: '', maritalStatus: '', spouseName: '', dateOfBirth: '', gender: '',
        batch: '', passingYear: '', currentDesignation: '', currentOrganization: '', workCity: '',
        facebookUrl: '', linkedInUrl: '', dateOfDeath: '', profilePhoto: '', isActive: true, sortOrder: 0
      });
    }
    setShowModal(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formDataFile = new FormData();
    formDataFile.append('file', file);
    
    try {
      const loadingToast = toast.loading('Uploading photo...');
      const res = await api.post('/website-content/upload?purpose=members', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Photo uploaded', { id: loadingToast });
      setFormData(prev => ({...prev, profilePhoto: typeof res === 'string' ? res : (res?.data || res)}));
    } catch (err) {
      toast.error('Failed to upload photo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Fix empty date deserialization block in API
    const payload = { ...formData };
    if (!payload.dateOfBirth) payload.dateOfBirth = null;
    if (!payload.dateOfDeath) payload.dateOfDeath = null;
    
    try {
      if (editId) {
        await api.put(`/members/${editId}`, payload);
        toast.success('Member updated');
      } else {
        await api.post(`/members`, payload);
        toast.success('Member created');
      }
      setShowModal(false);
      fetchMembers();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this member from the directory?')) {
      try {
        await api.delete(`/members/${id}`);
        toast.success('Member deleted');
        fetchMembers();
      } catch (err) {
        toast.error('Failed to delete member');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/members/${id}/approve`);
      toast.success('Member application approved');
      fetchMembers();
    } catch (err) {
      toast.error('Failed to approve member');
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <Users size={28} /> Manage Members
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Approve and manage complete alumni member records.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New Member
        </button>
      </div>

      <div style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap'}}>
        <button 
          onClick={() => setMemberTypeFilter('General')}
          style={{padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer', background: memberTypeFilter === 'General' ? 'var(--accent-color)' : 'var(--surface-color)', color: memberTypeFilter === 'General' ? 'white' : 'var(--text-muted)'}}
        >
          General Members
        </button>
        <button 
          onClick={() => setMemberTypeFilter('LifeTime')}
          style={{padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer', background: memberTypeFilter === 'LifeTime' ? 'var(--accent-color)' : 'var(--surface-color)', color: memberTypeFilter === 'LifeTime' ? 'white' : 'var(--text-muted)'}}
        >
          Life Members
        </button>
        <button 
          onClick={() => setMemberTypeFilter('InMemoriam')}
          style={{padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer', background: memberTypeFilter === 'InMemoriam' ? 'var(--accent-color)' : 'var(--surface-color)', color: memberTypeFilter === 'InMemoriam' ? 'white' : 'var(--text-muted)'}}
        >
          In Memoriam
        </button>
        <button 
          onClick={() => setMemberTypeFilter('Pending')}
          style={{padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer', background: memberTypeFilter === 'Pending' ? 'var(--accent-color)' : 'var(--surface-color)', color: memberTypeFilter === 'Pending' ? 'white' : 'var(--text-muted)'}}
        >
          Pending Applications
        </button>
      </div>

      <div className="admin-card">
        {loading ? <p style={{color: 'var(--text-muted)'}}>Loading directory...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Professional Info</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{fontWeight: 'bold', color: 'var(--text-primary)'}}>{m.fullName}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Batch: {m.batch || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{color: 'var(--text-primary)', fontSize: '0.9rem'}}>{m.currentDesignation || 'N/A'}</div>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{m.currentOrganization || ''}</div>
                  </td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                      background: m.memberType === 'LifeTime' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: m.memberType === 'LifeTime' ? '#3b82f6' : '#10b981'
                    }}>
                      {m.memberType}
                    </span>
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      {m.status === 'Pending' && (
                        <button onClick={() => handleApprove(m.id)} style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}} title="Approve">
                          <Check size={16} />
                        </button>
                      )}
                      <button onClick={() => handleOpenModal(m)} style={{background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(m.id)} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                    No {memberTypeFilter} members found in the directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '860px', maxHeight: '100%', overflowY: 'auto', backgroundColor: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--surface-color)', zIndex: 10 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{editId ? 'Edit Member' : 'Add New Member'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Profile Photo */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Profile Photo</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {formData.profilePhoto && (
                    <img loading="lazy" src={`${import.meta.env.PROD ? '' : 'http://localhost:5001'}${formData.profilePhoto}`} alt="Profile" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="form-control" />
                </div>
              </div>

              {/* Basic Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name *</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="form-control" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Member Type *</label>
                  <select required value={formData.memberType} onChange={e => setFormData({...formData, memberType: e.target.value})} className="form-control">
                    <option value="General">General</option>
                    <option value="LifeTime">LifeTime</option>
                    <option value="InMemoriam">In Memoriam</option>
                  </select>
                </div>
              </div>

              {formData.memberType !== 'InMemoriam' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Student ID</label>
                      <input type="text" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} className="form-control" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Home District/City</label>
                      <input type="text" value={formData.homeDistrictOrCity} onChange={e => setFormData({...formData, homeDistrictOrCity: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nationality</label>
                      <input type="text" value={formData.nationality} onChange={e => setFormData({...formData, nationality: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Blood Group</label>
                      <select value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className="form-control">
                        <option value="">Select...</option>
                        <option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option>
                        <option value="O+">O+</option><option value="O-">O-</option>
                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Marital Status</label>
                      <select value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})} className="form-control">
                        <option value="">Select...</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Spouse Name</label>
                      <input type="text" value={formData.spouseName} onChange={e => setFormData({...formData, spouseName: e.target.value})} className="form-control" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date of Birth</label>
                      <input type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Gender</label>
                      <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="form-control">
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Admission Session (Batch)</label>
                  <input type="text" value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} className="form-control" />
                </div>
                {formData.memberType !== 'InMemoriam' ? (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>MA/MSS Year</label>
                    <input type="text" value={formData.passingYear} onChange={e => setFormData({...formData, passingYear: e.target.value})} className="form-control" />
                  </div>
                ) : <div />}
              </div>

              {formData.memberType !== 'InMemoriam' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Organization Name</label>
                      <input type="text" value={formData.currentOrganization} onChange={e => setFormData({...formData, currentOrganization: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Designation</label>
                      <input type="text" value={formData.currentDesignation} onChange={e => setFormData({...formData, currentDesignation: e.target.value})} className="form-control" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Work City / Address</label>
                      <input type="text" value={formData.workCity} onChange={e => setFormData({...formData, workCity: e.target.value})} className="form-control" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Facebook Link</label>
                      <input type="text" value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} className="form-control" />
                    </div>
                  </div>
                </>
              )}

              {formData.memberType === 'InMemoriam' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description / Bio</label>
                    <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={3} className="form-control" />
                  </div>
                  <div style={{ maxWidth: '240px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--danger)' }}>Date of Death</label>
                    <input type="date" value={formData.dateOfDeath} onChange={e => setFormData({...formData, dateOfDeath: e.target.value})} className="form-control" />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} style={{ width: '1.1rem', height: '1.1rem' }} />
                  Active / Show in Directory
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMembers;

