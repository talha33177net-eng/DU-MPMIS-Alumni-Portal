import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const ApplyMembership = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyForm, setApplyForm] = useState({
    phone: user?.phone || '', email: user?.email || '', fullName: user?.fullName || '',
    batch: user?.batch || '', passingYear: '', currentDesignation: user?.currentDesignation || '', 
    currentOrganization: user?.currentOrganization || '', studentId: '', homeDistrictOrCity: '', 
    nationality: 'Bangladeshi', bloodGroup: '', maritalStatus: '', spouseName: '', dateOfBirth: '', 
    gender: '', facebookUrl: '', workCity: '', profilePhoto: null
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('File', file);
    const loadingToast = toast.loading('Uploading photo...');
    try {
      const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setApplyForm({ ...applyForm, profilePhoto: res.data.url });
      toast.success('Photo uploaded', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to upload photo', { id: loadingToast });
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (currentStep === 3 && !applyForm.profilePhoto) {
      toast.error('Profile photo is required. Please upload your photo to continue.');
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Submitting application...');
    try {
      await api.post('/members/apply', {
        ...applyForm,
        memberType: selectedPlan
      });
      // Optionally reload profile
      const userRes = await api.get('/auth/profile');
      login({ token: localStorage.getItem('token'), user: userRes.data });
      toast.success('Application submitted successfully!', { id: loadingToast });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to submit application', { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Personal Info' },
    { id: 2, title: 'Academic Info' },
    { id: 3, title: 'Professional' },
    { id: 4, title: 'Review & Submit' }
  ];

  return (
    <div className="section container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          Membership Application
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Join the DU MPMIS Alumni family and be part of a thriving network of professionals.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Membership Cards */}
        <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '3rem', display: selectedPlan ? 'none' : 'grid', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
          {/* General Member */}
          <div 
            className="card"
            onClick={() => { setSelectedPlan('General'); setCurrentStep(1); }}
            style={{ cursor: 'pointer', padding: '2rem', borderTop: '5px solid #3b82f6', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
          >
            <span style={{ display: 'inline-block', background: '#3b82f6', color: 'white', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '1.5rem' }}>GENERAL MEMBER</span>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>BDT 500 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ year</span></h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0', display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1, fontSize: '0.95rem', color: 'var(--text-color)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#3b82f6" /> Annual reunion invitation</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#3b82f6" /> Newsletter subscription</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#3b82f6" /> E-directory access</li>
            </ul>
          </div>

          {/* Life Member */}
          <div 
            className="card"
            onClick={() => { setSelectedPlan('LifeTime'); setCurrentStep(1); }}
            style={{ cursor: 'pointer', padding: '2rem', borderTop: '5px solid #f59e0b', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', boxShadow: 'var(--shadow-sm)' }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'none'}
          >
            <span style={{ display: 'inline-block', background: '#f59e0b', color: 'white', padding: '0.3rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '1.5rem' }}>LIFE MEMBER</span>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>BDT 5,000 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>one-time</span></h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0', display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1, fontSize: '0.95rem', color: 'var(--text-color)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#f59e0b" /> All General Member benefits</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#f59e0b" /> Voting rights</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#f59e0b" /> Lifetime e-directory listing</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={18} color="#f59e0b" /> Award eligibility</li>
            </ul>
          </div>
        </div>

        {/* Selected Plan Form Section */}
        {selectedPlan && (
          <div className="card animate-fade-in" style={{ padding: '3rem', borderTop: `4px solid ${selectedPlan === 'LifeTime' ? '#f59e0b' : '#3b82f6'}`, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', borderRadius: '12px', overflow: 'hidden' }}>
            
            <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-color)' }}>
                Applying for <span style={{ color: selectedPlan === 'LifeTime' ? '#f59e0b' : '#3b82f6' }}>{selectedPlan === 'LifeTime' ? 'Life' : 'General'} Member</span>
              </h2>
              <button type="button" onClick={() => setSelectedPlan(null)} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                Change Plan
              </button>
            </div>
            
            {/* Stepper Logic */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '3rem' }}>
              {steps.map((step, index) => (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                    background: currentStep >= step.id ? (selectedPlan === 'LifeTime' ? '#f59e0b' : '#3b82f6') : '#cbd5e1', 
                    color: 'white', marginRight: '0.8rem', flexShrink: 0, transition: 'all 0.3s'
                  }}>
                    {currentStep > step.id ? <Check size={16} /> : step.id}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: currentStep === step.id ? 600 : 400, color: currentStep >= step.id ? 'var(--text-color)' : 'var(--text-muted)' }}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div style={{ height: '2px', background: currentStep > step.id ? (selectedPlan === 'LifeTime' ? '#fde68a' : '#bfdbfe') : '#e2e8f0', flex: 1, margin: '0 1rem' }}></div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleApplySubmit}>
              <div style={{ minHeight: '300px' }}>
                
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="animate-fade-in">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-color)' }}>1. Personal Information</h3>
                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div><label className="input-label">Full Name *</label>
                      <input required type="text" className="input-field" value={applyForm.fullName} onChange={e => setApplyForm({...applyForm, fullName: e.target.value})} /></div>
                      <div><label className="input-label">Email Address *</label>
                      <input required type="email" className="input-field" style={{ background: 'var(--bg-secondary)' }} value={applyForm.email} readOnly /></div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div><label className="input-label">Phone Number *</label>
                      <input required type="text" className="input-field" value={applyForm.phone} onChange={e => setApplyForm({...applyForm, phone: e.target.value})} /></div>
                      <div><label className="input-label">Date of Birth</label>
                      <input type="date" className="input-field" value={applyForm.dateOfBirth} onChange={e => setApplyForm({...applyForm, dateOfBirth: e.target.value})} /></div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div><label className="input-label">Blood Group</label>
                      <select className="input-field" value={applyForm.bloodGroup} onChange={e => setApplyForm({...applyForm, bloodGroup: e.target.value})}>
                        <option value="">Select...</option><option value="A+">A+</option><option value="A-">A-</option>
                        <option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option>
                        <option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option>
                      </select></div>
                      <div><label className="input-label">Gender</label>
                      <select className="input-field" value={applyForm.gender} onChange={e => setApplyForm({...applyForm, gender: e.target.value})}>
                        <option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                      </select></div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div><label className="input-label">Marital Status</label>
                      <select className="input-field" value={applyForm.maritalStatus} onChange={e => setApplyForm({...applyForm, maritalStatus: e.target.value})}>
                        <option value="">Select...</option><option value="Single">Single</option><option value="Married">Married</option>
                      </select></div>
                      <div><label className="input-label">Spouse Name</label>
                      <input type="text" className="input-field" placeholder="If applicable" value={applyForm.spouseName} onChange={e => setApplyForm({...applyForm, spouseName: e.target.value})} /></div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="animate-fade-in">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-color)' }}>2. Academic Information</h3>
                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div><label className="input-label">Admission Session (Batch) *</label>
                      <input required type="text" className="input-field" placeholder="e.g. 2020" value={applyForm.batch} onChange={e => setApplyForm({...applyForm, batch: e.target.value})} /></div>
                      <div><label className="input-label">Student ID</label>
                      <input type="text" className="input-field" placeholder="Your Student ID" value={applyForm.studentId} onChange={e => setApplyForm({...applyForm, studentId: e.target.value})} /></div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      {selectedPlan === 'General' && (
                        <div><label className="input-label">MA/MSS Passing Year</label>
                        <input type="text" className="input-field" placeholder="If applicable" value={applyForm.passingYear} onChange={e => setApplyForm({...applyForm, passingYear: e.target.value})} /></div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="animate-fade-in">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--text-color)' }}>3. Professional Information</h3>
                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div><label className="input-label">Organization Name</label>
                      <input type="text" className="input-field" value={applyForm.currentOrganization} onChange={e => setApplyForm({...applyForm, currentOrganization: e.target.value})} /></div>
                      <div><label className="input-label">Designation</label>
                      <input type="text" className="input-field" value={applyForm.currentDesignation} onChange={e => setApplyForm({...applyForm, currentDesignation: e.target.value})} /></div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div><label className="input-label">Work City / Address</label>
                      <input type="text" className="input-field" value={applyForm.workCity} onChange={e => setApplyForm({...applyForm, workCity: e.target.value})} /></div>
                      <div><label className="input-label">Home District / City</label>
                      <input type="text" className="input-field" value={applyForm.homeDistrictOrCity} onChange={e => setApplyForm({...applyForm, homeDistrictOrCity: e.target.value})} /></div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div><label className="input-label">Nationality</label>
                      <input type="text" className="input-field" value={applyForm.nationality} onChange={e => setApplyForm({...applyForm, nationality: e.target.value})} /></div>
                      <div><label className="input-label">Facebook Profile Link</label>
                      <input type="url" className="input-field" placeholder="https://facebook.com/..." value={applyForm.facebookUrl} onChange={e => setApplyForm({...applyForm, facebookUrl: e.target.value})} /></div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label className="input-label">Profile Photo (Required) *</label>
                      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        {applyForm.profilePhoto && (
                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}>
                            <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${applyForm.profilePhoto}`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ padding: '0.5rem' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div className="animate-fade-in">
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: 'var(--text-color)' }}>4. Review & Submit</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please review your basic information below before applying.</p>
                    
                    <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                      <div className="grid grid-2" style={{ gap: '1rem' }}>
                        <div><strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Name</strong> {applyForm.fullName}</div>
                        <div><strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Email</strong> {applyForm.email}</div>
                        <div><strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Phone</strong> {applyForm.phone}</div>
                        <div><strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Batch</strong> {applyForm.batch}</div>
                      </div>
                    </div>

                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Info color="#3b82f6" size={32} style={{ flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e3a8a' }}>
                        By submitting this form, you verify that your information is correct and you agree to the <strong>Membership Constitution</strong> of the DU MPMIS Alumni Association.
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Form Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                {currentStep > 1 ? (
                  <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ChevronLeft size={16} /> Previous
                  </button>
                ) : <div></div>}
                
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: selectedPlan === 'LifeTime' ? '#f59e0b' : '#3b82f6', borderColor: selectedPlan === 'LifeTime' ? '#f59e0b' : '#3b82f6' }}>
                  {isSubmitting ? 'Submitting...' : currentStep < 4 ? 'Continue Next Step' : 'Submit Application'}
                  {!isSubmitting && currentStep < 4 && <ChevronRight size={16} />}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
      
      {/* Global label style added for this split form wrapper */}
      <style>{`
        .input-label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; color: var(--text-color); }
        .input-field { display: block; width: 100%; padding: 0.8rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.95rem; transition: border-color 0.2s; }
        .input-field:focus { outline: none; border-color: var(--accent-color); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
      `}</style>
    </div>
  );
};

export default ApplyMembership;
