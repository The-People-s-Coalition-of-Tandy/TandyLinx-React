import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, loading, initialized, checkAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!initialized && !loading) {
      checkAuth();
    }
  }, [initialized, loading, checkAuth]);

  if (!initialized || loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 