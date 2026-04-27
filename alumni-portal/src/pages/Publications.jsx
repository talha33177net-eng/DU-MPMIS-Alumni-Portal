import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import css from './Publications.module.css';
import api from '../lib/api';

const TAB_MAPPING = [
  { id: 'AGM_Reports', label: 'AGM Reports' },
  { id: 'Souvenirs', label: 'Souvenirs' },
  { id: 'Finance_Reports', label: 'Finance Reports' },
];

const Publications = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDoc, setViewDoc] = useState(null);

  useEffect(() => {
    if (category) {
      setLoading(true);
      api.get(`/publications?category=${category}&per_page=100`)
        .then(res => {
          if (res.data && Array.isArray(res.data)) setDataList(res.data);
          else setDataList(Array.isArray(res) ? res : []);
        })
        .catch(err => {
          console.error(err);
          setDataList([]);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [category]);

  const currentCategoryLabel = TAB_MAPPING.find(t => t.id === category)?.label || 'Publications & Reports';

  return (
    <div className="section container animate-fade-in" style={{minHeight: '80vh'}}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          {currentCategoryLabel}
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
      </div>

      <div className={css.wrapper} style={{border: 'none', boxShadow: 'none', background: 'transparent'}}>
        {!category ? (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', padding: '1rem'}}>
            {TAB_MAPPING.map(tab => (
               <div key={tab.id} onClick={() => navigate(`/publications/${tab.id}`)} style={{background: 'var(--surface-color)', padding: '2.5rem 2rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'}} onMouseOver={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.borderColor='var(--accent-color)'; }} onMouseOut={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='var(--border-color)'; }}>
                 <div style={{width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(219, 161, 33, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'}}>
                   <FileText size={28} color="var(--accent-color)" />
                 </div>
                 <h3 style={{color: 'var(--primary-color)', margin: 0, fontSize: '1.25rem'}}>{tab.label}</h3>
               </div>
            ))}
          </div>
        ) : (
          <div style={{background: 'var(--surface-color)', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden'}}>
            {loading ? (
              <div style={{padding: '4rem', textAlign: 'center'}}><span className="loader-spinner"></span></div>
            ) : (
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px'}}>
                  <thead style={{background: '#f8fafc', borderBottom: '2px solid #e2e8f0'}}>
                    <tr>
                      <th style={{padding: '1rem 1.5rem', color: 'var(--primary-color)', fontWeight: 'bold'}}>Sl</th>
                      <th style={{padding: '1rem 1.5rem', color: 'var(--primary-color)', fontWeight: 'bold'}}>Date</th>
                      <th style={{padding: '1rem 1.5rem', color: 'var(--primary-color)', fontWeight: 'bold', width: '50%'}}>Title</th>
                      <th style={{padding: '1rem 1.5rem', color: 'var(--primary-color)', fontWeight: 'bold', textAlign: 'center'}}>View</th>
                      <th style={{padding: '1rem 1.5rem', color: 'var(--primary-color)', fontWeight: 'bold', textAlign: 'center'}}>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataList.length > 0 ? dataList.map((item, index) => {
                      const rowDate = (item.publishedAt || item.date || '').substring(0, 10);
                      return (
                        <tr key={item.id} style={{borderBottom: '1px solid #e2e8f0', background: index % 2 === 0 ? 'white' : '#fcfcfc', transition: 'background 0.2s', display: 'table-row'}} onMouseOver={e => e.currentTarget.style.background='#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fcfcfc'}>
                          <td style={{padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontWeight: '500'}}>{index + 1}</td>
                          <td style={{padding: '1.25rem 1.5rem', color: 'var(--text-muted)'}}>{rowDate}</td>
                          <td style={{padding: '1.25rem 1.5rem', color: 'var(--text-primary)', fontWeight: '500'}}>{item.title}</td>
                          <td style={{padding: '1.25rem 1.5rem', textAlign: 'center'}}>
                            <button 
                              onClick={() => setViewDoc(item)}
                              style={{background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}
                              aria-label="View Document">
                              <Eye size={18} />
                            </button>
                          </td>
                          <td style={{padding: '1.25rem 1.5rem', textAlign: 'center'}}>
                            {item.attachmentUrl ? (
                              <a href={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${item.attachmentUrl}`} target="_blank" rel="noreferrer" 
                                 style={{background: 'transparent', color: '#3b82f6', border: '1px solid #3b82f6', padding: '0.4rem 0.8rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
                                <Download size={18} />
                              </a>
                            ) : (
                              <span style={{color: '#cbd5e1'}}>-</span>
                            )}
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan="5" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
                          No documents found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Details Modal copied from Notices */}
      {viewDoc && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div style={{background: 'var(--surface-color)', padding: '2.5rem', borderRadius: '8px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid var(--border-color)'}}>
            <h2 style={{marginTop: 0, color: 'var(--primary-color)', fontFamily: 'var(--font-serif)', fontSize: '1.8rem'}}>{viewDoc.title}</h2>
            <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Calendar size={14} /> {(viewDoc.publishedAt || viewDoc.date || '').substring(0, 10)}
            </div>
            
            {viewDoc.attachmentUrl && (viewDoc.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) && (
              <div style={{marginBottom: '1.5rem', textAlign: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0'}}>
                <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${viewDoc.attachmentUrl}`} alt="Attachment" style={{maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '4px'}} />
              </div>
            )}
            
            {viewDoc.attachmentUrl && !(viewDoc.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i)) && (
              <div style={{marginBottom: '1.5rem', padding: '1rem', background: '#eff6ff', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #bfdbfe'}}>
                <FileText size={20} color="#3b82f6" />
                <a href={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${viewDoc.attachmentUrl}`} target="_blank" rel="noreferrer" style={{color: '#3b82f6', fontWeight: '600', textDecoration: 'none'}}>Download Reference Document</a>
              </div>
            )}

            {viewDoc.content ? (
              <div style={{color: 'var(--text-primary)', lineHeight: '1.7', fontSize: '1.05rem', whiteSpace: 'pre-wrap'}} dangerouslySetInnerHTML={{__html: viewDoc.content}} />
            ) : (
               <p style={{color: 'var(--text-muted)', fontStyle: 'italic'}}>No further details provided.</p>
            )}

            <div style={{marginTop: '2.5rem', textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem'}}>
              <button 
                onClick={() => setViewDoc(null)} 
                style={{background: 'var(--primary-color)', color: 'white', padding: '0.6rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publications;

