import { useState, useEffect } from 'react';
import { FileText, Eye, Download, Calendar } from 'lucide-react';
import api from '../lib/api';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewNotice, setViewNotice] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const result = await api.get('/notices?per_page=25');
        const data = result.data || [];
        setNotices(data);
        if (data.length > 0) {
          setViewNotice(data[0]);
        }
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchNotices();
  }, []);

  return (
    <div className="section container animate-fade-in" style={{minHeight: '80vh'}}>
      <div style={{textAlign:'center', marginBottom:'3rem'}}>
        <h1 style={{fontSize:'2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)'}}>Notice Board</h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Notice List */}
        <div style={{background: 'var(--surface-color)', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden'}}>
          <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: 'var(--primary-color)', fontWeight: 'bold' }}>
            Latest Notices
          </div>
          {loading ? (
            <div style={{padding: '4rem', textAlign: 'center'}}><span className="loader-spinner"></span></div>
          ) : notices.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>No notices found.</div>
          ) : (
            <div style={{maxHeight: '800px', overflowY: 'auto'}}>
              {notices.map((n, idx) => {
                const isActive = viewNotice?.id === n.id;
                return (
                  <div 
                    key={n.id} 
                    onClick={() => setViewNotice(n)}
                    style={{
                      padding: '1.25rem 1.5rem', 
                      borderBottom: '1px solid #e2e8f0', 
                      cursor: 'pointer',
                      background: isActive ? '#eff6ff' : (idx % 2 === 0 ? 'white' : '#fcfcfc'),
                      borderLeft: isActive ? '4px solid #3b82f6' : '4px solid transparent',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => !isActive && (e.currentTarget.style.background='#f1f5f9')} 
                    onMouseOut={e => !isActive && (e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fcfcfc')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={12} /> {n.publishedAt ? n.publishedAt.substring(0, 10) : '-'}
                        </div>
                        <div style={{ color: isActive ? '#1e3a8a' : 'var(--text-primary)', fontWeight: isActive ? '600' : '500', lineHeight: 1.4 }}>
                          {n.title}
                        </div>
                        {n.content && (
                          <div 
                            style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                            dangerouslySetInnerHTML={{ __html: n.content }}
                          />
                        )}
                      </div>
                      
                      {n.attachmentUrl && (
                        <a 
                          href={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${n.attachmentUrl}`} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ 
                            color: '#3b82f6', 
                            background: isActive ? '#ffffff' : '#eff6ff', 
                            padding: '0.5rem', 
                            borderRadius: '4px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'background 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#dbeafe'}
                          onMouseOut={e => e.currentTarget.style.background = isActive ? '#ffffff' : '#eff6ff'}
                          title="Download Notice"
                        >
                          <Download size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: PDF / Content Viewer */}
        <div style={{ background: 'var(--surface-color)', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
          {viewNotice ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: 0, color: 'var(--primary-color)', fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 'bold' }}>
                  {viewNotice.title}
                </h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <Calendar size={14} /> {(viewNotice.publishedAt || viewNotice.date || '').substring(0, 10)}
                </div>
              </div>

              {/* Viewer Area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {viewNotice.attachmentUrl ? (
                  viewNotice.attachmentUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <div style={{ textAlign: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                      <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${viewNotice.attachmentUrl}`} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '4px' }} />
                    </div>
                  ) : viewNotice.attachmentUrl.match(/\.pdf$/i) ? (
                    <iframe 
                      src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${viewNotice.attachmentUrl}#toolbar=0&navpanes=0&view=FitH`} 
                      style={{ width: '100%', height: '800px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      title="PDF Document"
                    />
                  ) : (
                    <div style={{ padding: '2rem', background: '#eff6ff', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', border: '1px solid #bfdbfe', flex: 1 }}>
                      <FileText size={48} color="#3b82f6" />
                      <p style={{ color: '#1e3a8a', fontWeight: '500', marginBottom: 0 }}>This notice contains a downloadable document.</p>
                      <a href={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${viewNotice.attachmentUrl}`} target="_blank" rel="noreferrer" 
                         style={{ background: '#3b82f6', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} /> Download Notice
                      </a>
                    </div>
                  )
                ) : (
                  <></>
                )}

                {viewNotice.content && (
                  <div style={{ marginTop: viewNotice.attachmentUrl ? '2rem' : '0', color: 'var(--text-primary)', lineHeight: '1.7', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{__html: viewNotice.content}} />
                )}
                
                {!viewNotice.content && !viewNotice.attachmentUrl && (
                   <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 0' }}>
                     <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 0 }}>No additional details or attachments provided for this notice.</p>
                   </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Select a notice from the left to view details</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Notices;

