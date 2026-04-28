import { BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import 'react-quill-new/dist/quill.snow.css';
const History = () => {
  const [content, setContent] = useState('');
  const [aboutImage, setAboutImage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/website-content')
      .then((data) => {
        if (data) {
          setContent(data.historyContent);
          setAboutImage(data.aboutImage);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="section" style={{display:'flex',justifyContent:'center'}}><span className="loader-spinner"></span></div>;

  return (
    <div className="section container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          History of DU MPMIS
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
      </div>

      <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem', fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-main)' }}>
        {aboutImage && (
          <div style={{ marginBottom: '2.5rem', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <img loading="lazy" src={aboutImage.startsWith('http') ? aboutImage : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${aboutImage}`} alt="Association History" style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        {content
          ? <div className="ql-snow" style={{ border: 'none' }}>
              <div className="ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          : <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>The history content has not been formally published yet.</div>
        }
      </div>
    </div>
  );
};

export default History;

