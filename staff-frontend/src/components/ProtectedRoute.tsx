import React from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser, isAuthenticated, hasRole } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: string | string[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/' 
}) => {
  if (!isAuthenticated()) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  const user = getCurrentUser();

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequired = roles.some(role => hasRole(role));
    
    if (!hasRequired) {
      console.log('Missing required role, redirecting');
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;