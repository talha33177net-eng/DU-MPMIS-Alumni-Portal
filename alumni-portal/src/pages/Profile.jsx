import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Building, User as UserIcon } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/members/detail/${id}`);
        setMember(res?.data || res);
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError("Profile not found or could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  if (loading) return <div className="section" style={{display:'flex',justifyContent:'center',minHeight:'60vh'}}><span className="loader-spinner"></span></div>;
  if (error || !member) return <div className="section container" style={{textAlign:'center',padding:'5rem'}}><h2>{error || 'Member not found'}</h2><Link to="/" className="btn btn-outline" style={{marginTop:'1.5rem'}}>Go Home</Link></div>;

  return (
    <div className="section container animate-fade-in" style={{ backgroundColor: '#f8fafc', padding: '3rem 1rem', minHeight: '80vh' }}>
      
      {/* Profile Header */}
      <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {member.profilePhoto ? (
            <img loading="lazy" src={member.profilePhoto.startsWith('http') ? member.profilePhoto : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${member.profilePhoto}`} alt={member.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <UserIcon size={50} color="#94a3b8" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>{member.fullName}</h1>
            <span style={{ 
              padding: '0.3rem 0.8rem', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: 'bold', 
              background: member.memberType === 'LifeTime' ? '#f59e0b' : member.memberType === 'InMemoriam' ? '#ef4444' : '#3b82f6', 
              color: 'white' 
            }}>
              {member.memberType} {member.memberType === 'InMemoriam' && member.dateOfDeath ? `(Deceased ${member.dateOfDeath.split('T')[0]})` : 'Member'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <strong>Student ID:</strong> {member.studentId || member.id}
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Mail size={16} /> {member.email || 'N/A'}</span>
             {member.homeDistrictOrCity && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={16} /> Home: {member.homeDistrictOrCity}</span>}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
        
        {/* Left Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Personal Info</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><strong>Nationality:</strong> {member.nationality || 'N/A'}</li>
              <li><strong>Blood Group:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{member.bloodGroup || 'N/A'}</span></li>
              <li><strong>Marital Status:</strong> {member.maritalStatus || 'N/A'}</li>
              <li><strong>Spouse Name:</strong> {member.spouseName || 'N/A'}</li>
              <li><strong>Gender:</strong> {member.gender || 'N/A'}</li>
              <li><strong>Date of Birth:</strong> {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}</li>
            </ul>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Social Media</h3>
            {member.facebookUrl ? (
              <a href={member.facebookUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1877F2', fontWeight: '500', textDecoration: 'none' }}>
                ðŸ”— Facebook Profile
              </a>
            ) : (
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>No social links provided.</p>
            )}
          </div>

        </div>

        {/* Right Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
             <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><GraduationCap size={20} color="var(--accent-color)" /> Academic Information</h3>
             <div className="grid grid-2" style={{ gap: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div>
                   <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-muted)' }}>Admission Session (Batch)</p>
                   <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{member.batch || 'N/A'}</p>
                </div>
                <div>
                   <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-muted)' }}>MA/MSS Year</p>
                   <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>{member.passingYear || 'N/A'}</p>
                </div>
             </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
             <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={20} color="var(--accent-color)" /> Contact Information</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                   <strong style={{ color: 'var(--text-muted)' }}>Phone Number</strong>
                   <span>{member.phone || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <strong style={{ color: 'var(--text-muted)' }}>Email Address</strong>
                   <span>{member.email || 'N/A'}</span>
                </div>
             </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
             <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Briefcase size={20} color="var(--accent-color)" /> Professional Profile</h3>
             <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                   <div style={{ padding: '0.8rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: '#38bdf8' }}><Building size={24} /></div>
                   <div>
                      <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-muted)' }}>Organization Name</p>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{member.currentOrganization || 'N/A'}</p>
                   </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                   <div style={{ padding: '0.8rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: '#38bdf8' }}><Briefcase size={24} /></div>
                   <div>
                      <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-muted)' }}>Designation</p>
                      <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{member.currentDesignation || 'N/A'}</p>
                   </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                   <div style={{ padding: '0.8rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: '#38bdf8' }}><MapPin size={24} /></div>
                   <div>
                      <p style={{ margin: '0 0 0.3rem 0', color: 'var(--text-muted)' }}>Work City / Address</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-primary)' }}>{member.workCity || 'N/A'}</p>
                   </div>
                </li>
             </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;

