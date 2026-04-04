import React, { useState } from "react";
import "../App.css";

const SignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Teacher",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add signup logic
    alert("Signup submitted! (Implement logic)");
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="Teacher">Teacher</option>
            <option value="Admin">Admin</option>
          </select>
          <button type="submit" className="auth-btn">Sign Up</button>
        </form>
        <div className="auth-divider">or</div>
        <button className="google-btn">
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, marginRight: 8 }} />
          Sign up with Google
        </button>
        <div className="auth-link">
          Already have an account? <a href="/login">Login</a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
