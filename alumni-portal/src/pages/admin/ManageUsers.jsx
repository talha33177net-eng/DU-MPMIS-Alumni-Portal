import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Shield, ShieldAlert, CheckCircle, XCircle, Trash2, ShieldCheck } from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?page=${page}&per_page=10`);
      if (res.data && Array.isArray(res.data)) {
        setUsers(res.data);
        const calcTotalPages = Math.ceil((res.total || 0) / (res.perPage || 10));
        setTotalPages(calcTotalPages || 1);
      } else {
        setUsers(Array.isArray(res) ? res : []);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}/toggle-active`);
      toast.success(currentStatus ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.put(`/admin/users/${id}/verify`);
      toast.success('User verified');
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to verify user');
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, `"${newRole}"`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        toast.success('User deleted');
        fetchUsers();
      } catch (err) {
        toast.error(err.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <ShieldCheck size={28} /> Manage Users
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Review and manage user accounts and system permissions.</p>
        </div>
      </div>

      <div className="admin-card" style={{overflowX: 'auto'}}>
        {loading ? (
          <p style={{color: 'var(--text-muted)'}}>Loading users...</p>
        ) : (
          <>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                        <img loading="lazy" 
                          src={u.profilePhoto ? (u.profilePhoto.startsWith('http') ? u.profilePhoto : `${import.meta.env.PROD ? "" : "http://localhost:5001"}${u.profilePhoto}`) : 'https://via.placeholder.com/40'} 
                          alt={u.fullName} 
                          style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}} 
                        />
                        <div>
                          <div style={{fontWeight: '600', color: 'var(--text-primary)'}}>{u.fullName}</div>
                          <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{u.email}</div>
                          <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Batch: {u.batch}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select 
                        value={u.role} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)',
                          border: '1px solid rgba(255,255,255,0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px'
                        }}
                      >
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                          color: u.isVerified ? '#10b981' : '#f59e0b', background: u.isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          padding: '0.25rem 0.5rem', borderRadius: '1rem', width: 'fit-content'
                        }}>
                          {u.isVerified ? <CheckCircle size={12}/> : <ShieldAlert size={12}/>}
                          {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem',
                          color: u.isActive ? '#3b82f6' : '#ef4444', background: u.isActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          padding: '0.25rem 0.5rem', borderRadius: '1rem', width: 'fit-content'
                        }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        {!u.isVerified && (
                          <button 
                            onClick={() => handleVerify(u.id)}
                            style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}
                            title="Verify User"
                          >
                            <Shield size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          style={{
                            background: u.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                            color: u.isActive ? '#ef4444' : '#3b82f6', 
                            border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'
                          }}
                          title={u.isActive ? "Deactivate User" : "Activate User"}
                        >
                          {u.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(u.id)}
                          style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer'}}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div style={{display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem'}}>
                <button 
                  disabled={page === 1} 
                  onClick={() => setPage(p => p - 1)}
                  style={{padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer'}}
                >
                  Prev
                </button>
                <span style={{padding: '0.5rem', color: 'var(--text-muted)'}}>Page {page} of {totalPages}</span>
                <button 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => p + 1)}
                  style={{padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer'}}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;

