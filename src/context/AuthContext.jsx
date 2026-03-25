import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, saveUsers } from '../utils/Storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sims_auth_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const userData = {
        username: user.username,
        name: user.fullName || user.username,
        email: user.email,
        role: user.role,
      };
      localStorage.setItem('sims_auth_user', JSON.stringify(userData));
      setCurrentUser(userData);
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  };

  const register = (fullName, username, email, password, role) => {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
      return { success: false, error: 'Username already exists' };
    }
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = { fullName, username, email, password, role };
    saveUsers([...users, newUser]);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('sims_auth_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};