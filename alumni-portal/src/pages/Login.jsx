import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';
import css from './Auth.module.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Check all fields');
    
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      login(data.token, data.user);
      toast.success('Welcome back!');
      
      let redirectPath = from;
      if (data.user.role === 'Admin' && from === '/dashboard') {
        redirectPath = '/admin/dashboard';
      }
      
      navigate(redirectPath, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={css.authContainer}>
      <div className={css.authCard}>
        <div className={css.authHeader}>
          <h2>Welcome Back</h2>
          <p>Login to the Alumni Portal</p>
        </div>
        
        <form onSubmit={handleSubmit} className={css.authForm}>
          <div className={css.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div className={css.inputGroup}>
            <label>Password</label>
            <div className={css.passwordInput}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter your password"
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className={css.eyeBtn}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className={css.authActions}>
            <label className={css.rememberMe}>
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className={css.forgotLink}>Forgot Password?</Link>
          </div>
          
          <button type="submit" className={`btn btn-primary ${css.submitBtn}`} disabled={loading}>
            {loading ? <span className="loader-spinner" style={{width:'20px', height:'20px', borderWidth:'2px'}}></span> : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>
        
        <div className={css.authFooter}>
          <p>Don't have an account? <Link to="/register">Create one now</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
