import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Mail, Phone, ExternalLink, Users } from 'lucide-react';
import css from './Committee.module.css';

const Committee = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/committee')
      .then((data) => {
        if (data) {
          setMembers(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="section" style={{display:'flex',justifyContent:'center'}}><span className="loader-spinner"></span></div>;

  return (
    <div className="section container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          Executive Committee
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Meet the dedicated leaders driving our association's vision and initiatives forward.
        </p>
      </div>

      {members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: '8px' }}>
          <Users size={48} style={{ opacity: 0.5, margin: '0 auto 1rem' }} />
          <h3>No committee members available.</h3>
          <p>The leadership committee has not been populated yet.</p>
        </div>
      ) : (
        <div className={css.grid}>
          {members.map(member => (
            <div key={member.id} className={`card ${css.ecCard}`}>
              <div className={css.photoWrapper}>
                {member.photo ? (
                   <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${member.photo}`} alt={member.fullName} />
                ) : (
                   <div className={css.photoPlaceholder}>{member.fullName.charAt(0)}</div>
                )}
              </div>
              <div className={css.info}>
                <h3 className={css.name}>{member.fullName}</h3>
                <p className={css.designation}>{member.position}</p>
                {member.currentOrganization && <p className={css.company}>{member.currentDesignation ? `${member.currentDesignation}, ` : ''}{member.currentOrganization}</p>}
                {member.committeeYear && <p style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontWeight: 500, marginTop: '0.5rem' }}>Tenure: {member.committeeYear}</p>}
              </div>
              <div className={css.social}>
                 {member.email && <a href={`mailto:${member.email}`} aria-label="Email"><Mail size={16}/></a>}
                 {member.phone && <a href={`tel:${member.phone}`} aria-label="Phone"><Phone size={16}/></a>}
                 {member.linkedInUrl && <a href={member.linkedInUrl} target="_blank" rel="noreferrer" aria-label="Profile"><ExternalLink size={16}/></a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Committee;

