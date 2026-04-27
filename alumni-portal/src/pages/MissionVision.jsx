import { Target, Compass } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/api';

const MissionVision = () => {
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/website-content')
      .then((data) => {
        if (data) {
          setMission(data.missionText);
          setVision(data.visionText);
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
          Mission & Vision
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
      </div>

      <div className="grid grid-2" style={{ maxWidth: '1000px', margin: '0 auto', gap: '3rem' }}>
        
        {/* Mission */}
        <div className="card" style={{ padding: '3rem', textAlign: 'center', borderTop: '4px solid var(--accent-color)' }}>
          <Target size={48} style={{ color: 'var(--accent-color)', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Our Mission</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
            {mission || 'Mission statement has not been published yet.'}
          </p>
        </div>

        {/* Vision */}
        <div className="card" style={{ padding: '3rem', textAlign: 'center', borderTop: '4px solid var(--primary-color)' }}>
          <Compass size={48} style={{ color: 'var(--primary-color)', margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Our Vision</h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
            {vision || 'Vision statement has not been published yet.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionVision;
