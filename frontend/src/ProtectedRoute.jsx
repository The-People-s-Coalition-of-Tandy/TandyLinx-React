import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, loading, initialized, checkAuth } = useAuth();
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!initialized && !loading) {
      checkAuth().then(() => {
        setIsReady(true);
      });
    } else if (initialized) {
      setIsReady(true);
    }
  }, [initialized, loading, checkAuth]);

  if (!isReady) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;