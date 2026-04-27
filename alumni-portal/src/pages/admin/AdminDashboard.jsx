import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalBlogs: 0,
    totalNotices: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all generic entities
        const [usersRes, eventsRes, blogsRes, noticesRes] = await Promise.all([
          api.get('/admin/users'), 
          api.get('/events'),
          api.get('/blogs'),
          api.get('/notices')
        ]);

        // Calculate totals dynamically safely tracking array versus paginated obj
        const uCount = Array.isArray(usersRes) ? usersRes.length : (usersRes?.total || usersRes?.data?.length || 0);
        const eCount = Array.isArray(eventsRes) ? eventsRes.length : (eventsRes?.total || eventsRes?.data?.length || 0);
        const bCount = Array.isArray(blogsRes) ? blogsRes.length : (blogsRes?.total || blogsRes?.data?.length || 0);
        const nCount = Array.isArray(noticesRes) ? noticesRes.length : (noticesRes?.total || noticesRes?.data?.length || 0);

        setStats({
          totalUsers: uCount,
          totalEvents: eCount,
          totalBlogs: bCount,
          totalNotices: nCount
        });

        // Parse recent items safely
        const eData = Array.isArray(eventsRes) ? eventsRes : (eventsRes?.data || []);
        const bData = Array.isArray(blogsRes) ? blogsRes : (blogsRes?.data || []);
        const nData = Array.isArray(noticesRes) ? noticesRes : (noticesRes?.data || []);

        // Aggregate items created recently into an activity timeline
        let aggregated = [];
        eData.slice(0, 3).forEach(x => aggregated.push({ ...x, type: 'Event', date: new Date(x.createdAt || x.date || Date.now()) }));
        bData.slice(0, 3).forEach(x => aggregated.push({ ...x, type: 'Blog', date: new Date(x.createdAt || Date.now()) }));
        nData.slice(0, 3).forEach(x => aggregated.push({ ...x, type: 'Notice', date: new Date(x.createdAt || x.publishDate || Date.now()) }));

        // Sort descending by date
        aggregated.sort((a,b) => b.date - a.date);
        
        setRecentActivity(aggregated.slice(0, 5));

      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="admin-header-flex">
        <h1 style={{color: 'var(--text-primary)', margin: 0}}>Admin Dashboard</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Users" value={stats.totalUsers} color="var(--primary-color)" loading={loading} />
        <StatCard title="Total Events" value={stats.totalEvents} color="#10b981" loading={loading} />
        <StatCard title="Total Blogs" value={stats.totalBlogs} color="#f59e0b" loading={loading} />
        <StatCard title="Active Notices" value={stats.totalNotices} color="#ef4444" loading={loading} />
      </div>

      <div className="admin-card">
        <h3 style={{marginTop: 0, color: 'var(--text-primary)', marginBottom: '1.5rem'}}>Recent Activity</h3>
        
        {loading ? (
           <p style={{color: 'var(--text-muted)'}}>Loading logs...</p>
        ) : recentActivity.length === 0 ? (
           <p style={{color: 'var(--text-muted)'}}>No recent activity found.</p>
        ) : (
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             {recentActivity.map((item, idx) => (
               <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)' }}>
                  <div>
                     <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: item.type === 'Event' ? '#10b981' : item.type === 'Blog' ? '#f59e0b' : '#ef4444', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'block' }}>
                       New {item.type}
                     </span>
                     <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.title}</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                     {format(item.date, 'MMM dd, yyyy - hh:mm a')}
                  </div>
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, loading }) => (
  <div className="admin-card" style={{ borderTop: `4px solid ${color}`, marginBottom: 0 }}>
    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>{title}</h4>
    {loading ? (
      <div style={{ height: '36px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
    ) : (
      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{value}</div>
    )}
  </div>
);

export default AdminDashboard;
