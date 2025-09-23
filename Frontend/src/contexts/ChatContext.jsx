import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { chatAPI } from '../services/api';

const ChatContext = createContext();

// Initial state
const initialState = {
  chatSessions: [],
  activeSessions: [],
  messages: {},
  loading: false,
  error: null,
  sessionLoadingStates: {},
  lastActivity: {}
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ERROR: 'SET_ERROR',
  SET_CHAT_SESSIONS: 'SET_CHAT_SESSIONS',
  ADD_CHAT_SESSION: 'ADD_CHAT_SESSION',
  UPDATE_CHAT_SESSION: 'UPDATE_CHAT_SESSION',
  REMOVE_CHAT_SESSION: 'REMOVE_CHAT_SESSION',
  SET_ACTIVE_SESSIONS: 'SET_ACTIVE_SESSIONS',
  ADD_ACTIVE_SESSION: 'ADD_ACTIVE_SESSION',
  REMOVE_ACTIVE_SESSION: 'REMOVE_ACTIVE_SESSION',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_SESSION_LOADING: 'SET_SESSION_LOADING',
  UPDATE_LAST_ACTIVITY: 'UPDATE_LAST_ACTIVITY'
};

// Reducer
const chatReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.SET_CHAT_SESSIONS:
      return { ...state, chatSessions: action.payload };
    
    case actionTypes.ADD_CHAT_SESSION:
      const existingSession = state.chatSessions.find(session => session.id === action.payload.id);
      if (existingSession) {
        return state;
      }
      return {
        ...state,
        chatSessions: [action.payload, ...state.chatSessions]
      };
    
    case actionTypes.UPDATE_CHAT_SESSION:
      return {
        ...state,
        chatSessions: state.chatSessions.map(session =>
          session.id === action.payload.id
            ? { ...session, ...action.payload.updates }
            : session
        )
      };
    
    case actionTypes.REMOVE_CHAT_SESSION:
      return {
        ...state,
        chatSessions: state.chatSessions.filter(session => session.id !== action.payload),
        activeSessions: state.activeSessions.filter(session => session.id !== action.payload),
        messages: Object.fromEntries(
          Object.entries(state.messages).filter(([sessionId]) => sessionId !== action.payload)
        ),
        sessionLoadingStates: Object.fromEntries(
          Object.entries(state.sessionLoadingStates).filter(([sessionId]) => sessionId !== action.payload)
        ),
        lastActivity: Object.fromEntries(
          Object.entries(state.lastActivity).filter(([sessionId]) => sessionId !== action.payload)
        )
      };
    
    case actionTypes.SET_ACTIVE_SESSIONS:
      return { ...state, activeSessions: action.payload };
    
    case actionTypes.ADD_ACTIVE_SESSION:
      const isAlreadyActive = state.activeSessions.some(session => session.id === action.payload.id);
      if (isAlreadyActive) {
        return state;
      }
      return {
        ...state,
        activeSessions: [action.payload, ...state.activeSessions]
      };
    
    case actionTypes.REMOVE_ACTIVE_SESSION:
      return {
        ...state,
        activeSessions: state.activeSessions.filter(session => session.id !== action.payload)
      };
    
    case actionTypes.SET_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.sessionId]: action.payload.messages
        }
      };
    
    case actionTypes.ADD_MESSAGE:
      const sessionId = action.payload.sessionId;
      const currentMessages = state.messages[sessionId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [sessionId]: [...currentMessages, action.payload.message]
        }
      };
    
    case actionTypes.SET_SESSION_LOADING:
      return {
        ...state,
        sessionLoadingStates: {
          ...state.sessionLoadingStates,
          [action.payload.sessionId]: action.payload.loading
        }
      };
    
    case actionTypes.UPDATE_LAST_ACTIVITY:
      return {
        ...state,
        lastActivity: {
          ...state.lastActivity,
          [action.payload.sessionId]: action.payload.timestamp
        }
      };
    
    default:
      return state;
  }
};

