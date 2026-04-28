import { useState, useEffect } from 'react';
import { Search, Mail, Phone, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import css from './Directory.module.css';

const Directory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetchMembers = async () => {
      try {
        const result = await api.get('/directory?per_page=200');
        setMembers(result.items || result.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [user]);

  const filteredMembers = members.filter(m => {
    return m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.batch && m.batch.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  if (!user) {
    return (
      <div className="section container animate-fade-in" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-secondary)', marginBottom: '1.5rem' }}>
          <Lock size={36} color="var(--primary-color)" />
        </div>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>Alumni E-Directory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
          Please log in to access the Alumni E-Directory and connect with fellow graduates.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            Login to Access
          </button>
          <button onClick={() => navigate('/register')} className="btn btn-outline" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section container animate-fade-in">
      <div className={css.header}>
        <h1 className={css.title}>Alumni E-Directory</h1>
        <p className={css.subtitle}>Connect with fellow graduates of DU MPMIS worldwide.</p>
        
        <div className={css.searchBar}>
          <Search className={css.searchIcon} size={20} />
          <input 
            type="text" 
            placeholder="Search alumni by name or batch..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={css.loaderContainer}>
          <span className="loader-spinner"></span>
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem', overflowX: 'auto' }}>
          <table className={css.directoryTable}>
            <thead>
              <tr>
                <th>Member Information</th>
                <th>Batch</th>
                <th style={{ textAlign: 'right' }}>Profession</th>
                <th style={{ textAlign: 'right' }}>Contact details</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id}>
                  <td>
                    <div className={css.memberInfo}>
                      <img loading="lazy" 
                        src={member.profilePhoto ? `${import.meta.env.PROD ? "" : "http://localhost:5001"}${member.profilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=0f172a&color=fff&size=128`} 
                        alt="Profile" 
                        className={css.avatar}
                      />
                      <div>
                        <strong>{member.fullName}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{member.batch || '-'}</td>
                  <td style={{ textAlign: 'right' }}>
                     {member.currentDesignation ? member.currentDesignation : '-'}
                     {member.currentOrganization && <div><small>{member.currentOrganization}</small></div>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                     <div className={css.contactCell}>
                       {member.phone && <div><Phone size={14}/> {member.phone}</div>}
                       {member.email && <div><Mail size={14}/> {member.email}</div>}
                     </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                 <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                       No alumni found matching your search.
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Directory;

