import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faExclamationCircle, 
  faInfoCircle,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  autoClose?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  type, 
  message, 
  onClose,
  autoClose = 5000 
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success': return <FontAwesomeIcon icon={faCheckCircle} />;
      case 'error': return <FontAwesomeIcon icon={faExclamationCircle} />;
      case 'info': return <FontAwesomeIcon icon={faInfoCircle} />;
      default: return null;
    }
  };

  return (
    <div className={`notification ${type}`}>
      <div className="notification-icon">{getIcon()}</div>
      <div className="notification-message">{message}</div>
      <button 
        onClick={onClose}
        className="notification-close"
        aria-label="Close notification"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default Notification;