// Helper function to get token from storage
const getTokenFromStorage = () => {
  return localStorage.getItem('token');
};

// Error handling helper
const handleError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  
  if (error.name === 'AbortError') {
    return 'Request was cancelled';
  }
  
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    return 'Session expired. Please log in again.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return `Failed to ${operation.toLowerCase()}`;
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const abortControllerRef = useRef(null);

  // Chat session management
  const fetchChatSessions = useCallback(async () => {
    try {
      console.log('ChatContext: fetchChatSessions called');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      console.log('ChatContext: Current token:', token ? 'Present' : 'Missing');
      
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });
      
      console.log('ChatContext: Calling chatAPI.getChatSessions()');
      const response = await chatAPI.getChatSessions();
      console.log('ChatContext: API response:', response);
      
      const sessions = response.data || response;
      console.log('ChatContext: Sessions data:', sessions);
      
      dispatch({ type: actionTypes.SET_CHAT_SESSIONS, payload: sessions });
      console.log('ChatContext: Sessions dispatched to state');
      
      return { success: true, data: sessions };
    } catch (error) {
      console.error('ChatContext: Error fetching chat sessions:', error);
      const errorMessage = handleError(error, 'Fetching chat sessions');
      dispatch({ type: actionTypes.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const createChatSession = useCallback(async (title, serviceName) => {
    console.log('ChatContext: createChatSession called with:', { title, serviceName });
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    console.log('ChatContext: Current token for creation:', token ? 'Present' : 'Missing');
    
    if (!title?.trim()) {
      const error = 'Title is required';
      console.error('ChatContext: Title validation failed');
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
      return { success: false, error };
    }

    try {
      console.log('ChatContext: Setting loading state and clearing errors');
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });
      
      console.log('ChatContext: Calling chatAPI.createChatSession');
      const response = await chatAPI.createChatSession({ title: title.trim(), serviceName });
      console.log('ChatContext: API response:', response);
      
      const session = response.data || response;
      console.log('ChatContext: Session data:', session);
      
      dispatch({ type: actionTypes.ADD_CHAT_SESSION, payload: session });
      console.log('ChatContext: Session added to state');
      
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      
      return { success: true, data: session };
    } catch (error) {
      console.error('ChatContext: Error creating chat session:', error);
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      const errorMessage = handleError(error, 'Creating chat session');
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateChatSession = useCallback(async (sessionId, updates) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });
      
      const updatedSession = await chatAPI.updateChatSession(sessionId, updates);
      dispatch({ 
        type: actionTypes.UPDATE_CHAT_SESSION, 
        payload: { id: sessionId, updates: updatedSession } 
      });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      
      return { success: true, data: updatedSession };
    } catch (error) {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      const errorMessage = handleError(error, 'Updating chat session');
      return { success: false, error: errorMessage };
    }
  }, []);

  const deleteChatSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      const error = 'Session ID is required';
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      dispatch({ type: actionTypes.CLEAR_ERROR });
      
      await chatAPI.deleteChatSession(sessionId);
      
      dispatch({ type: actionTypes.REMOVE_CHAT_SESSION, payload: sessionId });
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
      if (error.name === 'AbortError') return { success: false, aborted: true };
      
      const errorMessage = handleError(error, 'Deleting chat session');
      return { success: false, error: errorMessage };
    }
  }, []);

  // Active session management
  const addActiveSession = useCallback((session) => {
    const isAlreadyActive = state.activeSessions.some(s => s.id === session.id);
    if (isAlreadyActive) {
      return;
    }
    dispatch({ type: actionTypes.ADD_ACTIVE_SESSION, payload: session });
  }, [state.activeSessions]);

  const removeActiveSession = useCallback((sessionId) => {
    dispatch({ type: actionTypes.REMOVE_ACTIVE_SESSION, payload: sessionId });
  }, []);

  // Message management
  const fetchMessages = useCallback(async (sessionId) => {
    if (!sessionId) return { success: false, error: 'Session ID is required' };

    try {
      dispatch({ type: actionTypes.SET_SESSION_LOADING, payload: { sessionId, loading: true } });
      dispatch({ type: actionTypes.CLEAR_ERROR });
      
      const messages = await chatAPI.getMessages(sessionId);
      
      dispatch({ 
        type: actionTypes.SET_MESSAGES, 
        payload: { sessionId, messages } 
      });
      
      dispatch({ type: actionTypes.SET_SESSION_LOADING, payload: { sessionId, loading: false } });
      return { success: true, data: messages };
    } catch (error) {
      dispatch({ type: actionTypes.SET_SESSION_LOADING, payload: { sessionId, loading: false } });
      const errorMessage = handleError(error, 'Fetching messages');
      return { success: false, error: errorMessage };
    }
  }, []);

  const sendMessage = useCallback(async (sessionId, message) => {
    if (!sessionId || !message?.trim()) {
      const error = 'Session ID and message are required';
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: actionTypes.SET_SESSION_LOADING, payload: { sessionId, loading: true } });
      dispatch({ type: actionTypes.CLEAR_ERROR });
      
      // Add user message optimistically
      const userMessage = {
        id: `temp-${Date.now()}`,
        content: message.trim(),
        role: 'user',
        serviceName: state.chatSessions.find(s => s.id === sessionId)?.serviceName || 'ChatGPT',
        createdAt: new Date().toISOString()
      };
      
      dispatch({ 
        type: actionTypes.ADD_MESSAGE, 
        payload: { sessionId, message: userMessage } 
      });

      // Send to API
      const result = await chatAPI.sendMessage(sessionId, { message: message.trim() });
      
      // Remove temporary user message and add both real messages
      const currentMessages = state.messages[sessionId] || [];
      const filteredMessages = currentMessages.filter(m => m.id !== userMessage.id);
      
      dispatch({ 
        type: actionTypes.SET_MESSAGES, 
        payload: { sessionId, messages: [...filteredMessages, result.userMessage, result.assistantMessage] } 
      });
      
      // Update last activity
      dispatch({ 
        type: actionTypes.UPDATE_LAST_ACTIVITY, 
        payload: { sessionId, timestamp: new Date().toISOString() } 
      });
      
      dispatch({ type: actionTypes.SET_SESSION_LOADING, payload: { sessionId, loading: false } });
      return { success: true, data: result };
    } catch (error) {
      dispatch({ type: actionTypes.SET_SESSION_LOADING, payload: { sessionId, loading: false } });
      const errorMessage = handleError(error, 'Sending message');
      return { success: false, error: errorMessage };
    }
  }, [state.messages, state.chatSessions]);

  // Utility functions
  const clearError = useCallback(() => {
    dispatch({ type: actionTypes.CLEAR_ERROR });
  }, []);

  // Legacy methods for compatibility
  const loadChatSessions = useCallback(() => fetchChatSessions(), [fetchChatSessions]);
  const openChatSession = useCallback((session) => addActiveSession(session), [addActiveSession]);
  const closeChatSession = useCallback((sessionId) => removeActiveSession(sessionId), [removeActiveSession]);

  const contextValue = {
    // State
    chatSessions: state.chatSessions,
    activeSessions: state.activeSessions,
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    sessionLoadingStates: state.sessionLoadingStates,
    lastActivity: state.lastActivity,
    
    // Chat session methods
    fetchChatSessions,
    createChatSession,
    updateChatSession,
    deleteChatSession,
    
    // Active session methods
    addActiveSession,
    removeActiveSession,
    
    // Message methods
    fetchMessages,
    sendMessage,
    
    // Utility methods
    clearError,
    
    // Legacy methods
    loadChatSessions,
    openChatSession,
    closeChatSession
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};