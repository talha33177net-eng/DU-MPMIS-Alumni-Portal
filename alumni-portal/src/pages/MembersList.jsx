import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../lib/api';
import css from './Directory.module.css';

const MembersList = () => {
  const { type } = useParams(); // 'life' or 'general'
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const result = await api.get('/members?per_page=100');
        // Backend returns standard PaginationHelper object { items: [], meta: {} }
        setMembers(result.items || result.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [type]); // Refetch if needed, though we fetch all and filter client-side

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (m.designation && m.designation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (type === 'life') return matchesSearch && m.memberType === 'LifeTime';
    if (type === 'general') return matchesSearch && m.memberType !== 'LifeTime' && m.memberType !== 'InMemoriam';
    return matchesSearch && m.memberType !== 'InMemoriam';
  });

  const pageTitle = type === 'life' ? 'Life Members' : type === 'general' ? 'General Members' : 'Members';

  return (
    <div className="section container animate-fade-in">
      <div className={css.header} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'left', flex: '1 1 min-content' }}>
          <h1 className={css.title} style={{ fontSize: '2.5rem', marginBottom: '0.5rem', marginTop: 0 }}>{pageTitle}</h1>
          <p className={css.subtitle} style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>Connect with our esteemed {pageTitle.toLowerCase()} representing DU MPMIS.</p>
        </div>
        
        <div className={css.searchBar} style={{ flex: '1 1 400px', maxWidth: '400px', position: 'relative' }}>
          <Search className={css.searchIcon} size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name or designation..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '3rem', width: '100%', borderRadius: '50px', height: '50px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className={css.loaderContainer} style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <span className="loader-spinner"></span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {filteredMembers.map((member) => (
            <div key={member.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <div style={{ height: '320px', width: '100%', backgroundColor: '#0f172a', position: 'relative' }}>
                <img loading="lazy" 
                  src={member.profilePhoto ? `${import.meta.env.PROD ? "" : "http://localhost:5001"}${member.profilePhoto}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=0f172a&color=fff&size=512`} 
                  alt={member.fullName} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '2rem 1rem 1rem 1rem' }}>
                  <h3 style={{ color: 'white', margin: 0, fontSize: '1.4rem' }}>{member.fullName}</h3>
                  <span style={{ 
                    display: 'inline-block', 
                    marginTop: '0.3rem', 
                    padding: '0.2rem 0.6rem', 
                    fontSize: '0.75rem', 
                    borderRadius: '4px', 
                    background: member.memberType === 'LifeTime' ? '#f59e0b' : member.memberType === 'InMemoriam' ? '#ef4444' : '#3b82f6', 
                    color: 'white', 
                    fontWeight: 'bold' 
                  }}>
                    {member.memberType} Member
                  </span>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                {member.designation && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{member.designation}</div>}
                {member.workplace && <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '1.5rem', fontWeight: 500 }}>{member.workplace}</div>}

                <div style={{ marginTop: 'auto' }}>
                  <Link to={`/profile/${member.id}`} className="btn btn-outline" style={{ display: 'block', textAlign: 'center', width: '100%' }}>
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {filteredMembers.length === 0 && (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
              <p>No members found matching your search in this category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MembersList;

