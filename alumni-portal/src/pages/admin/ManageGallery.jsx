import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Image, Video, UploadCloud, X, Folder } from 'lucide-react';

const ManageGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Photo"); // Photo or Video

  // Video specific state
  const [editId, setEditId] = useState(null);
  
  // Photo specific state (Album level)
  const [editingAlbumName, setEditingAlbumName] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);

  const [formData, setFormData] = useState({
    title: '', description: '', mediaUrls: [], // For videos
    newMediaUrls: [], // For photos
    album: '', isPublished: true, sortOrder: 0
  });

  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'Photo' ? '/gallery/photos' : '/gallery/videos';
      const res = await api.get(`${endpoint}?per_page=1000`);
      if (res.data?.data && Array.isArray(res.data.data)) setItems(res.data.data);
      else if (res.data && Array.isArray(res.data)) setItems(res.data);
      else setItems(Array.isArray(res) ? res : []);
    } catch (err) {
      toast.error(`Failed to load ${activeTab.toLowerCase()}s`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleOpenVideoModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      setFormData({
        title: item.title || '', description: item.description || '',
        mediaUrls: [item.mediaUrl || ''], newMediaUrls: [],
        album: '', isPublished: item.isPublished !== undefined ? item.isPublished : true, sortOrder: item.sortOrder || 0
      });
    } else {
      setEditId(null);
      setFormData({
        title: '', description: '', mediaUrls: [], newMediaUrls: [],
        album: '', isPublished: true, sortOrder: 0
      });
    }
    setShowModal(true);
  };

  const handleOpenAlbumModal = (albumName = null, albumItems = []) => {
      if (albumName) {
          setEditingAlbumName(albumName);
          setExistingPhotos(albumItems);
          const first = albumItems[0];
          setFormData({
              album: albumName, description: first?.description || '', title: albumName,
              mediaUrls: [], newMediaUrls: [], isPublished: first?.isPublished !== undefined ? first.isPublished : true, sortOrder: 0
          });
      } else {
          setEditingAlbumName(null);
          setExistingPhotos([]);
          setFormData({
              album: '', description: '', title: '',
              mediaUrls: [], newMediaUrls: [], isPublished: true, sortOrder: 0
          });
      }
      setShowModal(true);
  };

  const convertToWebP = (file) => {
      return new Promise((resolve) => {
          if (!file.type.startsWith('image/')) {
              resolve(file); // Ignore videos
              return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
              const img = new globalThis.Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0);
                  canvas.toBlob((blob) => {
                      if (!blob) resolve(file);
                      else {
                          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                              type: 'image/webp'
                          });
                          resolve(newFile);
                      }
                  }, 'image/webp', 0.85); // Compress at 85% fidelity
              };
              img.onerror = () => resolve(file);
              img.src = e.target.result;
          };
          reader.onerror = () => resolve(file);
          reader.readAsDataURL(file);
      });
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedPaths = [];

    for (let i = 0; i < files.length; i++) {
        const rawFile = files[i];
        
        // Client-side WebP compression conversion pipeline
        const file = await convertToWebP(rawFile);
        
        const fd = new FormData();
        fd.append('file', file);
        try {
          const res = await api.post('/gallery/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          const path = typeof res.data === 'string' ? res.data : (res.data?.data || res.data || res);
          uploadedPaths.push(path);
        } catch (err) {
          toast.error(`Failed to upload ${file.name}`);
        }
    }
    
    if (uploadedPaths.length > 0) {
        setFormData(prev => ({ ...prev, newMediaUrls: [...prev.newMediaUrls, ...uploadedPaths] }));
        toast.success(`Successfully staged ${uploadedPaths.length} file(s)`);
    }
    setUploading(false);
  };

  const deleteSinglePhoto = async (photoId) => {
      if (!window.confirm("Delete this photo from the album?")) return;
      try {
          await api.delete(`/gallery/${photoId}`);
          setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
          toast.success("Photo deleted");
          fetchItems();
      } catch {
          toast.error("Failed to delete photo");
      }
  };

  const handleVideoSubmit = async () => {
      if (formData.mediaUrls.length === 0 || !formData.mediaUrls[0]) return toast.error("YouTube Link is required.");
      if (editId) {
        await api.put(`/gallery/${editId}`, { ...formData, mediaType: 'Video', mediaUrl: formData.mediaUrls[0] });
        toast.success('Video updated');
      } else {
        await api.post(`/gallery`, { ...formData, mediaType: 'Video', mediaUrl: formData.mediaUrls[0] });
        toast.success('Video added');
      }
  };

  const handleAlbumSubmit = async () => {
      if (!formData.album || formData.album.trim() === '') return toast.error("Album Name is required.");
      const targetAlbum = formData.album;
      
      // If editing album metadata, apply changes to all existing photos in album
      if (editingAlbumName) {
          for (const p of existingPhotos) {
              await api.put(`/gallery/${p.id}`, {
                  title: targetAlbum, album: targetAlbum, description: formData.description,
                  isPublished: formData.isPublished, mediaType: 'Photo', mediaUrl: p.mediaUrl, sortOrder: p.sortOrder
              });
          }
      }

      // Append any newly uploaded photos
      if (formData.newMediaUrls.length > 0) {
          for (const url of formData.newMediaUrls) {
              await api.post('/gallery', {
                  title: targetAlbum, album: targetAlbum, description: formData.description,
                  isPublished: formData.isPublished, mediaType: 'Photo', mediaUrl: url
              });
          }
      }

      toast.success(editingAlbumName ? "Album updated successfully" : "Album created successfully");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'Video') await handleVideoSubmit();
      else await handleAlbumSubmit();
      
      setShowModal(false);
      fetchItems();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const getMediaAbsoluteUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('http')) return url;
      const baseUrl = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5136';
      return `${baseUrl}${url}`;
  };

  const handleDeleteAlbum = async (albumName, albumItems) => {
    if (window.confirm(`Are you absolutely sure you want to delete the entire album "${albumName}" (${albumItems.length} photos)?`)) {
      try {
        for (const item of albumItems) {
            await api.delete(`/gallery/${item.id}`);
        }
        toast.success('Album deleted successfully');
        fetchItems();
      } catch (err) {
        toast.error('Failed to delete album');
      }
    }
  };

  const handleDeleteVideo = async (id) => {
      if(window.confirm('Delete this video?')) {
          try {
              await api.delete(`/gallery/${id}`);
              toast.success('Video deleted');
              fetchItems();
          } catch { toast.error('Failed to delete video'); }
      }
  };

  // Group photos by album
  const groupedAlbums = {};
  if (activeTab === 'Photo') {
      items.forEach(item => {
          const a = item.album || 'Uncategorized Album';
          if (!groupedAlbums[a]) groupedAlbums[a] = [];
          groupedAlbums[a].push(item);
      });
  }
  const albumNames = Object.keys(groupedAlbums);

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <Image size={28} /> Manage Gallery
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Organize and publish visual media for the alumni community.</p>
        </div>
        <button onClick={() => activeTab === 'Photo' ? handleOpenAlbumModal() : handleOpenVideoModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add {activeTab === 'Photo' ? 'Album' : 'Video'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '8px' }}>
         <button 
           onClick={() => setActiveTab('Photo')}
           style={{ flex: 1, padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'Photo' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'Photo' ? 'white' : 'var(--text-primary)', transition: 'all 0.2s' }}
         >
           <Image size={18} /> Manage Photos
         </button>
         <button 
           onClick={() => setActiveTab('Video')}
           style={{ flex: 1, padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', background: activeTab === 'Video' ? 'var(--accent-color)' : 'transparent', color: activeTab === 'Video' ? 'white' : 'var(--text-primary)', transition: 'all 0.2s' }}
         >
           <Video size={18} /> Manage Videos
         </button>
      </div>

      <div className="admin-card">
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading media...</p> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{activeTab === 'Photo' ? 'Album Cover' : 'Preview'}</th>
                <th>{activeTab === 'Photo' ? 'Album Properties' : 'Video Information'}</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'Photo' ? (
                  albumNames.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No albums found.</td></tr>
                  ) : albumNames.map(albumName => {
                      const albumItems = groupedAlbums[albumName];
                      const firstItem = albumItems[0];
                      return (
                        <tr key={albumName}>
                          <td>
                            <div style={{ width: '80px', height: '60px', background: '#000', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <img loading="lazy" src={getMediaAbsoluteUrl(firstItem.mediaUrl)} alt={albumName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display='none'} />
                                <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,0.8)', color: 'white', fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '4px 0 0 0', fontWeight: 'bold' }}>
                                    {albumItems.length}
                                </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Folder size={16} color="var(--accent-color)" /> {albumName}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{firstItem.description || 'No description provided'}</div>
                          </td>
                          <td>
                            <div style={{ color: firstItem.isPublished ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                              {firstItem.isPublished ? 'Published' : 'Draft'}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleOpenAlbumModal(albumName, albumItems)} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>
                                <Edit size={16} />
                              </button>
                              <button onClick={() => handleDeleteAlbum(albumName, albumItems)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                  })
              ) : (
                  items.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No videos found.</td></tr>
                  ) : items.map(item => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ width: '80px', height: '60px', background: '#000', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.mediaUrl && (item.mediaUrl.includes('youtube.com') || item.mediaUrl.includes('youtu.be')) ? (
                               <img loading="lazy" src={`https://img.youtube.com/vi/${item.mediaUrl.match(/(?:v=|youtu\.be\/)([^&]+)/)?.[1]}/default.jpg`} alt="Video Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : <Video size={24} color="#888" />}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{item.title}</div>
                      </td>
                      <td>
                        <div style={{ color: item.isPublished ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>
                          {item.isPublished ? 'Published' : 'Draft'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleOpenVideoModal(item)} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeleteVideo(item.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '700px', maxHeight: '100%', overflowY: 'auto', backgroundColor: 'var(--surface-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--surface-color)', zIndex: 10 }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                {activeTab === 'Photo' ? (editingAlbumName ? 'Manage Album' : 'Create New Album') : (editId ? 'Edit Video' : 'Add New Video')}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={24}/></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {activeTab === 'Video' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>YouTube Video Link *</label>
                    <input
                      required
                      type="url"
                      value={formData.mediaUrls[0] || ''}
                      onChange={e => setFormData({...formData, mediaUrls: [e.target.value]})}
                      className="form-control"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Title *</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="form-control" placeholder="E.g., Batch Reunion Video" />
                  </div>
                </>
              )}

              {activeTab === 'Photo' && (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Album Name *</label>
                    <input required type="text" value={formData.album} onChange={e => setFormData({...formData, album: e.target.value})} className="form-control" placeholder="E.g., Reunion 2024" />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Album Description (Optional)</label>
                    <textarea rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-control"></textarea>
                  </div>

                  {editingAlbumName && existingPhotos.length > 0 && (
                    <div style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--primary-color)' }}>Existing Photos in this Album</label>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {existingPhotos.map(p => (
                          <div key={p.id} style={{ position: 'relative', width: '80px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img loading="lazy" src={getMediaAbsoluteUrl(p.mediaUrl)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display='none'} />
                            <button type="button" onClick={() => deleteSinglePhoto(p.id)} style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '0 0 0 4px', cursor: 'pointer', padding: '0.15rem' }}>
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ padding: '1.5rem', border: '2px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', background: 'var(--bg-color)' }}>
                    {uploading ? (
                      <div style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Uploading files to server...</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        {formData.newMediaUrls.length > 0 && (
                          <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <UploadCloud size={20} /> {formData.newMediaUrls.length} File(s) Staged
                          </div>
                        )}
                        <label style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <div style={{ marginBottom: '0.5rem' }}><Image size={32} color="var(--accent-color)" /></div>
                          Click to Browse & Upload {formData.newMediaUrls.length > 0 ? 'More' : 'Multiple'} Photos
                          <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e.target.files)} style={{ display: 'none' }} />
                        </label>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} style={{ width: '1.1rem', height: '1.1rem' }} />
                  Publish immediately
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={uploading} className="btn btn-primary">{editingAlbumName ? 'Save Album' : activeTab === 'Photo' ? 'Create Album' : (editId ? 'Save Changes' : 'Add Video')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGallery;

