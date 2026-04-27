import { useState, useEffect } from 'react';
import { Vote, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const Election = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeElection, setActiveElection] = useState(null);
  const [loadingElection, setLoadingElection] = useState(true);
  
  const [form, setForm] = useState({
    position: 'Executive Member',
    statement: '',
    experience: ''
  });

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const res = await api.get('/elections?per_page=50');
        const all = res.data?.data || res.data?.items || [];
        // Prefer NominationOpen, then Upcoming, then VotingOpen, then Completed
        const priority = ['NominationOpen', 'Upcoming', 'VotingOpen', 'Completed'];
        let found = null;
        for (const s of priority) {
          found = all.find(e => e.status === s);
          if (found) break;
        }
        if (found) setActiveElection(found);
      } catch (err) {
        toast.error("Failed to check election status");
      } finally {
        setLoadingElection(false);
      }
    };
    fetchElection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to apply.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
         fullName: user.fullName,
         email: user.email,
         phone: user.phone || 'N/A',
         batch: user.batch || 'N/A',
         position: form.position,
         statement: `Experience:\n${form.experience}\n\nStatement:\n${form.statement}`
      };
      await api.post(`/elections/${activeElection.id}/nominate`, payload);
      toast.success('Your application for the committee election has been submitted successfully.');
      setForm({ position: 'Executive Member', statement: '', experience: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Vote size={48} style={{ color: 'var(--accent-color)', margin: '0 auto 1rem' }} />
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-color)' }}>
          Committee Election Form
        </h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-color)', margin: '1rem auto' }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          {activeElection ? `Apply to become a part of the next DU MPMIS Executive Committee for the ${activeElection.title}.` : 'There are currently no active committee elections open for nomination.'}
        </p>
      </div>

      {loadingElection ? (
        <div style={{textAlign: 'center', padding: '4rem'}}><span className="loader-spinner" style={{margin: '0 auto'}}></span></div>
      ) : !activeElection ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
          <h3 style={{color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem'}}>No Election Scheduled</h3>
          <p style={{color: 'var(--text-muted)'}}>The Election Commission has not announced any upcoming election cycles. Please check back later.</p>
        </div>
      ) : activeElection.status === 'Upcoming' ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <Vote size={48} style={{ margin: '0 auto 1rem', color: 'var(--accent-color)', opacity: 0.6 }} />
          <h3 style={{color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem'}}>Election Announced: {activeElection.title}</h3>
          <p style={{color: 'var(--text-muted)', marginBottom: '1rem'}}>{activeElection.description || 'The nomination window will open soon. Please check back when nominations are officially opened by the Election Commission.'}</p>
          {activeElection.nominationStart && (
            <p style={{color: 'var(--primary-color)', fontWeight: 600}}>
              Nominations open on: {new Date(activeElection.nominationStart).toLocaleDateString('en-BD', {year:'numeric',month:'long',day:'numeric'})}
            </p>
          )}
        </div>
      ) : activeElection.status === 'VotingOpen' ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <Vote size={48} style={{ margin: '0 auto 1rem', color: '#10b981', opacity: 0.8 }} />
          <h3 style={{color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem'}}>Voting is Now Open!</h3>
          <p style={{color: 'var(--text-muted)'}}>The nomination phase is closed. Voting is currently in progress. Contact the Election Commission for your voting details.</p>
        </div>
      ) : activeElection.status === 'Completed' ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
          <h3 style={{color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1.5rem'}}>Election Concluded</h3>
          <p style={{color: 'var(--text-muted)'}}>This election cycle has been completed. Please visit the Committee page to see the elected members.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem' }}>
          <div style={{ background: '#fef3c7', color: '#92400e', padding: '1rem 1.5rem', borderRadius: '4px', marginBottom: '2rem', fontSize: '0.95rem' }}>
            <strong>Note:</strong> You must be an active Life Member to apply for committee positions. Your application will be reviewed by the Election Commission.
          </div>


          {!user ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-color)', borderRadius: '8px' }}>
               <h4 style={{marginBottom: '1rem', color: 'var(--primary-color)'}}>Authentication Required</h4>
               <p style={{color: 'var(--text-muted)'}}>You must be logged in to access the nomination form.</p>
            </div>
          ) : (
             <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Applying As</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={`${user.fullName} (${user.email})`} 
                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'not-allowed' }} 
                  />
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Desired Position</label>
                  <select 
                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
                    value={form.position}
                    onChange={e => setForm({...form, position: e.target.value})}
                    required
                  >
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="General Secretary">General Secretary</option>
                    <option value="Joint Secretary">Joint Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Organizing Secretary">Organizing Secretary</option>
                    <option value="Executive Member">Executive Member</option>
                  </select>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Relevant Experience / Background</label>
                  <textarea 
                    rows="4"
                    placeholder="Briefly describe your professional background and past contributions to the association."
                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%', resize: 'vertical' }}
                    value={form.experience}
                    onChange={e => setForm({...form, experience: e.target.value})}
                    required
                  ></textarea>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: '600', color: 'var(--primary-color)' }}>Statement of Purpose</label>
                  <textarea 
                    rows="5"
                    placeholder="Why are you running for this position? What are your goals for the association?"
                    style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%', resize: 'vertical' }}
                    value={form.statement}
                    onChange={e => setForm({...form, statement: e.target.value})}
                    required
                  ></textarea>
               </div>

               <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input type="checkbox" id="agree" required style={{ marginTop: '0.3rem' }} />
                  <label htmlFor="agree" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    I hereby declare that all information provided is true. If elected, I pledge to uphold the constitution of DU MPMIS and work toward the betterment of the alumni community.
                  </label>
               </div>

               <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '1rem', fontSize: '1.1rem' }} disabled={loading}>
                 {loading ? <span className="loader-spinner" style={{width: 20, height: 20, borderWidth: 2}}></span> : `Submit Application for ${form.position}`}
               </button>
             </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Election;
