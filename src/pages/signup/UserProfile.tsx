import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, MapPin, LogOut, ArrowLeft } from 'lucide-react';
import './UserProfile.css';

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  created_at: string;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuth) {
      navigate('/auth');
      return;
    }

    // Get user data from localStorage
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserData(user);
      } catch (e) {
        console.error('Error parsing user data:', e);
        navigate('/auth');
      }
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    navigate('/logout');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h1 className="profile-name">
            {userData.first_name} {userData.last_name}
          </h1>
          <p className="profile-email">{userData.email}</p>
          <div className="profile-badge">
            Member since {formatDate(userData.created_at)}
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">
                <User size={18} />
                <span>First Name</span>
              </div>
              <div className="info-value">{userData.first_name}</div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <User size={18} />
                <span>Last Name</span>
              </div>
              <div className="info-value">{userData.last_name}</div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <Mail size={18} />
                <span>Email</span>
              </div>
              <div className="info-value">{userData.email}</div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <Phone size={18} />
                <span>Phone Number</span>
              </div>
              <div className="info-value">{userData.phone_number || 'Not provided'}</div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <Calendar size={18} />
                <span>Date of Birth</span>
              </div>
              <div className="info-value">{formatDate(userData.date_of_birth)}</div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <User size={18} />
                <span>Gender</span>
              </div>
              <div className="info-value">{userData.gender || 'Not provided'}</div>
            </div>
          </div>
        </div>

        {(userData.address || userData.city || userData.state || userData.country || userData.postal_code) && (
          <div className="profile-section">
            <h2 className="section-title">Address Information</h2>
            
            <div className="info-grid">
              {userData.address && (
                <div className="info-item full-width">
                  <div className="info-label">
                    <MapPin size={18} />
                    <span>Street Address</span>
                  </div>
                  <div className="info-value">{userData.address}</div>
                </div>
              )}

              {userData.city && (
                <div className="info-item">
                  <div className="info-label">
                    <MapPin size={18} />
                    <span>City</span>
                  </div>
                  <div className="info-value">{userData.city}</div>
                </div>
              )}

              {userData.state && (
                <div className="info-item">
                  <div className="info-label">
                    <MapPin size={18} />
                    <span>State</span>
                  </div>
                  <div className="info-value">{userData.state}</div>
                </div>
              )}

              {userData.country && (
                <div className="info-item">
                  <div className="info-label">
                    <MapPin size={18} />
                    <span>Country</span>
                  </div>
                  <div className="info-value">{userData.country}</div>
                </div>
              )}

              {userData.postal_code && (
                <div className="info-item">
                  <div className="info-label">
                    <MapPin size={18} />
                    <span>Postal Code</span>
                  </div>
                  <div className="info-value">{userData.postal_code}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="profile-actions">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
