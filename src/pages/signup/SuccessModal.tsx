import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import './SuccessModal.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, userName }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-icon">
          <CheckCircle size={64} />
        </div>
        
        <h2 className="modal-title">Account Created Successfully!</h2>
        
        <p className="modal-message">
          Welcome, <strong>{userName}</strong>! Your account has been created successfully.
        </p>
        
        <p className="modal-submessage">
          You can now log in with your credentials to access all features.
        </p>
        
        <button className="modal-button" onClick={onClose}>
          Continue to Login
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
