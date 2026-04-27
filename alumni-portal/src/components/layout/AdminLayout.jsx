import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminLayout.module.css';
import { 
  LayoutDashboard, Users, Calendar, BookOpen, 
  BellRing, LogOut, Settings, Image, Info, Mail, Briefcase, Vote 
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout, loading } = useAuth();
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Admin Portal</h2>
        </div>
        <nav className={styles.sidebarNav}>
          <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem} end>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Users size={20} /> Manage Users
          </NavLink>
          <NavLink to="/admin/events" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Calendar size={20} /> Manage Events
          </NavLink>
          <NavLink to="/admin/careers" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Briefcase size={20} /> Manage Careers
          </NavLink>
          <NavLink to="/admin/elections" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Vote size={20} /> Manage Elections
          </NavLink>
          <NavLink to="/admin/about" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Info size={20} /> Manage About
          </NavLink>
          <NavLink to="/admin/gallery" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Image size={20} /> Manage Gallery
          </NavLink>
          <NavLink to="/admin/members" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Users size={20} /> Manage Members
          </NavLink>
          <NavLink to="/admin/blogs" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <BookOpen size={20} /> Manage Blogs
          </NavLink>
          <NavLink to="/admin/notices" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <BellRing size={20} /> Manage Notices
          </NavLink>
          <NavLink to="/admin/publications" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <BookOpen size={20} /> Manage Publications
          </NavLink>
          <NavLink to="/admin/messages" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Mail size={20} /> Manage Messages
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <Settings size={20} /> System Settings
          </NavLink>
        </nav>
        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.topHeader}>
          <div className={styles.headerTitle}>
            <h3>DU MPMIS Alumni Admin</h3>
          </div>
          <div className={styles.headerUser}>
            <span className={styles.userName}>{user.fullName}</span>
            {user.profilePhoto && <img loading="lazy" src={user.profilePhoto} alt="Profile" className={styles.avatar} />}
          </div>
        </header>
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
