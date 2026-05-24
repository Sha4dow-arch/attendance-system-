/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import GetStarted from './pages/GetStarted';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages (to be implemented)
import Home from './pages/Home';
import Attendance from './pages/Attendance';
import Courses from './pages/Courses';
import Reports from './pages/Reports';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

import './i18n/config';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E4E3E0] flex items-center justify-center">
        <div className="font-mono text-xl animate-pulse">SYSTEM_INITIALIZING...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/get-started" element={!user ? <GetStarted /> : <Navigate to="/" />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      
      <Route
        path="/*"
        element={
          user ? (
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/users" element={<Users />} />
                <Route path="/audit" element={<AuditLogs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
