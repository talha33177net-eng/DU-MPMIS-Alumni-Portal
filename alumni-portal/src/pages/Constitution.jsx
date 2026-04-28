import { FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../lib/api';
import 'react-quill-new/dist/quill.snow.css';
const Constitution = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/website-content')
      .then((data) => {
        if (data && data.constitutionContent) setContent(data.constitutionContent);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="section" style={{display:'flex',justifyContent:'center'}}><span className="loader-spinner"></span></div>;

  return (
    <div className="section container animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          Constitution
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          The governing rules and regulations of DU MPMIS Alumni Association.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem' }}>
        {content ? (
          <div className="ql-snow" style={{ border: 'none' }}>
            <div className="ql-editor" style={{ padding: 0 }} dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <FileText size={64} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '1rem' }}>Constitution Drafting in Progress</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              The association's constitution is currently unavailable. Please check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Constitution;
