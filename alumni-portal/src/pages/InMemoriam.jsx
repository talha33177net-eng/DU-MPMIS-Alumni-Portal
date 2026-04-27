import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../lib/api';
import css from './InMemoriam.module.css';

const InMemoriam = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get('/members/InMemoriam?per_page=100');
        if (res.data && Array.isArray(res.data)) {
          setMembers(res.data);
        } else if (Array.isArray(res)) {
          setMembers(res);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error('Failed to load In Memoriam members:', err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  if (loading) return <div className="section" style={{display:'flex',justifyContent:'center'}}><span className="loader-spinner"></span></div>;

  return (
    <div className="section container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          In Memoriam
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Honoring the memory and legacy of our beloved departed alumni. They remain forever in our hearts.
        </p>
      </div>

      <div className={css.grid}>
        {members.map(member => (
          <div key={member.id} className={`card ${css.memorialCard}`}>
            <div className={css.photoWrapper}>
              {member.profilePhoto ? (
                 <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${member.profilePhoto}`} alt={member.fullName} />
              ) : (
                 <div className={css.photoPlaceholder}>{member.fullName.charAt(0)}</div>
              )}
            </div>
            <h3 className={css.name}>{member.fullName}</h3>
            <p className={css.batch}>Batch: {member.batch || 'N/A'}</p>
            <div className={css.departure}>
               <Heart size={14} className={css.heartIcon} />
               Passed away in {member.dateOfDeath ? member.dateOfDeath.substring(0, 4) : 'Unknown'}
            </div>
            {member.bio && <p className={css.bio}>"{member.bio}"</p>}
          </div>
        ))}
        {members.length === 0 && (
          <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
            <p>No In-Memoriam records found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InMemoriam;

