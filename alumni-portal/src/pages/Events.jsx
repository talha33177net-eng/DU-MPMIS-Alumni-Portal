import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, MapPin, Clock, Tag } from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';
import css from './Events.module.css';
import { useAuth } from '../contexts/AuthContext';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming'); 

  // Join Event Modal State
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [joinStep, setJoinStep] = useState(0); // 0=Sending, 1=OTP, 2=Phone
  const [joinForm, setJoinForm] = useState({ email: '', otp: '', name: '', phone: '' });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'past' ? '/events?type=past' : '/events?type=upcoming';
      const result = await api.get(`${endpoint}&per_page=20`);
      setEvents(result.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const openJoinModal = async (ev) => {
    if (!user) {
      alert("Please log in to your Alumni account to register for events.");
      window.location.href = '/login';
      return;
    }
    
    setSelectedEvent(ev);
    setJoinForm({ email: user.email || '', otp: '', name: user.fullName || '', phone: user.phone || '' });
    setJoinModalOpen(true);
    setJoinStep(0); 

    // Autonomously send the OTP to the logged in user's email
    try {
      await api.post(`/events/${ev.id}/send-otp`, { email: user.email });
      setJoinStep(1); 
    } catch (err) {
      alert(err.message || 'Failed to send OTP to your email.');
      setJoinModalOpen(false);
    }
  };

  const handleVerifyOtpOnly = async () => {
    if (!joinForm.otp) return alert('Please enter the OTP');
    try {
      await api.post(`/events/${selectedEvent.id}/verify-otp`, {
        email: joinForm.email,
        otp: joinForm.otp
      });
      setJoinStep(2); 
    } catch (err) {
      alert(err.message || 'Verification failed. Incorrect OTP?');
    }
  };

  const handleFinalJoin = async () => {
    try {
      await api.post(`/events/${selectedEvent.id}/register`, {
        email: joinForm.email,
        otp: joinForm.otp,
        guestName: joinForm.name,
        guestPhone: joinForm.phone
      });
      setJoinStep(3); // Success Screen
      fetchEvents(); 
    } catch (err) {
      alert(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="section container animate-fade-in">
      <div className={css.header}>
        <h1 className={css.title}>Events & Reunions</h1>
        <p className={css.subtitle}>Join us in celebrating our legacy and networking with fellow alumni.</p>
        
        <div className={css.tabs}>
          <button 
            className={`${css.tabBtn} ${filter === 'upcoming' ? css.activeTab : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming Events
          </button>
          <button 
            className={`${css.tabBtn} ${filter === 'past' ? css.activeTab : ''}`}
            onClick={() => setFilter('past')}
          >
            Past Events
          </button>
        </div>
      </div>

      {loading ? (
        <div className={css.loaderContainer}><span className="loader-spinner"></span></div>
      ) : (
        <div className="grid grid-2">
          {events.map(ev => (
            <div key={ev.id} className={`card ${css.eventCard}`}>
              {ev.coverImage && (
                <div className={css.imageWrapper}>
                  <img loading="lazy" src={`${import.meta.env.PROD ? "" : "http://localhost:5001"}${ev.coverImage}`} alt={ev.title} className={css.coverImage} />
                  <div className={css.dateBadge}>
                    <span className={css.dateMonth}>{format(new Date(ev.eventDate), 'MMM')}</span>
                    <span className={css.dateDay}>{format(new Date(ev.eventDate), 'dd')}</span>
                  </div>
                </div>
              )}
              
              <div className={css.eventContent}>
                <div className={css.eventCategory}>
                  {!ev.coverImage && (
                     <span className={css.textDate}>{format(new Date(ev.eventDate), 'MMM dd, yyyy')}</span>
                  )}
                </div>
                
                <h3 className={css.eventTitle}>{ev.title}</h3>
                
                <div className={css.eventMeta}>
                  <div><MapPin size={16} /> <span>{ev.venue}</span></div>
                  <div><Clock size={16} /> <span>{format(new Date(ev.eventDate), 'hh:mm a')}</span></div>
                </div>
                
                <p className={css.eventDesc}>
                  {ev.description?.substring(0, 120)}...
                </p>
                
                <div className={css.eventFooter} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem'}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                    <div className={css.ticketPrice} style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                      {ev.registrationFee > 0 ? `Fee: ৳${ev.registrationFee}` : 'Free Entry'}
                    </div>
                    {filter === 'upcoming' && (
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--accent-color)', background: 'var(--bg-secondary)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                        {ev.maxAttendees ? `${Math.max(0, ev.maxAttendees - ev.registrationCount)} seats left` : 'Unlimited seats'}
                      </div>
                    )}
                  </div>
                  
                  {filter === 'upcoming' ? (
                     ev.isRegistrationOpen ? (
                       <button onClick={() => openJoinModal(ev)} className="btn btn-primary" style={{ width: '100%' }}>
                         Join the Event
                       </button>
                     ) : (
                       <button disabled className="btn btn-primary" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}>
                         Registration Closed
                       </button>
                     )
                  ) : (
                     <button disabled className="btn btn-primary" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed', background: 'var(--text-muted)' }}>
                       Event Ended
                     </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
             <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)'}}>
               <CalendarIcon size={48} style={{margin:'0 auto 1rem', opacity:0.3}} />
               <p>No {filter} events found at the moment.</p>
             </div>
          )}
        </div>
      )}

      {/* OTP Registration Modal */}
      {joinModalOpen && selectedEvent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', color: 'var(--text-primary)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Join {selectedEvent.title}</h3>
            
            {joinStep === 0 && (
              <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>Generating security pass...</p>
                <div className="loader-spinner" style={{ margin: '1rem auto' }}></div>
              </div>
            )}

            {joinStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  We've sent a 6-digit confirmation code to <strong>{joinForm.email}</strong>.
                </p>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}>Enter OTP</label>
                  <input type="text" maxLength={6} value={joinForm.otp} onChange={e => setJoinForm({...joinForm, otp: e.target.value})} 
                         placeholder="123456" 
                         style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }} />
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setJoinModalOpen(false)} style={{ flex: 1, padding: '0.6rem', background: '#f1f1f1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                  <button onClick={handleVerifyOtpOnly} style={{ flex: 1, padding: '0.6rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Verify</button>
                </div>
              </div>
            )}

            {joinStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <p style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  âœ“ Security Code Validated
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Hello {joinForm.name}, please confirm your mobile number to finalize.
                </p>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.9rem', fontWeight: 600 }}>Mobile Number</label>
                  <input type="tel" value={joinForm.phone} onChange={e => setJoinForm({...joinForm, phone: e.target.value})} 
                         placeholder="01..." 
                         style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setJoinStep(1)} style={{ flex: 1, padding: '0.6rem', background: '#f1f1f1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Back</button>
                  <button onClick={handleFinalJoin} disabled={!joinForm.phone} style={{ flex: 1, padding: '0.6rem', background: !joinForm.phone ? '#ccc' : '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Confirm RSVP</button>
                </div>
              </div>
            )}

            {joinStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1.5rem 0 0.5rem 0', textAlign: 'center' }}>
                 <div style={{ background: '#10b981', color: 'white', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                    âœ“
                 </div>   
                 <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.4rem' }}>Registration Successful!</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                   You have been successfully added to the guest list. A beautiful digital pass has been sent securely to your email inbox!
                 </p>
                 <button onClick={() => setJoinModalOpen(false)} style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                   Done
                 </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Events;

