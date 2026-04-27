import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Vote, Plus, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const STATUS_LABELS = {
  Upcoming:       { label: 'Upcoming',          color: '#6b7280' },
  NominationOpen: { label: 'Nominations Open',  color: '#f59e0b' },
  VotingOpen:     { label: 'Voting Open',        color: '#10b981' },
  Completed:      { label: 'Completed',          color: '#191970' },
};

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'Upcoming',
  nominationStart: '',
  nominationEnd: '',
  votingStart: '',
  votingEnd: '',
  resultDate: '',
  isPublished: true,
};

const ManageElections = () => {
  const [elections, setElections]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editId, setEditId]             = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);
  const [expandedId, setExpandedId]     = useState(null);
  const [candidates, setCandidates]     = useState({});
  const [candLoading, setCandLoading]   = useState({});

  useEffect(() => { fetchElections(); }, []);

  const fetchElections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/elections/admin/all');
      setElections(res.data?.data || res.data?.items || []);
    } catch (err) {
      toast.error('Failed to load elections: ' + (err.response?.status || err.message));
    } finally {
      setLoading(false);
    }
  };

  const expandElection = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (candidates[id]) return;
    setCandLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await api.get(`/elections/${id}/admin/candidates`);
      setCandidates(prev => ({ ...prev, [id]: res.data || [] }));
    } catch {
      toast.error('Failed to load candidates');
    } finally {
      setCandLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleCandidateStatus = async (electionId, candidateId, status) => {
    try {
      await api.put(`/elections/candidates/${candidateId}/status`, `"${status}"`, {
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success(`Application ${status}`);
      // Refresh candidates for this election
      const res = await api.get(`/elections/${electionId}/admin/candidates`);
      setCandidates(prev => ({ ...prev, [electionId]: res.data || [] }));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (election) => {
    setEditId(election.id);
    setForm({
      title:          election.title || '',
      description:    election.description || '',
      status:         election.status || 'Upcoming',
      nominationStart: election.nominationStart ? election.nominationStart.substring(0,10) : '',
      nominationEnd:   election.nominationEnd   ? election.nominationEnd.substring(0,10)   : '',
      votingStart:     election.votingStart     ? election.votingStart.substring(0,10)     : '',
      votingEnd:       election.votingEnd       ? election.votingEnd.substring(0,10)       : '',
      resultDate:      election.resultDate      ? election.resultDate.substring(0,10)      : '',
      isPublished:     election.isPublished ?? true,
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      nominationStart: form.nominationStart || null,
      nominationEnd:   form.nominationEnd   || null,
      votingStart:     form.votingStart     || null,
      votingEnd:       form.votingEnd       || null,
      resultDate:      form.resultDate      || null,
    };
    try {
      if (editId) {
        await api.put(`/elections/${editId}`, payload);
        toast.success('Election updated!');
      } else {
        await api.post('/elections', payload);
        toast.success('Election created! If you set status to "Nominations Open", the public form will now activate.');
      }
      setShowForm(false);
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this election? This cannot be undone.')) return;
    try {
      await api.delete(`/elections/${id}`);
      toast.success('Election deleted');
      fetchElections();
    } catch {
      toast.error('Delete failed');
    }
  };

  const field = (label, key, type = 'text', extra = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        style={{ padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid var(--border-color)' }}
        {...extra}
      />
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Manage Committee Elections</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Create an election cycle → set status to <strong>Nominations Open</strong> → members can apply → Approve/Reject candidates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchElections} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={openCreate} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={16} /> New Election
          </button>
        </div>
      </div>

      {/* ── Create / Edit Form ── */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>{editId ? 'Edit Election' : 'Create New Election'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Election Title *</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Executive Committee Election 2026-2028"
                  style={{ padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid var(--border-color)' }} />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2} placeholder="Brief description…"
                  style={{ padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid var(--border-color)', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Status *</label>
                <select required value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                  style={{ padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <option value="Upcoming">Upcoming (members cannot apply yet)</option>
                  <option value="NominationOpen">Nominations Open (members can now apply)</option>
                  <option value="VotingOpen">Voting Open</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.875rem' }}>Published</label>
                <select value={form.isPublished.toString()} onChange={e => setForm({ ...form, isPublished: e.target.value === 'true' })}
                  style={{ padding: '0.6rem 0.8rem', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                  <option value="true">Yes – visible to members</option>
                  <option value="false">No – hidden (draft)</option>
                </select>
              </div>

              {field('Nomination Start', 'nominationStart', 'date')}
              {field('Nomination End',   'nominationEnd',   'date')}
              {field('Voting Start',     'votingStart',     'date')}
              {field('Voting End',       'votingEnd',       'date')}
              {field('Result Date',      'resultDate',      'date')}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="loader-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : (editId ? 'Save Changes' : 'Create Election')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Election List ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><span className="loader-spinner" style={{ margin: '0 auto' }} /></div>
      ) : elections.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <Vote size={48} style={{ margin: '0 auto 1rem', color: 'var(--border-color)' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Elections Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Click <strong>New Election</strong> to create one. Once you set its status to <strong>Nominations Open</strong>,
            members will be able to submit their candidacy via the public Election form.
          </p>
          <button onClick={openCreate} className="btn btn-primary"><Plus size={16} style={{marginRight:6}} />Create First Election</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {elections.map(election => {
            const st = STATUS_LABELS[election.status] || STATUS_LABELS.Upcoming;
            const isExpanded = expandedId === election.id;
            const cands = candidates[election.id] || [];
            const pending  = cands.filter(c => c.status === 'Pending').length;
            const approved = cands.filter(c => c.status === 'Approved').length;
            const rejected = cands.filter(c => c.status === 'Rejected').length;
            return (
              <div key={election.id} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', cursor: 'pointer' }}
                  onClick={() => expandElection(election.id)}>
                  <Vote size={22} style={{ color: st.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{election.title}</span>
                    {election.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>{election.description}</p>}
                  </div>
                  <span style={{ background: st.color, color: '#fff', padding: '0.25rem 0.75rem', borderRadius: 50, fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{st.label}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button className="action-btn" title="Edit" onClick={() => openEdit(election)}><Pencil size={16} /></button>
                    <button className="action-btn danger" title="Delete" onClick={() => handleDelete(election.id)}><Trash2 size={16} /></button>
                  </div>
                  {isExpanded ? <ChevronUp size={18} style={{ flexShrink: 0 }} /> : <ChevronDown size={18} style={{ flexShrink: 0 }} />}
                </div>

                {/* Candidate list */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-color)', padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      <span style={{ color: '#f59e0b' }}>⏳ {pending} Pending</span>
                      <span style={{ color: '#10b981' }}>✓ {approved} Approved</span>
                      <span style={{ color: '#ef4444' }}>✗ {rejected} Rejected</span>
                    </div>
                    {candLoading[election.id] ? (
                      <div style={{ textAlign: 'center', padding: '2rem' }}><span className="loader-spinner" style={{ margin: '0 auto' }} /></div>
                    ) : cands.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No applications received yet.</p>
                    ) : (
                      <table className="admin-table">
                        <thead>
                          <tr><th>Applicant</th><th>Position</th><th>Statement</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {cands.map(c => (
                            <tr key={c.id}>
                              <td>
                                <div style={{ fontWeight: 600 }}>{c.fullName}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.email}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Batch: {c.batch}</div>
                              </td>
                              <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{c.position}</td>
                              <td style={{ maxWidth: 260, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                <div style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.statement}</div>
                              </td>
                              <td>
                                <span className={`status-badge ${c.status === 'Approved' ? 'status-active' : c.status === 'Rejected' ? 'status-inactive' : 'status-pending'}`}>
                                  {c.status}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  {c.status !== 'Approved' && (
                                    <button className="action-btn success" title="Approve" onClick={() => handleCandidateStatus(election.id, c.id, 'Approved')}><CheckCircle size={17} /></button>
                                  )}
                                  {c.status !== 'Rejected' && (
                                    <button className="action-btn danger" title="Reject" onClick={() => handleCandidateStatus(election.id, c.id, 'Rejected')}><XCircle size={17} /></button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageElections;
