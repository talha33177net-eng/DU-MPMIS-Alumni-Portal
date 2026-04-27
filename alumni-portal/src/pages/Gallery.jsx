import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Video as VideoIcon, Folder, PlayCircle } from 'lucide-react';
import api from '../lib/api';
import css from './Gallery.module.css';

const Gallery = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const activeTab = type === 'videos' ? 'videos' : 'photos';

  const [allMedia, setAllMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbumName, setSelectedAlbumName] = useState(null);
  const [lightbox, setLightbox] = useState(null);

  // Added index tracking for carousel capabilities
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        const endpoint = activeTab === 'photos' ? '/gallery/photos' : '/gallery/videos';
        const res = await api.get(`${endpoint}?per_page=1000`);
        const data = res.data?.data || res.data || [];
        setAllMedia(data);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchMedia();
    setSelectedAlbumName(null);
  }, [activeTab]);

  const getMediaAbsoluteUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5136';
      return `${baseUrl}${url}`;
  };

  const extractYoutubeId = (url) => {
      const match = url?.match(/(?:v=|youtu\.be\/)([^&]+)/);
      return match ? match[1] : null;
  };

  // Group media into albums
  const groupedAlbums = {};
  const ungroupedMedia = []; // For items without albums

  allMedia.forEach(item => {
     if (item.album) {
         if (!groupedAlbums[item.album]) groupedAlbums[item.album] = [];
         groupedAlbums[item.album].push(item);
     } else {
         ungroupedMedia.push(item);
     }
  });

  const albumNames = Object.keys(groupedAlbums);

  if (loading) return <div className="section" style={{display:'flex',justifyContent:'center'}}><span className="loader-spinner"></span></div>;

  return (
    <div className="section container animate-fade-in">
      <div className={css.header}>
        <h1>Photo & Video Gallery</h1>
        <p>Relive the memories from our events, reunions, and alumni gatherings.</p>
      </div>

      {!selectedAlbumName && (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'photos' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => navigate('/gallery/photos')}
            style={{ borderRadius: '20px', padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <ImageIcon size={18} /> Photos
          </button>
          <button 
            className={`btn ${activeTab === 'videos' ? 'btn-primary' : 'btn-outline'}`} 
            onClick={() => navigate('/gallery/videos')}
            style={{ borderRadius: '20px', padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <VideoIcon size={18} /> Videos
          </button>
        </div>
      )}

      {selectedAlbumName ? (
        <>
          <button className={`btn btn-outline ${css.backBtn}`} onClick={() => setSelectedAlbumName(null)}>
            ← Back to Albums
          </button>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '1.5rem' }}>
             <h2 style={{ marginBottom: '0.5rem' }}>{selectedAlbumName}</h2>
             {groupedAlbums[selectedAlbumName][0]?.description && (
                <p style={{ color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                   {groupedAlbums[selectedAlbumName][0].description}
                </p>
             )}
          </div>

          <div className={css.mediaGrid}>
            {groupedAlbums[selectedAlbumName].map((item, idx) => (
              <div key={item.id || idx} className={css.mediaItem} onClick={() => { if (activeTab === 'photos') { setLightbox(item); setLightboxIndex(idx); } }}>
                {activeTab === 'photos' ? (
                    <>
                      <img loading="lazy" src={getMediaAbsoluteUrl(item.mediaUrl)} alt={item.title} />
                      <div className={css.mediaOverlay}>
                        <ImageIcon size={24} />
                      </div>
                    </>
                ) : (
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${extractYoutubeId(item.mediaUrl)}`} 
                      title={item.title} 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      style={{ borderRadius: '8px' }}
                    ></iframe>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={`grid grid-2`}>
          {/* Render Album Folders First */}
          {albumNames.map(albumName => (
            <div key={albumName} className={`card ${css.albumCard}`} onClick={() => setSelectedAlbumName(albumName)} style={{ cursor: 'pointer', overflow: 'hidden' }}>
              <div className={css.albumCover} style={{ height: '300px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeTab === 'photos' ? (
                   <img loading="lazy" src={getMediaAbsoluteUrl(groupedAlbums[albumName][0].mediaUrl)} alt={albumName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                   groupedAlbums[albumName][0].mediaUrl ? 
                     <img loading="lazy" src={`https://img.youtube.com/vi/${extractYoutubeId(groupedAlbums[albumName][0].mediaUrl)}/hqdefault.jpg`} alt={albumName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                     : <VideoIcon size={48} color="#94a3b8" />
                )}
                
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                   {groupedAlbums[albumName].length} Items
                </div>
              </div>
              <div className={css.albumInfo} style={{ padding: '1rem', background: 'white' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                   <Folder size={18} color="var(--accent-color)" /> {albumName}
                </h3>
              </div>
            </div>
          ))}

          {/* Render Ungrouped Media Directly inline if it lacks an album */}
          {ungroupedMedia.map((item, idx) => (
             <div key={item.id || idx} className={`card ${css.albumCard}`} onClick={() => { if (activeTab === 'photos') { setLightbox(item); setLightboxIndex(idx); } }} style={{ cursor: activeTab === 'photos' ? 'pointer' : 'default', overflow: 'hidden' }}>
               <div className={css.albumCover} style={{ height: '300px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                 {activeTab === 'photos' ? (
                    <>
                      <img loading="lazy" src={getMediaAbsoluteUrl(item.mediaUrl)} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', ':hover': { opacity: 1 } }}>
                          <ImageIcon size={32} color="white" />
                      </div>
                    </>
                 ) : (
                     <iframe 
                       width="100%" 
                       height="100%" 
                       src={`https://www.youtube.com/embed/${extractYoutubeId(item.mediaUrl)}`} 
                       title={item.title} 
                       frameBorder="0" 
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                       allowFullScreen
                     ></iframe>
                 )}
               </div>
               <div className={css.albumInfo} style={{ padding: '1rem', background: 'white' }}>
                 <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{item.title}</h3>
               </div>
             </div>
          ))}

          {allMedia.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No media found.</p>}
        </div>
      )}

      {/* Lightbox / Video Player */}
      {lightbox && (
        <div className={css.lightbox} onClick={() => setLightbox(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          
          {/* Arrow Overlays */}
          {activeTab === 'photos' && selectedAlbumName && groupedAlbums[selectedAlbumName].length > 1 && (
              <>
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        let prev = lightboxIndex - 1;
                        if (prev < 0) prev = groupedAlbums[selectedAlbumName].length - 1;
                        setLightboxIndex(prev);
                        setLightbox(groupedAlbums[selectedAlbumName][prev]);
                    }} 
                    style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10001 }}
                 >
                    ❮
                 </button>
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        let next = lightboxIndex + 1;
                        if (next >= groupedAlbums[selectedAlbumName].length) next = 0;
                        setLightboxIndex(next);
                        setLightbox(groupedAlbums[selectedAlbumName][next]);
                    }} 
                    style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '50%', width: '50px', height: '50px', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10001 }}
                 >
                    ❯
                 </button>
              </>
          )}

          {activeTab === 'photos' ? (
             <img loading="lazy" src={getMediaAbsoluteUrl(lightbox.mediaUrl)} alt={lightbox.title} style={{ maxWidth: '90%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '4px', userSelect: 'none' }} onClick={(e) => e.stopPropagation()} />
          ) : (
             <iframe 
                width="80%" 
                height="70%" 
                src={`https://www.youtube.com/embed/${extractYoutubeId(lightbox.mediaUrl)}?autoplay=1`} 
                title={lightbox.title} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                style={{ borderRadius: '8px', maxWidth: '1000px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                onClick={(e) => e.stopPropagation()}
             ></iframe>
          )}
          {lightbox.description && <p className={css.lightboxCaption} style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.1rem', maxWidth: '800px', textAlign: 'center', lineHeight: '1.5', fontFamily: 'inherit' }}>{lightbox.description}</p>}
          <button style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  );
};

export default Gallery;
