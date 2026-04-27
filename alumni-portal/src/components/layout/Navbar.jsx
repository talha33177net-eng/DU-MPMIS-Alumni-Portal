import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, ChevronDown, Mail } from 'lucide-react';
import api from '../../lib/api';
import css from './Navbar.module.css';

const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'About', children: [
      { label: 'History', path: '/history' },
      { label: 'Mission & Vision', path: '/mission-vision' },
      { label: 'Constitution', path: '/constitution' },
      { label: 'EC Members', path: '/committee' },
    ]
  },
  {
    label: 'Members', children: [
      { label: 'Life Members', path: '/members/life' },
      { label: 'General Members', path: '/members/general' },
      { label: 'In Memoriam', path: '/in-memoriam' },
      { label: 'Apply for Membership', path: '/apply' },
    ]
  },
  {
    label: 'Publications', children: [
      { label: 'E-Directory', path: '/directory' },
      { label: 'Notice Board', path: '/notices' },
      { label: 'AGM Reports', path: '/publications/AGM_Reports' },
      { label: 'Finance Reports', path: '/publications/Finance_Reports' },
      { label: 'Souvenirs', path: '/publications/Souvenirs' },
    ]
  },
  { label: 'Events', path: '/events' },
  {
    label: 'Gallery', children: [
      { label: 'Photo Gallery', path: '/gallery/photos' },
      { label: 'Video Gallery', path: '/gallery/videos' },
    ]
  },
  { label: 'Career', path: '/careers' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact Us', path: '/contact' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const dropdownTimeout = useRef(null);
  const [officeEmail, setOfficeEmail] = useState('');

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => { setIsOpen(false); setMobileExpanded(null); };

  useEffect(() => {
    api.get('/website-content')
      .then(res => {
         const content = res?.data || res;
         if (content?.officeEmail) setOfficeEmail(content.officeEmail);
      })
      .catch(console.error);
  }, []);

  const handleDropdownEnter = (label) => {
    clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };
  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setOpenDropdown(null); closeMenu(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  return (
    <>
      {/* Top Bar */}
      <div className={css.topBar}>
        <div className={`container ${css.topBarInner}`}>
          <span className={css.topBarEmail}><Mail size={14} /> {officeEmail || 'info@mpmis.com'}</span>
          <div className={css.topBarRight}>
            {user ? (
              <>
                <Link to="/dashboard" className={css.topBarLink}>Profile</Link>
                <button onClick={handleLogout} className={css.topBarLink}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className={css.topBarAuthBtn}>Login</Link>
                <Link to="/register" className={css.topBarAuthBtn}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={css.navbar}>
        <div className={`container ${css.navContainer}`}>
          <Link to="/" className={css.brand} onClick={closeMenu}>
            <img src="/du_mpmis_logo.jpeg" alt="DU MPMIS Logo" className={css.brandLogo} />
            <span className={css.brandText}>DU MPMIS</span>
          </Link>

          {/* Desktop Menu */}
          <div className={css.desktopMenu}>
            {navItems.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className={css.dropdownWrapper}
                  onMouseEnter={() => handleDropdownEnter(item.label)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button className={css.dropdownTrigger}>
                    {item.label} <ChevronDown size={14} className={openDropdown === item.label ? css.chevronOpen : ''} />
                  </button>
                  {openDropdown === item.label && (
                    <div className={css.dropdownMenu}>
                      {item.children.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={css.dropdownItem}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => isActive ? css.activeLink : css.link}
                  end={item.path === '/'}
                >
                  {item.label}
                </NavLink>
              )
            )}
          </div>

          {/* Mobile Toggle */}
          <button className={css.mobileToggle} onClick={toggleMenu} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={css.mobileMenu}>
            {navItems.map((item) =>
              item.children ? (
                <div key={item.label} className={css.mobileDropdown}>
                  <button
                    className={css.mobileDropdownTrigger}
                    onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                  >
                    {item.label}
                    <ChevronDown size={16} className={mobileExpanded === item.label ? css.chevronOpen : ''} />
                  </button>
                  {mobileExpanded === item.label && (
                    <div className={css.mobileDropdownItems}>
                      {item.children.map((child) => (
                        <Link key={child.path} to={child.path} className={css.mobileSubLink} onClick={closeMenu}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => isActive ? css.activeLink : css.link}
                  onClick={closeMenu}
                  end={item.path === '/'}
                >
                  {item.label}
                </NavLink>
              )
            )}
            <div className={css.mobileAuth}>
              {user ? (
                <>
                  <Link to="/dashboard" className={css.mobileProfileBtn} onClick={closeMenu}>Dashboard</Link>
                  <button onClick={handleLogout} className={css.mobileLogoutBtn}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className={css.mobileLoginBtn} onClick={closeMenu}>Login</Link>
                  <Link to="/register" className={css.mobileRegisterBtn} onClick={closeMenu}>Join Association</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
