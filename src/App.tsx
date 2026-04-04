import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CaseIntake from './pages/CaseIntake';
import CaseDetail from './pages/CaseDetail';
import Profile from './pages/Profile';
import { motion, AnimatePresence } from 'motion/react';

import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, isAuthReady } = useAppContext();
  
  if (!isAuthReady) return <div className="h-screen w-screen flex items-center justify-center">Laden...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.email !== 'admin@legalbuddy.de') return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/intake" element={
          <ProtectedRoute>
            <CaseIntake />
          </ProtectedRoute>
        } />
        
        <Route path="/case/:id" element={
          <ProtectedRoute>
            <CaseDetail />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
