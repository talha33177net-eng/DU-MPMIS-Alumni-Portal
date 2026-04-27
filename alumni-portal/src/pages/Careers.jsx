import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, ExternalLink, X, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import css from './Careers.module.css';

const Careers = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const result = await api.get('/careers?per_page=30');
        setCareers(result.items || result.data || []);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    fetchCareers();
  }, []);

  if (loading) return <div className="section" style={{display:'flex',justifyContent:'center'}}><span className="loader-spinner"></span></div>;

  return (
    <div className="section container animate-fade-in">
      <div style={{textAlign:'center', marginBottom:'3rem'}}>
        <h1 style={{fontSize:'2.5rem', marginBottom:'1rem'}}>Career & Job Board</h1>
        <p style={{color:'var(--text-muted)', fontSize:'1.1rem'}}>Exclusive job opportunities shared by our alumni network.</p>
      </div>

      <div className="grid grid-2">
        {careers.map(job => (
          <div key={job.id} className={`card ${css.jobCard}`}>
            <div className={css.jobHeader}>
              <h3 className={css.jobTitle}>{job.title}</h3>
              <span className={`badge badge-success`}>Active</span>
            </div>
            <p className={css.company}>{job.organization}</p>
            <div className={css.jobMeta}>
              {job.location && <span><MapPin size={14}/> {job.location}</span>}
              {job.jobType && <span><Briefcase size={14}/> {job.jobType}</span>}
              <span><Clock size={14}/> {format(new Date(job.createdAt), 'MMM dd, yyyy')}</span>
            </div>
            <div className={css.jobDesc}>{job.description?.substring(0, 150)}...</div>
            <div className={css.jobFooter}>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => setSelectedJob(job)} className="btn btn-outline" style={{ padding: '0.5rem 1.2rem', fontWeight: 600 }}>View Details</button>
                {job.applyUrl ? (
                  <a href={job.applyUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }}>
                    Apply Now <ExternalLink size={14}/>
                  </a>
                ) : job.applyEmail ? (
                  <a href={`mailto:${job.applyEmail}`} className="btn btn-primary" style={{ padding: '0.5rem 1.2rem' }}>Apply Now</a>
                ) : null}
              </div>
              {job.deadline && <span className={css.deadline}>Deadline: {format(new Date(job.deadline), 'MMM dd')}</span>}
            </div>
          </div>
        ))}
        {careers.length === 0 && (
          <div style={{gridColumn:'1/-1', textAlign:'center', padding:'4rem', color:'var(--text-muted)'}}>
            <Briefcase size={48} style={{margin:'0 auto 1rem', opacity:0.3}}/>
            <p>No job listings at the moment. Check back later!</p>
          </div>
        )}
      </div>

      {selectedJob && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999999, padding: '5vh 1rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto' }} onClick={() => setSelectedJob(null)}>
          <div className="card" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '750px', backgroundColor: 'var(--surface-color)', position: 'relative', margin: 'auto' }}>
             <button onClick={() => setSelectedJob(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
               <X size={24}/>
             </button>
             
             <div style={{ padding: '2.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{selectedJob.title}</h2>
                <div style={{ fontSize: '1.1rem', color: 'var(--accent-color)', fontWeight: 600, marginBottom: '1.5rem' }}>{selectedJob.organization}</div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                   {selectedJob.location && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}><MapPin size={16}/> {selectedJob.location}</div>}
                   {selectedJob.jobType && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}><Briefcase size={16}/> {selectedJob.jobType}</div>}
                   {selectedJob.salary && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}><span style={{fontSize: '16px', fontWeight: 'bold', paddingTop: '1px'}}>৳</span> {selectedJob.salary}</div>}
                   {selectedJob.deadline && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}><Clock size={16}/> Deadline: {format(new Date(selectedJob.deadline), 'MMM dd, yyyy')}</div>}
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Briefcase size={20} color="var(--accent-color)"/> Job Description
                  </h3>
                  <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    {selectedJob.description}
                  </p>
                </div>

                {selectedJob.requirements && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <CheckCircle size={20} color="var(--accent-color)"/> Requirements
                    </h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                      {selectedJob.requirements}
                    </p>
                  </div>
                )}

                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Ready to apply?</strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Follow the instructions provided by the organization.</span>
                   </div>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      {selectedJob.applyUrl ? (
                        <a href={selectedJob.applyUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                          Apply Externally <ExternalLink size={16} style={{marginLeft: '0.5rem'}}/>
                        </a>
                      ) : selectedJob.applyEmail ? (
                        <a href={`mailto:${selectedJob.applyEmail}`} className="btn btn-primary">
                          Email Application
                        </a>
                      ) : (
                         <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No direct application link provided.</span>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Careers;
