import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
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
      return { ...state, loading: action.payload, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return { ...state, token: null, user: null, isAuthenticated: false, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, token: null, user: null, isAuthenticated: false, loading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // --- LocalStorage helpers ---
  const setTokenInStorage = useCallback((token) => {
    if (token) localStorage.setItem('token', token);
  }, []);

  const getTokenFromStorage = useCallback(() => localStorage.getItem('token'), []);
  const removeTokenFromStorage = useCallback(() => localStorage.removeItem('token'), []);

  // --- Decode token to get user ---
  const decodeUser = useCallback((token) => {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }, []);

  // --- Validate token with backend ---
  const validateToken = useCallback(async (token) => {
    if (!token) return false;
    try {
      const response = await authAPI.getCurrentUser(token); // backend validation
      if (response.data?.user) {
        const user = response.data.user;
        dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      removeTokenFromStorage();
      return false;
    }
  }, [decodeUser, removeTokenFromStorage]);

  // --- Initialize auth on app load ---
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getTokenFromStorage();
      if (token) {
        const isValid = await validateToken(token);
        if (!isValid) dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    initializeAuth();
  }, [getTokenFromStorage, validateToken]);

  // --- Login ---
  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      if (!token) throw new Error('Invalid server response');

      setTokenInStorage(token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [setTokenInStorage, decodeUser]);

  // --- Register ---
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      if (!token) throw new Error('Invalid server response');

      setTokenInStorage(token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [setTokenInStorage, decodeUser]);

  // --- Logout ---
  const logout = useCallback(() => {
    removeTokenFromStorage();
    dispatch({ type: 'LOGOUT' });
  }, [removeTokenFromStorage]);

  // --- Clear error ---
  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);

  const contextValue = React.useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    clearError
  }), [state, login, register, logout, clearError]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
