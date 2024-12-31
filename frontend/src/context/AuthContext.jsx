import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const getStoredAuth = () => {
  const stored = localStorage.getItem('authState');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      localStorage.removeItem('authState');
    }
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: getStoredAuth()?.user || null,
    loading: false,
    initialized: false,
    error: null
  });

  const updateAuthState = (newState) => {
    setAuthState(newState);
    if (newState.user) {
      localStorage.setItem('authState', JSON.stringify({ user: newState.user }));
    } else {
      localStorage.removeItem('authState');
    }
  };

  const checkAuth = useCallback(async (force = false) => {
    // Prevent multiple simultaneous checks
    if (authState.loading || (authState.initialized && !force)) {
      return;
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const response = await fetch('/api/check-auth', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        updateAuthState({
          user: userData,
          loading: false,
          initialized: true,
          error: null
        });
      } else {
        localStorage.removeItem('authState');
        updateAuthState({
          user: null,
          loading: false,
          initialized: true,
          error: 'Authentication failed'
        });
      }
    } catch (error) {
      localStorage.removeItem('authState');
      console.error('Auth check failed:', error);
      updateAuthState({
        user: null,
        loading: false,
        initialized: true,
        error: 'Network error'
      });
    }
  }, [authState.loading, authState.initialized]);

  // Initial auth check
  useEffect(() => {
    if (!authState.initialized && !authState.loading) {
      checkAuth();
    }
  }, [checkAuth, authState.initialized, authState.loading]);

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        updateAuthState(prev => ({
          ...prev,
          user: data.user
        }));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      updateAuthState(prev => ({
        ...prev,
        user: null
      }));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      login,
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);