import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    confirmPassword: '',
    role: 'teacher',
  });
  const [error, setError] = useState('');
  const { login, register, currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Auto-redirect to role dashboard after login
  useEffect(() => {
    if (currentUser) {
      console.log('Auto-redirecting role:', currentUser.role); // Debug
      const rolePath = currentUser.role === 'admin' ? '/admin-dashboard' : '/teacher-dashboard';
      navigate(rolePath, { replace: true });
    }
  }, [currentUser, navigate]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Username and password required');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = login(formData.username, formData.password);
      setLoading(false);
      if (res.success) {
        toast.showToast('Login successful!', 'success');
        // useEffect will handle redirect
      } else {
        setError(res.error);
      }
    }, 500);

  };

  const handleRegister = (e) => {
    e.preventDefault();
    const { fullName, username, email, password, confirmPassword, role } = formData;
    if (!fullName || !username || !email || !password) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const res = register(fullName, username, email, password, role);
      setLoading(false);
      if (res.success) {
        // Auto-login after registration
        setTimeout(() => {
          login(formData.username, formData.password);
        }, 500);
        toast.showToast('Registration successful! Logging in...', 'success');
      } else {
        setError(res.error);
      }

    }, 500);
  };

  const handleForgot = () => {
    toast.showToast('Password reset link sent to your registered email.', 'info');
  };

  return (
    <div className="auth-container">
      <div className="sims-card auth-card" style={{ maxWidth: '450px', width: '100%', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="powered"><i className="fas fa-chalkboard-teacher"></i> Powered by SIMS</span>
          <div className="faculty-badge"><i className="fas fa-university"></i> Faculty Portal</div>
        </div>

        <div className={`form-container ${isLogin ? 'active' : ''}`}>
          <form onSubmit={handleLogin}>
            <div className="form-title">Login</div>
            <div className="input-group">
              <label>Username</label>
              <input
                className="input-field"
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <div className="password-input-group">
                <input
                  className="input-field password-field"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="··········"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            {error && <div className="error-msg"><i className="fas fa-exclamation-circle"></i> {error}</div>}
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Logging in...</> : <><i className="fas fa-sign-in-alt"></i> Login</>}
            </button>

            <div className="forgot-link" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <a onClick={handleForgot} style={{ cursor: 'pointer' }}>
                Forgotten Password?
              </a>
            </div>
            <hr className="divider" />
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <span style={{ color: '#6b7280' }}>New user? </span>
              <span
                className="toggle-link"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setFormData({ ...formData, username: '', password: '', confirmPassword: '' });
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                Create Account
              </span>
            </div>
          </form>
        </div>

        <div className={`form-container ${!isLogin ? 'active' : ''}`}>
          <form onSubmit={handleRegister}>
            <div className="form-title">Register</div>
            <div className="input-group">
              <label>Full Name</label>
              <input
                className="input-field"
                type="text"
                name="fullName"
                placeholder="Dr. John Mathews"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label>Username</label>
              <input
                className="input-field"
                type="text"
                name="username"
                placeholder="choose username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                className="input-field"
                type="email"
                name="email"
                placeholder="email@sims.edu"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div className="input-group">
              <label>Role</label>
              <select
                name="role"
                className="input-field"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="input-group">
              <label>Password</label>
              <div className="password-input-group">
                <input
                  className="input-field password-field"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <div className="password-input-group">
                <input
                  className="input-field password-field"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>
            {error && <div className="error-msg"><i className="fas fa-exclamation-circle"></i> {error}</div>}
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Registering...</> : <><i className="fas fa-user-plus"></i> Register</>}
            </button>
            <hr className="divider" />
            <div style={{ textAlign: 'center' }}>
              <span style={{ color: '#6b7280' }}>Already have an account? </span>
              <span
                className="toggle-link"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setFormData({
                    username: '',
                    password: '',
                    fullName: '',
                    email: '',
                    confirmPassword: '',
                    role: 'teacher',
                  });
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                Login
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;