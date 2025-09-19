import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect, useMemo } from 'react';
import api from '../services/api';

const ChatContext = createContext();

const initialState = {
  chatSessions: [],
  activeSessions: [], // Currently open chat sessions
  messages: {},
  loading: false,
  sendingMessage: false, // Separate loading state for sending messages
  error: null,
  sessionLoadingStates: {}, // Track loading state per session
  lastActivity: {}, // Track last activity per session
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { 
        ...state, 
        loading: action.payload,
        error: action.payload ? null : state.error 
      };
      
    case 'SET_SENDING_MESSAGE':
      return { 
        ...state, 
        sendingMessage: action.payload,
        error: action.payload ? null : state.error 
      };
      
    case 'SET_SESSION_LOADING':
      return {
        ...state,
        sessionLoadingStates: {
          ...state.sessionLoadingStates,
          [action.payload.sessionId]: action.payload.loading
        }
      };
      
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload, 
        loading: false, 
        sendingMessage: false 
      };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'SET_CHAT_SESSIONS':
      return { 
        ...state, 
        chatSessions: Array.isArray(action.payload) ? action.payload : [],
        loading: false,
        error: null
      };
      
    case 'ADD_CHAT_SESSION':
      // Prevent duplicate sessions
      const sessionExists = state.chatSessions.some(session => session.id === action.payload.id);
      if (sessionExists) {
        return { ...state, loading: false };
      }
      return { 
        ...state, 
        chatSessions: [action.payload, ...state.chatSessions],
        loading: false,
        error: null
      };
      
    case 'UPDATE_CHAT_SESSION':
      return {
        ...state,
        chatSessions: state.chatSessions.map(session =>
          session.id === action.payload.id 
            ? { ...session, ...action.payload.updates }
            : session
        )
      };
      
    case 'REMOVE_CHAT_SESSION':
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
      
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.sessionId]: Array.isArray(action.payload.messages) 
            ? action.payload.messages 
            : []
        },
        loading: false,
        sessionLoadingStates: {
          ...state.sessionLoadingStates,
          [action.payload.sessionId]: false
        }
      };
      
    case 'ADD_MESSAGE':
      const { sessionId, message } = action.payload;
      if (!sessionId || !message) return state;
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [sessionId]: [
            ...(state.messages[sessionId] || []), 
            { ...message, id: message.id || Date.now(), timestamp: message.timestamp || new Date().toISOString() }
          ]
        },
        lastActivity: {
          ...state.lastActivity,
          [sessionId]: new Date().toISOString()
        }
      };
      
    case 'UPDATE_MESSAGE':
      const { sessionId: updateSessionId, messageId, updates } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [updateSessionId]: (state.messages[updateSessionId] || []).map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          )
        }
      };
      
    case 'ADD_ACTIVE_SESSION':
      // Prevent duplicate active sessions
      const isAlreadyActive = state.activeSessions.some(session => session.id === action.payload.id);
      if (isAlreadyActive) return state;
      
      return {
        ...state,
        activeSessions: [...state.activeSessions, action.payload],
        lastActivity: {
          ...state.lastActivity,
          [action.payload.id]: new Date().toISOString()
        }
      };
      
    case 'REMOVE_ACTIVE_SESSION':
      return {
        ...state,
        activeSessions: state.activeSessions.filter(session => session.id !== action.payload)
      };
      
    case 'UPDATE_ACTIVE_SESSION':
      return {
        ...state,
        activeSessions: state.activeSessions.map(session =>
          session.id === action.payload.id 
            ? { ...session, ...action.payload.updates }
            : session
        )
      };
      
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const activeSessionsRef = useRef([]);
  const abortControllerRef = useRef(new AbortController());

  // Sync ref with state for optimal performance
  useEffect(() => {
    activeSessionsRef.current = state.activeSessions;
  }, [state.activeSessions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  // Enhanced error handling utility
  const handleError = useCallback((error, operation = 'Operation') => {
    console.error(`${operation} failed:`, error);
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        `${operation} failed. Please try again.`;
    dispatch({ type: 'SET_ERROR', payload: errorMessage });
    return errorMessage;
  }, []);

  // Fetch chat sessions with improved error handling
  const fetchChatSessions = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await api.get('/api/chat/sessions', {
        signal: abortControllerRef.current.signal
      });
      
      dispatch({ 
        type: 'SET_CHAT_SESSIONS', 
        payload: response.data 
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, aborted: true };
      
      handleError(error, 'Fetching chat sessions');
      return { success: false, error: error.response?.data?.message };
    }
  }, [handleError]);

  // Create chat session with validation
  const createChatSession = useCallback(async (title, serviceName = null) => {
    if (!title?.trim()) {
      const error = 'Session title is required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      console.log('Creating chat session:', { title: title.trim(), serviceName });
      
      const response = await api.post('/api/chat/sessions', {
        title: title.trim(),
        serviceName
      }, {
        signal: abortControllerRef.current.signal
      });
      
      console.log('Create session response:', response.data);
      
      dispatch({ 
        type: 'ADD_CHAT_SESSION', 
        payload: response.data 
      });
      
      return { success: true, session: response.data };
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, aborted: true };
      
      console.error('Create session error:', error);
      const errorMessage = handleError(error, 'Creating chat session');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  // Fetch messages with session-specific loading states
  const fetchMessages = useCallback(async (sessionId) => {
    if (!sessionId) {
      const error = 'Session ID is required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ 
        type: 'SET_SESSION_LOADING', 
        payload: { sessionId, loading: true } 
      });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await api.get(`/api/chat/sessions/${sessionId}/messages`, {
        signal: abortControllerRef.current.signal
      });
      
      const messages = Array.isArray(response.data) ? response.data : [];
      
      dispatch({ 
        type: 'SET_MESSAGES', 
        payload: { sessionId, messages } 
      });
      
      return { success: true, messages };
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, aborted: true };
      
      dispatch({ 
        type: 'SET_SESSION_LOADING', 
        payload: { sessionId, loading: false } 
      });
      
      const errorMessage = handleError(error, 'Fetching messages');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  // Enhanced send message with optimistic updates
  const sendMessage = useCallback(async (sessionId, serviceName, message) => {
    if (!sessionId || !message?.trim()) {
      const error = 'Session ID and message are required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    const trimmedMessage = message.trim();
    const userMessage = {
      id: `temp-${Date.now()}`,
      type: 'user',
      content: trimmedMessage,
      timestamp: new Date().toISOString(),
      pending: true
    };

    try {
      // Optimistic update - add user message immediately
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { sessionId, message: userMessage } 
      });

      dispatch({ type: 'SET_SENDING_MESSAGE', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      console.log('Making API call to:', `/api/chat/sessions/${sessionId}/messages`);
      console.log('Request payload:', { serviceName, message: trimmedMessage });
      
      const response = await api.post(`/api/chat/sessions/${sessionId}/messages`, {
        serviceName,
        message: trimmedMessage
      }, {
        signal: abortControllerRef.current.signal
      });
      
      console.log('Send message response:', response.data);
      
      // Update user message to remove pending state
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          sessionId,
          messageId: userMessage.id,
          updates: { pending: false, id: response.data.userMessage?.id || userMessage.id }
        }
      });
      
      // Add AI message if received
      if (response.data.AIMessage) {
        console.log('Adding AI message:', response.data.AIMessage);
        dispatch({ 
          type: 'ADD_MESSAGE', 
          payload: { sessionId, message: response.data.AIMessage } 
        });
      }
      
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
      return { success: true, data: response.data };
      
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, aborted: true };
      
      console.error('Send message error:', error);
      console.error('Error response:', error.response);
      
      // Mark user message as failed
      dispatch({
        type: 'UPDATE_MESSAGE',
        payload: {
          sessionId,
          messageId: userMessage.id,
          updates: { pending: false, error: true }
        }
      });
      
      const errorMessage = handleError(error, 'Sending message');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  // Enhanced broadcast message
  const broadcastMessage = useCallback(async (message, serviceNames) => {
    if (!message?.trim() || !Array.isArray(serviceNames) || serviceNames.length === 0) {
      const error = 'Message and service names are required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await api.post('/api/chat/broadcast', {
        message: message.trim(),
        serviceNames
      }, {
        signal: abortControllerRef.current.signal
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, responses: response.data };
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, aborted: true };
      
      const errorMessage = handleError(error, 'Broadcasting message');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  // Enhanced session management
  const addActiveSession = useCallback((session) => {
    if (!session?.id) {
      console.warn('Invalid session provided to addActiveSession');
      return;
    }

    // Check if session is already active using ref for better performance
    const isAlreadyActive = activeSessionsRef.current.some(s => s.id === session.id);
    
    if (!isAlreadyActive) {
      dispatch({ type: 'ADD_ACTIVE_SESSION', payload: session });
      
      // Load messages if not already loaded
      if (!state.messages[session.id]) {
        fetchMessages(session.id);
      }
    }
  }, [fetchMessages, state.messages]);

  const removeActiveSession = useCallback((sessionId) => {
    if (!sessionId) {
      console.warn('Invalid session ID provided to removeActiveSession');
      return;
    }
    
    dispatch({ type: 'REMOVE_ACTIVE_SESSION', payload: sessionId });
  }, []);

  const updateActiveSession = useCallback((sessionId, updates) => {
    if (!sessionId || !updates) {
      console.warn('Invalid parameters provided to updateActiveSession');
      return;
    }
    
    dispatch({ 
      type: 'UPDATE_ACTIVE_SESSION', 
      payload: { id: sessionId, updates } 
    });
  }, []);

  // Enhanced delete session
  const deleteChatSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      const error = 'Session ID is required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await api.delete(`/api/chat/sessions/${sessionId}`, {
        signal: abortControllerRef.current.signal
      });
      
      dispatch({ type: 'REMOVE_CHAT_SESSION', payload: sessionId });
      return { success: true };
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, aborted: true };
      
      const errorMessage = handleError(error, 'Deleting chat session');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  // Utility functions
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const updateSessionMessages = useCallback((sessionId, messages) => {
    if (!sessionId || !Array.isArray(messages)) {
      console.warn('Invalid parameters provided to updateSessionMessages');
      return;
    }
    
    dispatch({ 
      type: 'SET_MESSAGES', 
      payload: { sessionId, messages } 
    });
  }, []);

  const addMessageToSession = useCallback((sessionId, message) => {
    if (!sessionId || !message) {
      console.warn('Invalid parameters provided to addMessageToSession');
      return;
    }
    
    dispatch({ 
      type: 'ADD_MESSAGE', 
      payload: { sessionId, message } 
    });
  }, []);

  // Legacy methods for compatibility
  const loadChatSessions = useCallback(() => fetchChatSessions(), [fetchChatSessions]);
  const openChatSession = useCallback((session) => addActiveSession(session), [addActiveSession]);
  const closeChatSession = useCallback((sessionId) => removeActiveSession(sessionId), [removeActiveSession]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    // Core methods
    fetchChatSessions,
    createChatSession,
    fetchMessages,
    sendMessage,
    broadcastMessage,
    deleteChatSession,
    // Session management
    addActiveSession,
    removeActiveSession,
    updateActiveSession,
    // Utility methods
    clearError,
    updateSessionMessages,
    addMessageToSession,
    // Legacy methods for compatibility
    loadChatSessions,
    openChatSession,
    closeChatSession
  }), [
    state,
    fetchChatSessions,
    createChatSession,
    fetchMessages,
    sendMessage,
    broadcastMessage,
    deleteChatSession,
    addActiveSession,
    removeActiveSession,
    updateActiveSession,
    clearError,
    updateSessionMessages,
    addMessageToSession,
    loadChatSessions,
    openChatSession,
    closeChatSession
  ]);

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

// Additional utility hook for session-specific operations
export const useChatSession = (sessionId) => {
  const chat = useChat();
  
  return useMemo(() => ({
    session: chat.activeSessions.find(s => s.id === sessionId),
    messages: chat.messages[sessionId] || [],
    isLoading: chat.sessionLoadingStates[sessionId] || false,
    lastActivity: chat.lastActivity[sessionId],
    sendMessage: (serviceName, message) => chat.sendMessage(sessionId, serviceName, message),
    fetchMessages: () => chat.fetchMessages(sessionId),
    closeSession: () => chat.removeActiveSession(sessionId),
    updateSession: (updates) => chat.updateActiveSession(sessionId, updates)
  }), [chat, sessionId]);
};
