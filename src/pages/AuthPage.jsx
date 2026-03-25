import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    confirmPassword: '',
    role: 'teacher',
  });
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

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
    const res = login(formData.username, formData.password);
    if (res.success) {
      toast.showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      setError(res.error);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const { fullName, username, email, password, confirmPassword, role } = formData;
    if (!fullName || !username || !email || !password) {
      setError('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const res = register(fullName, username, email, password, role);
    if (res.success) {
      toast.showToast('Registration successful! Please login.', 'success');
      setIsLogin(true);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        email: '',
        confirmPassword: '',
        role: 'teacher',
      });
    } else {
      setError(res.error);
    }
  };



  const handleForgot = () => {
    toast.showToast('Password reset link sent to your registered email.', 'info');
  };

  return (
<div className="sims-card" style={{ padding: '4rem 2.5rem' }}>

      <div style={{ textAlign: 'center' }}>
        <span className="powered"><i className="fas fa-chalkboard-teacher"></i> Powered by SIMS</span>
        <div className="faculty-badge"><i className="fas fa-university"></i> Faculty Portal</div>
      </div>

      {isLogin ? (
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
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              name="password"
              placeholder="··········"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary">
            <i className="fas fa-sign-in-alt"></i> Login
          </button>

          <div className="forgot-link">
            <a onClick={handleForgot} style={{ cursor: 'pointer' }}>
              Forget Password?
            </a>
          </div>
          <hr className="divider" />
          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            <span>New user? </span>
            <span
              className="toggle-link"
              onClick={() => {
                setIsLogin(false);
                setError('');
                setFormData({ ...formData, username: '', password: '' });
              }}
            >
              Create Account
            </span>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <div className="form-title">Registration</div>
          <div className="input-group">
            <label>Full Name</label>
            <input
              className="input-field"
              type="text"
              name="fullName"
              placeholder="Dr. John Mathews"
              value={formData.fullName}
              onChange={handleChange}
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
            />
          </div>
          <div className="input-group">
            <label>Role</label>
            <select
              name="role"
              className="input-field"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input
              className="input-field"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn-primary">
            <i className="fas fa-user-plus"></i> Register
          </button>
          <hr className="divider" />
          <div style={{ textAlign: 'center' }}>
            <span>Already have an account? </span>
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
              }}
            >
              Login
            </span>
          </div>
        </form>
      )}
    </div>
  );
};

export default AuthPage;