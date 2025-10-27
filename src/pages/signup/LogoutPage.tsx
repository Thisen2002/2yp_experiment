import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle } from 'lucide-react';
import './LogoutPage.css';

const LogoutPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear authentication data
    localStorage.removeItem('authUser');
    localStorage.removeItem('isAuthenticated');

    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="logout-container">
      <div className="logout-card">
        <div className="logout-icon-wrapper">
          <div className="logout-icon">
            <LogOut size={48} />
          </div>
          <div className="logout-check">
            <CheckCircle size={32} />
          </div>
        </div>
        
        <h1 className="logout-title">You've Been Logged Out</h1>
        
        <p className="logout-message">
          Your session has ended successfully. Thank you for using our platform!
        </p>
        
        <p className="logout-submessage">
          You will be redirected to the homepage in a few seconds...
        </p>
        
        <div className="logout-actions">
          <button className="logout-btn-primary" onClick={handleGoHome}>
            Go to Homepage
          </button>
          <button className="logout-btn-secondary" onClick={handleGoLogin}>
            Log In Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
