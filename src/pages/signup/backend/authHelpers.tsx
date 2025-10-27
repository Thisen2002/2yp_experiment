// Optional: Use this code to add logout functionality to your app

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const useAuth = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('isAuthenticated');
    navigate('/auth');
  };

  const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
  };

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) : null;
  };

  return { logout, isAuthenticated, getCurrentUser };
};

// Example Logout Button Component
export const LogoutButton: React.FC = () => {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all"
    >
      <LogOut size={18} />
      Logout
    </button>
  );
};

// Example Protected Route Component
import { Navigate } from 'react-router-dom';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Usage in App.tsx:
// import { ProtectedRoute } from './pages/signup/backend/authHelpers';
// 
// <Route 
//   path="/dashboard/*" 
//   element={
//     <ProtectedRoute>
//       <AppDashboard />
//     </ProtectedRoute>
//   } 
// />
