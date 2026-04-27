import { useState, useEffect } from 'react';
import { Search, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import css from './Directory.module.css';

const Directory = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
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
  }, []);

  const filteredMembers = members.filter(m => {
    return m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.batch && m.batch.toLowerCase().includes(searchTerm.toLowerCase()));
  });

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

