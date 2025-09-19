import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'TOKEN_REFRESH_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user || state.user,
        isAuthenticated: true,
        error: null
      };
    case 'TOKEN_REFRESH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: 'Session expired. Please login again.'
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Secure token storage functions
  const setTokenInStorage = useCallback((token) => {
    try {
      if (token) {
        // Store in sessionStorage instead of localStorage for better security
        sessionStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }, []);

  const getTokenFromStorage = useCallback(() => {
    try {
      // Check sessionStorage first, then localStorage for backward compatibility
      return sessionStorage.getItem('token') || localStorage.getItem('token');
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }, []);

  const removeTokenFromStorage = useCallback(() => {
    try {
      sessionStorage.removeItem('token');
      localStorage.removeItem('token'); // Remove from both for cleanup
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }, []);

  // Enhanced token validation
  const validateToken = useCallback(async (token) => {
    if (!token) return false;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Set authorization header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get('/api/auth/me');
      
      if (response.data?.user) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { 
            token, 
            user: response.data.user 
          }
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      
      // Check if it's a 401 (unauthorized) or token expired error
      if (error.response?.status === 401) {
        dispatch({ type: 'TOKEN_REFRESH_FAILURE' });
        removeTokenFromStorage();
      } else {
        dispatch({ 
          type: 'LOGIN_FAILURE', 
          payload: 'Failed to validate session' 
        });
      }
      return false;
    }
  }, [removeTokenFromStorage]);

  // Token refresh functionality
  const refreshToken = useCallback(async () => {
    try {
      const response = await api.post('/api/auth/refresh');
      const { token, user } = response.data;
      
      setTokenInStorage(token);
      dispatch({
        type: 'TOKEN_REFRESH_SUCCESS',
        payload: { token, user }
      });
      
      return token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'TOKEN_REFRESH_FAILURE' });
      removeTokenFromStorage();
      throw error;
    }
  }, [setTokenInStorage, removeTokenFromStorage]);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getTokenFromStorage();
      
      if (token) {
        const isValid = await validateToken(token);
        if (!isValid) {
          removeTokenFromStorage();
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, [getTokenFromStorage, validateToken, removeTokenFromStorage]);

  // Enhanced login function
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await api.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      setTokenInStorage(token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Login failed. Please try again.';
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      });
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [setTokenInStorage]);

  // Enhanced register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      setTokenInStorage(token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Registration failed. Please try again.';
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      });
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [setTokenInStorage]);

  // Enhanced Google auth function
  const googleAuth = useCallback(async (googleData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await api.post('/api/auth/google', googleData);
      const { token, user } = response.data;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      setTokenInStorage(token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Google authentication failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Google authentication failed. Please try again.';
      
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: errorMessage 
      });
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  }, [setTokenInStorage]);

  // Enhanced logout function
  const logout = useCallback(async () => {
    try {
      // Notify backend of logout
      if (state.token) {
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      removeTokenFromStorage();
      dispatch({ type: 'LOGOUT' });
    }
  }, [state.token, removeTokenFromStorage]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Context value with memoization to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    ...state,
    login,
    register,
    googleAuth,
    logout,
    refreshToken,
    clearError
  }), [state, login, register, googleAuth, logout, refreshToken, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Additional utility hook for protected routes
export const useRequireAuth = () => {
  const auth = useAuth();
  
  React.useEffect(() => {
    if (!auth.loading && !auth.isAuthenticated) {
      // Redirect to login or show auth modal
      console.warn('Authentication required');
    }
  }, [auth.loading, auth.isAuthenticated]);
  
  return auth;
};
