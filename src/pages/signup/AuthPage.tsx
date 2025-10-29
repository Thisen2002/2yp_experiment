import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, login, getInterests } from './backend/authService';
import type { SignUpData, LoginData, Interest } from './backend/authService';
import { Eye, EyeOff, User, Mail, Lock, Phone, Calendar, MapPin, Heart } from 'lucide-react';
import SuccessModal from './SuccessModal';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [signupUserName, setSignupUserName] = useState('');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState<SignUpData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: undefined,
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    interests: []
  });

  // Load interests when component mounts
  useEffect(() => {
    const loadInterests = async () => {
      setLoadingInterests(true);
      const fetchedInterests = await getInterests();
      setInterests(fetchedInterests);
      setLoadingInterests(false);
    };

    loadInterests();
  }, []);

  const handleInterestToggle = (interestId: string) => {
    setSignupData(prev => ({
      ...prev,
      interests: prev.interests?.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...(prev.interests || []), interestId]
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const result = await login(loginData);

    if (result.success) {
      setSuccessMessage(result.message);
      // Store user data in localStorage
      localStorage.setItem('authUser', JSON.stringify(result.user));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect to home page after successful login
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setErrorMessage(result.message);
    }

    setLoading(false);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validate required fields
    if (!signupData.firstName || !signupData.lastName || !signupData.email || !signupData.password) {
      setErrorMessage('Please fill in all required fields');
      setLoading(false);
      return;
    }

    const result = await signUp(signupData);

    if (result.success) {
      // Show success modal
      setSignupUserName(signupData.firstName);
      setShowSuccessModal(true);
      
      // Clear form
      setSignupData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        dateOfBirth: '',
        gender: undefined,
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        interests: []
      });
    } else {
      setErrorMessage(result.message);
    }

    setLoading(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setIsLogin(true);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="auth-container">
      <SuccessModal 
        isOpen={showSuccessModal} 
        onClose={handleCloseSuccessModal}
        userName={signupUserName}
      />
      
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Login to continue' : 'Sign up to get started'}
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-error">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        {isLogin ? (
          // Login Form
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          // Signup Form
          <form onSubmit={handleSignupSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <User size={18} />
                  First Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="First name"
                  value={signupData.firstName}
                  onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={18} />
                  Last Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Last name"
                  value={signupData.lastName}
                  onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                Email *
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Password *
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Phone size={18} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Phone number"
                  value={signupData.phoneNumber}
                  onChange={(e) => setSignupData({ ...signupData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Calendar size={18} />
                  Date of Birth
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={signupData.dateOfBirth}
                  onChange={(e) => setSignupData({ ...signupData, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                Gender
              </label>
              <select
                className="form-input"
                value={signupData.gender || ''}
                onChange={(e) => setSignupData({ ...signupData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={18} />
                Address
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Street address"
                value={signupData.address}
                onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="City"
                  value={signupData.city}
                  onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="State"
                  value={signupData.state}
                  onChange={(e) => setSignupData({ ...signupData, state: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Country</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Country"
                  value={signupData.country}
                  onChange={(e) => setSignupData({ ...signupData, country: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Postal code"
                  value={signupData.postalCode}
                  onChange={(e) => setSignupData({ ...signupData, postalCode: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Heart size={18} />
                Interests (Optional)
              </label>
              {loadingInterests ? (
                <div className="interests-loading">Loading interests...</div>
              ) : (
                <div className="interests-grid">
                  {interests.map((interest) => (
                    <label key={interest.id} className="interest-item">
                      <input
                        type="checkbox"
                        checked={signupData.interests?.includes(interest.id) || false}
                        onChange={() => handleInterestToggle(interest.id)}
                        className="interest-checkbox"
                      />
                      <span className="interest-name">{interest.name}</span>
                    </label>
                  ))}
                </div>
              )}
              {signupData.interests && signupData.interests.length > 0 && (
                <div className="selected-interests-count">
                  {signupData.interests.length} interest{signupData.interests.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className="switch-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
