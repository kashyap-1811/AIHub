import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

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
        sessionStorage.setItem('token', token);
      }
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }, []);

  const getTokenFromStorage = useCallback(() => {
    try {
      return sessionStorage.getItem('token') || localStorage.getItem('token');
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }, []);

  const removeTokenFromStorage = useCallback(() => {
    try {
      sessionStorage.removeItem('token');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }, []);

  // Validate token on app start
  const validateToken = useCallback(async (token) => {
    if (!token) return false;

    try {
      const response = await authAPI.getCurrentUser();
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
      removeTokenFromStorage();
      return false;
    }
  }, [removeTokenFromStorage]);

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

  // Login function
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authAPI.login(credentials);
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

  // Register function
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authAPI.register(userData);
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

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Notify backend of logout if needed
      if (state.token) {
        // Add logout API call if backend supports it
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      removeTokenFromStorage();
      dispatch({ type: 'LOGOUT' });
    }
  }, [state.token, removeTokenFromStorage]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Context value
  const contextValue = React.useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    clearError
  }), [state, login, register, logout, clearError]);

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
