import React, { useState } from "react";
import OrganizerDashBoard from "./OrganizerDashBoard";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";

// Simplified dashboard router: shows login, register or organizer dashboard.
const AppDash: React.FC = () => {
  // initialize from localStorage to avoid a mount effect
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem("authUser"));
  const [showRegister, setShowRegister] = useState<boolean>(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setIsAuthenticated(false);
  };

  // Toggle register/login view
  const goToRegister = () => setShowRegister(true);
  const goToLogin = () => setShowRegister(false);
  const handleRegister = () => setShowRegister(false);

  if (isAuthenticated) return <OrganizerDashBoard onLogout={handleLogout} />;
  if (showRegister) return <RegisterPage onRegister={handleRegister} goToLogin={goToLogin} />;
  return <LoginPage onLogin={handleLogin} goToRegister={goToRegister} />;
};

export default AppDash;
