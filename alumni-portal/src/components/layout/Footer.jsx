import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ExternalLink, Share2, Rss, Mail, Phone, MapPin } from 'lucide-react';
import api from '../../lib/api';
import css from './Footer.module.css';

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({ address: '', phone: '', email: '' });

  useEffect(() => {
    api.get('/website-content').then(data => {
      if (data) setContactInfo({ address: data.officeAddress, phone: data.officePhone, email: data.officeEmail });
    }).catch(console.error);
  }, []);
  return (
    <footer className={css.footer}>
      <div className={`container ${css.container}`}>
        
        <div className={css.brandSection}>
          <h2 className={css.brandTitle}>DU MPMIS</h2>
          <p className={css.brandDesc}>
            Connecting alumni, fostering excellence, and building a community that lasts a lifetime. Join us in shaping the future.
          </p>
          <div className={css.socialLinks}>
            <a href="#" className={css.socialIcon} aria-label="Website"><Globe size={20} /></a>
            <a href="#" className={css.socialIcon} aria-label="External"><ExternalLink size={20} /></a>
            <a href="#" className={css.socialIcon} aria-label="Share"><Share2 size={20} /></a>
            <a href="#" className={css.socialIcon} aria-label="Feed"><Rss size={20} /></a>
          </div>
        </div>

        <div className={css.linkGroup}>
          <h3 className={css.groupTitle}>Quick Links</h3>
          <ul className={css.linkList}>
            <li><Link to="/history">About Us</Link></li>
            <li><Link to="/directory">Alumni Directory</Link></li>
            <li><Link to="/events">Events & Reunions</Link></li>
            <li><Link to="/careers">Career Board</Link></li>
            <li><Link to="/notices">Notices</Link></li>
          </ul>
        </div>

        <div className={css.linkGroup}>
          <h3 className={css.groupTitle}>Resources</h3>
          <ul className={css.linkList}>
            <li><Link to="/constitution">Constitution</Link></li>
            <li><Link to="/gallery">Photo Gallery</Link></li>
            <li><Link to="/blog">Alumni Blogs</Link></li>
            <li><Link to="#">Alumni Needs</Link></li>
            <li><Link to="/elections">Committee Elections</Link></li>
          </ul>
        </div>

        <div className={css.contactSection}>
          <h3 className={css.groupTitle}>Contact Info</h3>
          <ul className={css.contactList}>
            <li>
              <MapPin size={18} className={css.contactIcon} />
              <span>{contactInfo.address}</span>
            </li>
            <li>
              <Phone size={18} className={css.contactIcon} />
              <span>{contactInfo.phone}</span>
            </li>
            <li>
              <Mail size={18} className={css.contactIcon} />
              <span>{contactInfo.email}</span>
            </li>
          </ul>
        </div>

      </div>
      
      <div className={css.bottomBar}>
        <div className={`container ${css.bottomContainer}`}>
          <p>&copy; {new Date().getFullYear()} DU MPMIS. All rights reserved.</p>
          <div className={css.legalLinks}>
            <a href="https://talha.portfolio.bdcorex.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>Designed & Developed by</span>
              <strong style={{ color: 'var(--accent-color)' }}>Talha</strong>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
