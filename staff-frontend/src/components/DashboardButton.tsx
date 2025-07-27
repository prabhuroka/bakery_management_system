// components/DashboardButton.tsx
import React from 'react';
import { Button, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { hasRole } from '../services/auth';

const DashboardButton: React.FC = () => {
  const navigate = useNavigate();
  const isOwner = hasRole('owner');

  const handleClick = () => {
    if (isOwner) {
      navigate('/owner-dashboard');
    }
  };

  return (
    <Tooltip title={!isOwner ? "Owner access required" : ""}>
        <Button
            type="primary"
            onClick={handleClick}
            disabled={!isOwner}
            className={!isOwner ? 'disabled-button' : ''}
        >
            Owner Dashboard
        </Button>
    </Tooltip>
    
  );
};

export default DashboardButton;