import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AuthPage from './pages/AuthPage';
import TeacherDashBoard from './pages/TeacherDashBoard.jsx';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Decide which dashboard to render based on user role
const RoleBasedDashboard = () => {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'admin') {
    return <AdminDashboard />;
  }
return <TeacherDashBoard />;
};

// Protect dashboard route: redirect to login if not authenticated
const RequireAuth = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', textAlign: 'center' }}>Loading...</div>;
  if (!currentUser) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
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
            {/* Redirect any unknown routes to login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}



export default App
