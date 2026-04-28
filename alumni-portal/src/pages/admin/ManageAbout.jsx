import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, Target, File, Users as UsersIcon, Edit, Trash2, Plus, Upload, X } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ManageAbout = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  
  // States for WebsiteContent (History, Mission, Constitution)
  const [websiteContent, setWebsiteContent] = useState({
    historyContent: '',
    missionText: '',
    visionText: '',
    constitutionFileUrl: '',
    constitutionContent: '',
    aboutImage: ''
  });
  const [wcLoading, setWcLoading] = useState(true);
  const [wcSaving, setWcSaving] = useState(false);

  // States for EC Members
  const [committeeMembers, setCommitteeMembers] = useState([]);
  const [cmLoading, setCmLoading] = useState(true);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  const initialMemberState = {
    fullName: '', position: '', phone: '', email: '', batch: '', 
    currentDesignation: '', currentOrganization: '', facebookUrl: '', 
    linkedInUrl: '', committeeYear: '', sortOrder: 0, isActive: true
  };
  const [memberForm, setMemberForm] = useState(initialMemberState);
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchWebsiteContent();
    fetchCommitteeMembers();
  }, []);

  const fetchWebsiteContent = async () => {
    try {
      const data = await api.get('/website-content');
      if (data) {
        setWebsiteContent(data);
      }
    } catch (error) {
      toast.error('Failed to fetch website content');
    } finally {
      setWcLoading(false);
    }
  };

  const fetchCommitteeMembers = async () => {
    try {
      const data = await api.get('/committee');
      if (data) {
        setCommitteeMembers(data);
      }
    } catch (error) {
      toast.error('Failed to fetch committee members');
    } finally {
      setCmLoading(false);
    }
  };

  const saveWebsiteContent = async () => {
    setWcSaving(true);
    try {
      const message = await api.post('/website-content', websiteContent);
      toast.success(message || 'Content updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update content');
    } finally {
      setWcSaving(false);
    }
  };

  const uploadConstitution = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF document for the Constitution.');
      return;
    }

    const toastId = toast.loading('Uploading constitution...');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const resultUrl = await api.post('/website-content/upload?purpose=documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setWebsiteContent(prev => ({ ...prev, constitutionFileUrl: resultUrl }));
      toast.success('File uploaded! Remember to click Save Changes.', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to upload file', { id: toastId });
    }
  };

  const uploadAboutImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file. It will be mapped to WebP securely.');
      return;
    }

    const toastId = toast.loading('Uploading & optimizing image...');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const resultUrl = await api.post('/website-content/upload?purpose=about', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setWebsiteContent(prev => ({ ...prev, aboutImage: resultUrl }));
      toast.success('Image optimized and uploaded! Click Save History to apply.', { id: toastId });
    } catch (error) {
      toast.error(error.message || 'Failed to upload image', { id: toastId });
    }
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(editingMember ? 'Updating member...' : 'Creating member...');
    try {
      let memberId;
      if (editingMember) {
        const message = await api.put(`/committee/${editingMember.id}`, memberForm);
        memberId = editingMember.id;
        toast.success(message || 'Member updated successfully', { id: toastId });
      } else {
        const newId = await api.post('/committee', memberForm);
        memberId = newId; // Server returns ID of new member
        toast.success('Member created successfully', { id: toastId });
      }

      // Handle photo upload if a file was selected
      if (photoFile && memberId) {
        const formData = new FormData();
        formData.append('file', photoFile);
        await api.post(`/committee/${memberId}/photo`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowMemberModal(false);
      setEditingMember(null);
      setPhotoFile(null);
      fetchCommitteeMembers();
    } catch (error) {
      toast.error(error.message || 'Transaction failed', { id: toastId });
    }
  };

  const handleMemberDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this committee member?')) return;
    try {
      const message = await api.delete(`/committee/${id}`);
      toast.success(message || 'Member deleted');
      fetchCommitteeMembers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete member');
    }
  };

  const openAddModal = () => {
    setEditingMember(null);
    setMemberForm(initialMemberState);
    setPhotoFile(null);
    setShowMemberModal(true);
  };

  const openEditModal = (member) => {
    setEditingMember(member);
    setMemberForm(member);
    setPhotoFile(null);
    setShowMemberModal(true);
  };

  // Internal Styles
  const tabBtnStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', 
    border: 'none', background: 'transparent', cursor: 'pointer',
    color: isActive ? 'var(--accent-color)' : 'var(--text-muted)',
    borderBottom: isActive ? '2px solid var(--accent-color)' : '2px solid transparent',
    fontWeight: isActive ? 600 : 400, transition: 'all 0.2s', fontSize: '1rem'
  });

  const sectionStyle = {
    background: '#fff', padding: '2rem', borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  };
  
  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', 
    fontFamily: 'inherit', fontSize: '1rem', background: '#f8fafc', marginBottom: '1rem'
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <FileText size={28} /> Manage About Section
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Maintain organizational history, constitution, and leadership records.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <button style={tabBtnStyle(activeTab === 'history')} onClick={() => setActiveTab('history')}>
          <FileText size={18} /> History
        </button>
        <button style={tabBtnStyle(activeTab === 'mission')} onClick={() => setActiveTab('mission')}>
          <Target size={18} /> Mission & Vision
        </button>
        <button style={tabBtnStyle(activeTab === 'constitution')} onClick={() => setActiveTab('constitution')}>
          <File size={18} /> Constitution
        </button>
        <button style={tabBtnStyle(activeTab === 'committee')} onClick={() => setActiveTab('committee')}>
          <UsersIcon size={18} /> EC Members
        </button>
      </div>

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div style={sectionStyle}>
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Association History</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Edit the historical narrative of the DU MPMIS Alumni Association.</p>
          
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Cover Image</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Upload an image banner to represent the history. It will be securely optimized to WebP format.</p>
            {websiteContent.aboutImage && (
              <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
                <img loading="lazy" src={websiteContent.aboutImage.startsWith('http') ? websiteContent.aboutImage : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${websiteContent.aboutImage}`} alt="History Cover" style={{ maxHeight: '200px', borderRadius: '6px', border: '2px solid #cbd5e1' }} />
                <button onClick={() => setWebsiteContent({...websiteContent, aboutImage: ''})} style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Remove image">
                  <X size={14} />
                </button>
              </div>
            )}
            <div>
              <label className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Upload size={16} /> {websiteContent.aboutImage ? 'Change Image' : 'Upload Image'}
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={uploadAboutImage} />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <ReactQuill 
              theme="snow"
              value={websiteContent.historyContent || ''} 
              onChange={(content) => setWebsiteContent({...websiteContent, historyContent: content})}
              style={{ height: '350px', marginBottom: '3.5rem' }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link', 'clean']
                ]
              }}
            />
          </div>
          <button className="btn btn-primary" onClick={saveWebsiteContent} disabled={wcSaving || wcLoading}>
            {wcSaving ? 'Saving...' : 'Save History'}
          </button>
        </div>
      )}

      {/* MISSION & VISION TAB */}
      {activeTab === 'mission' && (
        <div style={sectionStyle}>
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Mission & Vision</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Define the core goals and future trajectory of the association.</p>
          
          <div>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Our Mission</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '120px' }}
              value={websiteContent.missionText || ''}
              onChange={(e) => setWebsiteContent({...websiteContent, missionText: e.target.value})}
              placeholder="To foster a lifelong connection..."
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Our Vision</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '120px' }}
              value={websiteContent.visionText || ''}
              onChange={(e) => setWebsiteContent({...websiteContent, visionText: e.target.value})}
              placeholder="To be the premier alumni networking platform..."
            />
          </div>

          <button className="btn btn-primary" onClick={saveWebsiteContent} disabled={wcSaving || wcLoading}>
            {wcSaving ? 'Saving...' : 'Save Mission & Vision'}
          </button>
        </div>
      )}

      {/* CONSTITUTION TAB */}
      {activeTab === 'constitution' && (
        <div style={sectionStyle}>
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Constitution Document</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Write and format the constitution of the Alumni Association.</p>
          
          <div style={{ marginBottom: '2rem' }}>
            <ReactQuill 
              theme="snow"
              value={websiteContent.constitutionContent || ''} 
              onChange={(content) => setWebsiteContent({...websiteContent, constitutionContent: content})}
              style={{ height: '350px', marginBottom: '3.5rem' }}
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link', 'clean']
                ]
              }}
            />
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary" onClick={saveWebsiteContent} disabled={wcSaving || wcLoading}>
              {wcSaving ? 'Saving...' : 'Save Constitution'}
            </button>
          </div>
        </div>
      )}

      {/* EC MEMBERS TAB */}
      {activeTab === 'committee' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>Executive Committee Members</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Manage the leadership roster displayed on the website.</p>
            </div>
            <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> Add Member
            </button>
          </div>
          
          {cmLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading members...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.9rem' }}>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Photo</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Name</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Position</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Tenure/Year</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Sort</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {committeeMembers.length === 0 && (
                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No executive members found.</td></tr>
                  )}
                  {committeeMembers.map(member => (
                    <tr key={member.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', ':hover': { background: '#f8fafc' } }}>
                      <td style={{ padding: '1rem' }}>
                        {member.photo ? (
                          <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${member.photo}`} alt={member.fullName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><UsersIcon size={20}/></div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 500, color: '#334155' }}>
                        {member.fullName}
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>{member.batch}</div>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{member.position}</td>
                      <td style={{ padding: '1rem', color: '#475569' }}>
                        <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 500 }}>
                          {member.committeeYear}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{member.sortOrder}</td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => openEditModal(member)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '0.5rem' }} title="Edit"><Edit size={18} /></button>
                        <button onClick={() => handleMemberDelete(member.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', marginLeft: '0.5rem' }} title="Delete"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EC MEMBER MODAL */}
      {showMemberModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <h2 style={{ margin: 0, color: '#1e293b' }}>{editingMember ? 'Edit Committee Member' : 'Add Committee Member'}</h2>
              <button onClick={() => setShowMemberModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            </div>
            
            <form onSubmit={handleMemberSubmit} style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Full Name *</label>
                  <input style={inputStyle} required value={memberForm.fullName} onChange={e => setMemberForm({...memberForm, fullName: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Position/Title *</label>
                  <select style={inputStyle} required value={memberForm.position} onChange={e => setMemberForm({...memberForm, position: e.target.value})}>
                    <option value="">-- Select Position --</option>
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="General Secretary">General Secretary</option>
                    <option value="Joint Secretary">Joint Secretary</option>
                    <option value="Organizing Secretary">Organizing Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Office Secretary">Office Secretary</option>
                    <option value="Publication Secretary">Publication Secretary</option>
                    <option value="Communication Secretary">Communication Secretary</option>
                    <option value="Cultural Secretary">Cultural Secretary</option>
                    <option value="Executive Member">Executive Member</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Committee Year (Tenure) *</label>
                  <input style={inputStyle} required value={memberForm.committeeYear || ''} onChange={e => setMemberForm({...memberForm, committeeYear: e.target.value})} placeholder="e.g. 2024-2026" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Batch/Department</label>
                  <input style={inputStyle} value={memberForm.batch || ''} onChange={e => setMemberForm({...memberForm, batch: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Email Address</label>
                  <input type="email" style={inputStyle} value={memberForm.email || ''} onChange={e => setMemberForm({...memberForm, email: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Phone Number</label>
                  <input style={inputStyle} value={memberForm.phone || ''} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Current Designation</label>
                  <input style={inputStyle} value={memberForm.currentDesignation || ''} onChange={e => setMemberForm({...memberForm, currentDesignation: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Current Organization</label>
                  <input style={inputStyle} value={memberForm.currentOrganization || ''} onChange={e => setMemberForm({...memberForm, currentOrganization: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Facebook URL</label>
                  <input style={inputStyle} value={memberForm.facebookUrl || ''} onChange={e => setMemberForm({...memberForm, facebookUrl: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>LinkedIn URL</label>
                  <input style={inputStyle} value={memberForm.linkedInUrl || ''} onChange={e => setMemberForm({...memberForm, linkedInUrl: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Profile Photo (Upload new)</label>
                  <input type="file" style={inputStyle} accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>Sort Priority (Lower is higher up)</label>
                  <input type="number" style={inputStyle} required value={memberForm.sortOrder} onChange={e => setMemberForm({...memberForm, sortOrder: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingMember ? 'Update Member' : 'Publish Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageAbout;

