import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { User, CreditCard, Calendar, Settings, Edit3, Image as ImageIcon, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import css from './Dashboard.module.css';

const Dashboard = () => {
  const { user, loading, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myBlogs, setMyBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);

  // Replaced inline membership form with separate /apply page
  const [hasApplied, setHasApplied] = useState(false);

  // Edit Profile Form State
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    studentId: user?.studentId || '',
    currentDesignation: user?.currentDesignation || '',
    currentOrganization: user?.currentOrganization || '',
    bio: user?.bio || ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto ? `${import.meta.env.PROD ? "" : "http://localhost:5001"}${user.profilePhoto}` : null);

  useEffect(() => {
    if (activeTab === 'blogs' && user) {
      const fetchMyBlogs = async () => {
        setBlogsLoading(true);
        try {
          const res = await api.get('/blogs?per_page=100');
          const allBlogs = res.data?.items || res.data || res || [];
          const myId = user?.user?.id || user?.id || user?.data?.id;
          setMyBlogs(allBlogs.filter(b => b.authorId === myId));
        } catch (error) {
          console.error("Failed to fetch blogs:", error);
        } finally {
          setBlogsLoading(false);
        }
      };
      fetchMyBlogs();
    }
  }, [activeTab, user]);

  if (loading) return <div className="section"><div className="loader-spinner" style={{margin:'0 auto'}}></div></div>;
  if (!user) return <Navigate to="/login" />;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Upload photo if selected
      let photoUrl = user.profilePhoto;
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile); // API endpoint expects IFormFile file
        const uploadRes = await api.post('/auth/me/photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        photoUrl = uploadRes.data || uploadRes; // Extract string URL
      }

      // 2. Update Profile
      const updateData = {
        fullName: form.fullName,
        phone: form.phone,
        studentId: form.studentId,
        currentDesignation: form.currentDesignation,
        currentOrganization: form.currentOrganization,
        bio: form.bio
      };
      await api.put(`/auth/me`, updateData);
      
      // Update global context seamlessly
      if (setUser) {
         setUser({ ...user, ...updateData, profilePhoto: photoUrl });
      }
      
      toast.success('Profile updated successfully!');
      setActiveTab('overview');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Fix empty date deserialization
    const payload = { 
      fullName: user.fullName, email: user.email, memberType: applyType, 
      ...applyForm 
    };
    if (!payload.dateOfBirth) payload.dateOfBirth = null;

    try {
      await api.post('/members/apply', payload);
      toast.success('Application submitted successfully!');
      setHasApplied(true);
      setShowApplyForm(false);
    } catch (err) {
      toast.error('Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section container animate-fade-in">
      <div className={css.header}>
        <div className={css.profileHeader}>
          <div className={css.avatarWrapper}>
            {photoPreview ? (
               <img loading="lazy" src={photoPreview} alt="Profile" className={css.avatar} />
            ) : (
               <div className={css.avatarPlaceholder}><User size={40} /></div>
            )}
            {activeTab === 'edit' && (
               <label className={css.photoUploadBtn}>
                 <ImageIcon size={16}/>
                 <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
               </label>
            )}
          </div>
          <div>
            <h1>
              Welcome, {user.fullName}
            </h1>
            <p className={css.userMeta}>
              <span className={`badge ${user.memberType === 'LifeTime' ? 'badge-warning' : 'badge-gray'}`}>{user.memberType}</span> 
              <span style={{margin: '0 0.5rem'}}>&bull;</span> Batch {user.batch || 'N/A'}
              <span style={{margin: '0 0.5rem'}}>&bull;</span> ID: {user.studentId || 'N/A'}
              <span style={{margin: '0 0.5rem'}}>&bull;</span> <span style={{color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Verified
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className={css.dashboardGrid}>
        
        {/* Sidebar Nav */}
        <div className={css.sidebar}>
          <ul className={css.navMenu}>
            <li className={activeTab === 'overview' ? css.active : ''} onClick={() => setActiveTab('overview')}><User size={18}/> Overview</li>
            <li className={activeTab === 'edit' ? css.active : ''} onClick={() => setActiveTab('edit')}><Edit3 size={18}/> Edit Profile</li>
            <li className={activeTab === 'blogs' ? css.active : ''} onClick={() => setActiveTab('blogs')}><BookOpen size={18}/> My Blogs</li>
            <li className={activeTab === 'membership' ? css.active : ''} onClick={() => setActiveTab('membership')}><CreditCard size={18}/> Membership Status</li>
            <li className={activeTab === 'events' ? css.active : ''} onClick={() => setActiveTab('events')}><Calendar size={18}/> My Events</li>
            <li className={activeTab === 'settings' ? css.active : ''} onClick={() => setActiveTab('settings')}><Settings size={18}/> Settings</li>
          </ul>
        </div>

        {/* Main Content Area */}
        <div className={css.contentArea}>
          
          {activeTab === 'overview' && (
            <div className="card animate-fade-in">
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom:'1rem', marginBottom:'1.5rem'}}>
                Profile Information
              </h2>
              
              <div className="grid grid-2" style={{marginBottom: '1.5rem'}}>
                <div>
                  <label className={css.label}>Email Address</label>
                  <p className={css.value}>{user.email}</p>
                </div>
                <div>
                  <label className={css.label}>Student ID</label>
                  <p className={css.value}>{user.studentId || 'N/A'}</p>
                </div>
                <div>
                  <label className={css.label}>Phone Number</label>
                  <p className={css.value}>{form.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className={css.label}>Current Designation</label>
                  <p className={css.value}>{form.currentDesignation || 'N/A'}</p>
                </div>
                <div>
                  <label className={css.label}>Current Organization</label>
                  <p className={css.value}>{form.currentOrganization || 'N/A'}</p>
                </div>
              </div>
              
              <div style={{marginTop: '2rem'}}>
                <label className={css.label}>Bio</label>
                <p className={css.value}>{form.bio || 'No bio provided.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="card animate-fade-in">
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom:'1rem', marginBottom:'1.5rem'}}>
                Edit Profile
              </h2>
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-2" style={{gap: '1.5rem', marginBottom: '1.5rem'}}>
                  <div>
                    <label className={css.label}>Full Name</label>
                    <input type="text" className={css.input} value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required/>
                  </div>
                  <div>
                    <label className={css.label}>Student ID</label>
                    <input type="text" className={css.input} value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} />
                  </div>
                  <div>
                    <label className={css.label}>Phone Number</label>
                    <input type="tel" className={css.input} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className={css.label}>Designation</label>
                    <input type="text" className={css.input} value={form.currentDesignation} onChange={e => setForm({...form, currentDesignation: e.target.value})} />
                  </div>
                  <div>
                    <label className={css.label}>Organization</label>
                    <input type="text" className={css.input} value={form.currentOrganization} onChange={e => setForm({...form, currentOrganization: e.target.value})} />
                  </div>
                </div>
                <div style={{marginBottom: '1.5rem'}}>
                  <label className={css.label}>Bio / Statement</label>
                  <textarea rows="4" className={css.textarea} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <span className="loader-spinner" style={{width: 20, height: 20, borderWidth: 2}}></span> : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'blogs' && (
            <div className="card animate-fade-in">
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom:'1rem', marginBottom:'1.5rem'}}>
                My Blogs
              </h2>
              {blogsLoading ? (
                 <div style={{display:'flex',justifyContent:'center',padding:'3rem'}}><span className="loader-spinner"></span></div>
              ) : myBlogs.length > 0 ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {myBlogs.map(blog => (
                      <div key={blog.id} style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                           <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{blog.title}</h3>
                           <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                              {new Date(blog.createdAt || blog.publishedAt || new Date()).toLocaleDateString()} &bull; {blog.isPublished ? 'Published' : 'Draft'}
                           </div>
                         </div>
                         <a href={`/blog/${blog.slug}`} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>Read Post</a>
                      </div>
                   ))}
                 </div>
              ) : (
                <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
                  <BookOpen size={48} style={{margin: '0 auto 1rem', opacity: 0.3}} />
                  <p>You haven't written any blogs yet.</p>
                  <button className="btn btn-outline" style={{marginTop: '1rem'}} onClick={() => window.location.href='/blog'}>Write a Blog</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'membership' && (
            <div className="card animate-fade-in">
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom:'1rem', marginBottom:'1.5rem'}}>
                Membership Status
              </h2>
              
              {user.memberStatus === 'Approved' && (user.memberType === 'LifeTime' || user.memberType === 'General') ? (
                <div style={{textAlign: 'center', padding: '3rem'}}>
                  <CreditCard size={48} style={{margin: '0 auto 1rem', color: 'var(--accent-color)'}} />
                  <h3 style={{marginBottom:'0.5rem'}}>Current Plan: {user.memberType}</h3>
                  <p style={{color: 'var(--text-muted)'}}>Your membership is currently active and in good standing.</p>
                </div>
              ) : hasApplied || user.memberStatus === 'Pending' ? (
                <div style={{textAlign: 'center', padding: '3rem'}}>
                  <CreditCard size={48} style={{margin: '0 auto 1rem', color: '#f59e0b'}} />
                  <h3 style={{marginBottom:'0.5rem', color: '#f59e0b'}}>Application Pending</h3>
                  <p style={{color: 'var(--text-muted)'}}>Your membership application is currently under review by the administration.</p>
                </div>
              ) : (
                <div style={{textAlign: 'center', padding: '3rem'}}>
                  <CreditCard size={48} style={{margin: '0 auto 1rem', color: 'var(--text-muted)'}} />
                  <h3 style={{marginBottom:'1rem'}}>No Membership Active</h3>
                  <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>You currently don't have a verified membership plan. Apply for one below.</p>
                  <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                     <Link to="/apply" className="btn btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>Apply for Membership</Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="card animate-fade-in">
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom:'1rem', marginBottom:'1.5rem'}}>
                My Events
              </h2>
              <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
                <Calendar size={48} style={{margin: '0 auto 1rem', opacity: 0.3}} />
                <p>No upcoming events registered.</p>
                <button className="btn btn-outline" style={{marginTop: '1rem'}} onClick={() => window.location.href='/events'}>Browse Events</button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card animate-fade-in">
              <h2 style={{borderBottom: '1px solid var(--border-color)', paddingBottom:'1rem', marginBottom:'1.5rem'}}>
                Account Settings
              </h2>
              <div style={{padding: '1rem 0'}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <div>
                      <strong style={{display:'block'}}>Email Notifications</strong>
                      <span style={{color:'var(--text-muted)', fontSize:'0.9rem'}}>Receive updates about events and newsletters.</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                 </div>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <strong style={{display:'block'}}>Public Profile Visibility</strong>
                      <span style={{color:'var(--text-muted)', fontSize:'0.9rem'}}>Allow other members to find you in the directory.</span>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

