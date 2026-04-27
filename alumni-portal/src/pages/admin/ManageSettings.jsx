import { useState, useEffect } from 'react';
import { Mail, KeyRound, Save } from 'lucide-react';
import api from '../../lib/api';

const ManageSettings = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/website-content');
      setConfig(res || {});
    } catch (error) {
      console.error(error);
      alert('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.post('/website-content', config);
      alert(res.message || 'Settings updated successfully');
    } catch (error) {
      alert(error.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading Settings...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <Mail size={28} /> System Configurations & Contact Info
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Configure the default SMTP parameters below, and dictate the official structural contact details representing the alumni association.
        </p>
      </div>

      <form onSubmit={handleSave} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* CARD 1: Contact Details */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Physical Organization Details</h3>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Official Office Address</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 0.5rem' }}>
                <input
                  type="text"
                  name="officeAddress"
                  value={config.officeAddress || ''}
                  onChange={handleChange}
                  placeholder="e.g. Dhaka University Campus, Dhaka 1000"
                  style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'transparent', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Official Phone Number</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 0.5rem' }}>
                <input
                  type="text"
                  name="officePhone"
                  value={config.officePhone || ''}
                  onChange={handleChange}
                  placeholder="e.g. +880 1234 567890"
                  style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'transparent', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Official Public Email</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 0.5rem' }}>
                <input
                  type="email"
                  name="officeEmail"
                  value={config.officeEmail || ''}
                  onChange={handleChange}
                  placeholder="e.g. info@mpmis.com"
                  style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'transparent', outline: 'none' }}
                />
              </div>
            </div>

          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={20} /> {saving ? 'Saving...' : 'Save Contact Profile'}
            </button>
          </div>
        </div>

        {/* CARD 2: Email System Configs */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Advanced Email System Settings</h3>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>SMTP Dedicated Delivery Email</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 0.5rem' }}>
              <Mail size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                name="smtpSenderEmail"
                value={config.smtpSenderEmail || ''}
                onChange={handleChange}
                placeholder="e.g. notifications@alumniportal.com"
                autoComplete="off"
                spellCheck="false"
                style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'transparent', outline: 'none' }}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
              We recommend utilizing standard provider settings (e.g. Google Gmail app configs).
            </small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>SMTP Validated App Password</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0 0.5rem' }}>
              <KeyRound size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                type="password"
                name="smtpSenderAppPassword"
                value={config.smtpSenderAppPassword || ''}
                onChange={handleChange}
                placeholder="••••••••••••••••"
                autoComplete="new-password"
                spellCheck="false"
                style={{ width: '100%', padding: '0.8rem', border: 'none', background: 'transparent', outline: 'none' }}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
              If you are using Google, generate a 16-digit 'App Password' exclusively for this capability.
            </small>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={20} /> {saving ? 'Saving...' : 'Save Email Configurations'}
            </button>
          </div>
        </div>

        {/* CARD 3: Welcome Block Configuration */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Home Page: Welcome Section</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '-1rem' }}>
            Configure the dynamic Welcome widget on your front page including the asymmetric overlapping imagery.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem' }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Primary Tall Image</label>
                   {config.aboutImage ? (
                      <img loading="lazy" src={config.aboutImage.startsWith('http') ? config.aboutImage : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${config.aboutImage}`} alt="main" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                   ) : (
                      <div style={{ width: '100%', height: '180px', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Main Image Empty</div>
                   )}
                   <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const fd = new FormData(); fd.append('file', file);
                      try {
                          const uploadRes = await api.post('/website-content/upload?purpose=home', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                          const imgPath = uploadRes.data?.data || uploadRes.data || uploadRes;
                          setConfig({...config, aboutImage: imgPath});
                      } catch (err) { alert('Upload failed'); }
                   }} style={{ marginTop: '0.5rem', width: '100%' }} />
                </div>

                <div>
                   <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Secondary Accent Image</label>
                   {config.heroBannerImage ? (
                      <img loading="lazy" src={config.heroBannerImage.startsWith('http') ? config.heroBannerImage : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${config.heroBannerImage}`} alt="sub" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                   ) : (
                      <div style={{ width: '100%', height: '100px', background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Accent Image Empty</div>
                   )}
                   <input type="file" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const fd = new FormData(); fd.append('file', file);
                      try {
                          const uploadRes = await api.post('/website-content/upload?purpose=home', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                          const imgPath = uploadRes.data?.data || uploadRes.data || uploadRes;
                          setConfig({...config, heroBannerImage: imgPath});
                      } catch (err) { alert('Upload failed'); }
                   }} style={{ marginTop: '0.5rem', width: '100%' }} />
                </div>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Section Title</label>
                  <input type="text" name="aboutTitle" value={config.aboutTitle || ''} onChange={handleChange} placeholder="e.g. Uniting Generations of Media Professionals"
                         style={{ width: '100%', padding: '0.8rem', outline:'none', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Legacy (Years)</label>
                    <input type="number" name="yearsActive" value={config.yearsActive || 0} onChange={handleChange} placeholder="50"
                           style={{ width: '100%', padding: '0.6rem', outline:'none', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-secondary)', fontSize: '0.9rem' }} />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Welcome Paragraph Data</label>
                  <textarea name="aboutContent" value={config.aboutContent || ''} onChange={handleChange} placeholder="e.g. The Dhaka University Mass Communication..."
                            style={{ flex: 1, padding: '0.8rem', outline:'none', border: '1px solid var(--border-color)', borderRadius: '6px', resize: 'none', background: 'var(--bg-secondary)' }} />
                </div>
             </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={20} /> {saving ? 'Saving...' : 'Save Welcome Section'}
            </button>
          </div>
        </div>

        {/* CARD 4: Homepage Banners */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Homepage Banners Configuration</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '-1rem' }}>Upload images and define textual overlays for the primary carousel on the home page.</p>
          
          {(() => {
             let banners = [];
             try { banners = config.heroBannersJson ? JSON.parse(config.heroBannersJson) : []; } catch { }
             return (
               <div>
                 {banners.map((banner, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-secondary)', padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <strong style={{fontSize: '1.1rem'}}>Slide {idx + 1}</strong>
                          <button type="button" onClick={() => {
                             const newBanners = [...banners]; newBanners.splice(idx, 1);
                             setConfig({...config, heroBannersJson: JSON.stringify(newBanners)});
                          }} className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444', padding: '0.25rem 0.5rem' }}>Remove Slide</button>
                       </div>
                       
                       <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
                          <div>
                             {banner.image ? (
                                <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${banner.image}`} alt="slide" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                             ) : (
                                <div style={{ width: '100%', height: '140px', background: 'var(--bg-main)', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: 'var(--text-muted)' }}>No Image</div>
                             )}
                             <input type="file" accept="image/*" onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                const fd = new FormData(); fd.append('file', file);
                                try {
                                    const uploadRes = await api.post('/website-content/upload?purpose=home', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                                    const imgPath = uploadRes.data?.data || uploadRes.data || uploadRes;
                                    const newBanners = [...banners]; newBanners[idx].image = imgPath;
                                    setConfig({...config, heroBannersJson: JSON.stringify(newBanners)});
                                } catch (err) { alert('Upload failed'); }
                             }} style={{ marginTop: '0.8rem', fontSize: '0.85rem', width: '100%' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                             <input type="text" placeholder="Hero Title (e.g. Welcome to Alumni Portal)" value={banner.title || ''} onChange={(e) => {
                                const newBanners = [...banners]; newBanners[idx].title = e.target.value;
                                setConfig({...config, heroBannersJson: JSON.stringify(newBanners)});
                             }} style={{ padding: '0.8rem', outline:'none', border: '1px solid var(--border-color)', borderRadius: '4px', width: '100%' }} autoComplete="off" />
                             
                             <textarea placeholder="Hero Subtitle (e.g. Connecting graduates worldwide.)" value={banner.subtitle || ''} onChange={(e) => {
                                const newBanners = [...banners]; newBanners[idx].subtitle = e.target.value;
                                setConfig({...config, heroBannersJson: JSON.stringify(newBanners)});
                             }} style={{ padding: '0.8rem', outline:'none', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'vertical', minHeight: '80px', width: '100%' }}></textarea>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 <button type="button" onClick={() => {
                    const newBanners = [...banners, { image: '', title: '', subtitle: '', buttons: [{ label: 'Join Us', link: '/register', primary: true }] }];
                    setConfig({...config, heroBannersJson: JSON.stringify(newBanners)});
                 }} className="btn btn-secondary" style={{ width: '100%', padding: '1rem', borderStyle: 'dashed', borderRadius: '8px' }}>
                    + Add New Carousel Slide
                 </button>
               </div>
             )
          })()}

          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1 }}
            >
              <Save size={20} /> {saving ? 'Saving...' : 'Save Carousel Live'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManageSettings;

