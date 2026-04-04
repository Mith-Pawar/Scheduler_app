import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthPage from './pages/AuthPage';

import TeacherDashBoard from './pages/TeacherDashBoard.jsx';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import './App.css';

const RoleBasedDashboard = () => {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'admin') {
    return <AdminDashboard />;
  }
  return <TeacherDashBoard />;
};

const RequireAuth = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div style={{ color: 'white' }}>Loading...</div>;
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
};

const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <>
      {currentUser && <Navbar />}
      <div className="app-container">
        <Routes>
          <Route path="/" element={<AuthPage />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <RoleBasedDashboard />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {currentUser && <Footer />}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;