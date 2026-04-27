import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, MailCheck, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import css from './Auth.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', studentId: '', password: '', 
    confirmPassword: '', batch: '', passingYear: '', otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords don't match!");
    }
    
    setLoading(true);
    try {
      // Prompt backend to generate and dispatch OTP
      const res = await api.post('/auth/send-otp', { email: formData.email });
      toast.success(res.message || res || "Verification code sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.message || 'Failed to send verification code. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    if (!formData.otp) return toast.error("Please enter the verification code");

    setLoading(true);
    try {
      await api.post('/auth/register', { 
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        studentId: formData.studentId,
        password: formData.password,
        batch: formData.batch,
        passingYear: formData.passingYear,
        otp: formData.otp
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Incorrect OTP?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.authContainer}>
      <div className={css.authCard} style={{ maxWidth: '500px' }}>
        <div className={css.authHeader}>
          <h2>Join DU MPMIS</h2>
          <p>{step === 1 ? 'Register to connect with the alumni network' : 'Verify your email address'}</p>
        </div>
        
        {step === 1 && (
          <form onSubmit={handleSendOtp} className={css.authForm}>
            <div className={css.inputGroup}>
              <label>Full Name *</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={css.inputGroup}>
                <label>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              
              <div className={css.inputGroup}>
                <label>Phone Number *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className={css.inputGroup}>
              <label>Student ID</label>
              <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="e.g. 202014023" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={css.inputGroup}>
                <label>Batch No.</label>
                <input type="text" name="batch" value={formData.batch} onChange={handleChange} placeholder="e.g. 52nd" />
              </div>
              
              <div className={css.inputGroup}>
                <label>Passing Year</label>
                <input type="text" name="passingYear" value={formData.passingYear} onChange={handleChange} placeholder="e.g. 2023" />
              </div>
            </div>
            
            <div className={css.inputGroup}>
              <label>Password *</label>
              <div className={css.passwordInput}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password"
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={css.eyeBtn}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className={css.inputGroup}>
              <label>Confirm Password *</label>
              <input 
                type={showPassword ? 'text' : 'password'} 
                name="confirmPassword"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <button type="submit" className={`btn btn-primary ${css.submitBtn}`} disabled={loading}>
              {loading ? <span className="loader-spinner" style={{width:'20px', height:'20px', borderWidth:'2px'}}></span> : 'Continue to Email Verification'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalRegister} className={css.authForm}>
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', textAlign: 'center', marginBottom: '1rem' }}>
               <MailCheck size={32} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
               <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                 We sent a 6-digit verification code to <strong>{formData.email}</strong>.
                 Please enter it below to securely finish creating your account.
               </p>
            </div>

            <div className={css.inputGroup}>
              <label>Verification Code *</label>
              <input 
                type="text" 
                maxLength={6}
                name="otp" 
                value={formData.otp} 
                onChange={handleChange} 
                required 
                placeholder="123456"
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="button" onClick={() => setStep(1)} disabled={loading} style={{ flex: 1, padding: '0.8rem', background: '#f1f1f1', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeft size={16} /> Edit Details
              </button>
              <button type="submit" disabled={loading} style={{ flex: 2, padding: '0.8rem', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                 {loading ? <span className="loader-spinner" style={{width:'20px', height:'20px', borderWidth:'2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white'}}></span> : <><UserPlus size={18} /> Confirm Registration</>}
              </button>
            </div>
          </form>
        )}
        
        {step === 1 && (
          <div className={css.authFooter}>
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
