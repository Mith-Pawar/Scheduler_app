import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthPage from './pages/AuthPage';

import TeacherDashBoard from './pages/TeacherDashBoard.jsx';
import AdminDashboard from './pages/AdminDashboard';
import LeaveRequestsPage from './pages/LeaveRequestsPage.jsx';
import SwapRequestPage from './pages/SwapRequestPage.jsx';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import './App.css';

const RoleBasedDashboard = () => {
  const { currentUser } = useAuth();
  console.log('Dashboard role check:', currentUser?.role); // Debug SQL role
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
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  return (
    <>
      {currentUser && !isAuthPage && <Navbar />}
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
          <Route
            path="/admin-dashboard"
            element={
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/teacher-dashboard"
            element={
              <RequireAuth>
                <TeacherDashBoard />
              </RequireAuth>
            }
          />
          <Route
            path="/leave-requests"
            element={
              <RequireAuth>
                <LeaveRequestsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/swap-requests"
            element={
              <RequireAuth>
                <SwapRequestPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
      {currentUser && !isAuthPage && <Footer />}
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
