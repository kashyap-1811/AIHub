import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect, useMemo } from 'react';
import { chatAPI } from '../services/api';

const ChatContext = createContext();

const initialState = {
  chatSessions: [],
  activeSessions: [],
  messages: {},
  loading: false,
  sendingMessage: false,
  error: null,
  sessionLoadingStates: {},
  lastActivity: {},
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

  // Fetch chat sessions
  const fetchChatSessions = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await chatAPI.getChatSessions();
      
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

  // Create chat session
  const createChatSession = useCallback(async (title, serviceName = null) => {
    if (!title?.trim()) {
      const error = 'Session title is required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await chatAPI.createChatSession({
        title: title.trim(),
        serviceName
      });
      
      dispatch({ 
        type: 'ADD_CHAT_SESSION', 
        payload: response.data 
      });
      
      return { success: true, session: response.data };
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, aborted: true };
      
      const errorMessage = handleError(error, 'Creating chat session');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  // Fetch messages
  const fetchMessages = useCallback(async (sessionId) => {
    if (!sessionId) return { success: false, error: 'Session ID is required' };

    try {
      dispatch({ 
        type: 'SET_SESSION_LOADING', 
        payload: { sessionId, loading: true } 
      });
      
      const response = await chatAPI.getMessages(sessionId);
      
      dispatch({ 
        type: 'SET_MESSAGES', 
        payload: { sessionId, messages: response.data } 
      });
      
      return { success: true, data: response.data };
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

  // Send message
  const sendMessage = useCallback(async (sessionId, serviceName, message) => {
    if (!sessionId || !message?.trim()) {
      const error = 'Session ID and message are required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    const trimmedMessage = message.trim();
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmedMessage,
      serviceName,
      timestamp: new Date().toISOString(),
      pending: true
    };

    try {
      // Add user message immediately
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { sessionId, message: userMessage } 
      });

      dispatch({ type: 'SET_SENDING_MESSAGE', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await chatAPI.sendMessage(sessionId, {
        serviceName,
        message: trimmedMessage
      });
      
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
      if (response.data.aiMessage) {
        dispatch({ 
          type: 'ADD_MESSAGE', 
          payload: { sessionId, message: response.data.aiMessage } 
        });
      }
      
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
      return { success: true, data: response.data };
      
    } catch (error) {
      if (error.name === 'AbortError') return { success: false, aborted: true };
      
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

  // Session management
  const addActiveSession = useCallback((session) => {
    if (!session?.id) return;

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
    if (!sessionId) return;
    dispatch({ type: 'REMOVE_ACTIVE_SESSION', payload: sessionId });
  }, []);

  const updateActiveSession = useCallback((sessionId, updates) => {
    if (!sessionId || !updates) return;
    dispatch({ 
      type: 'UPDATE_ACTIVE_SESSION', 
      payload: { id: sessionId, updates } 
    });
  }, []);

  // Delete session
  const deleteChatSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      const error = 'Session ID is required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      await chatAPI.deleteChatSession(sessionId);
      
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

  const addMessageToSession = useCallback((sessionId, message) => {
    if (!sessionId || !message) return;
    dispatch({ 
      type: 'ADD_MESSAGE', 
      payload: { sessionId, message } 
    });
  }, []);

  // Legacy methods for compatibility
  const loadChatSessions = useCallback(() => fetchChatSessions(), [fetchChatSessions]);
  const openChatSession = useCallback((session) => addActiveSession(session), [addActiveSession]);
  const closeChatSession = useCallback((sessionId) => removeActiveSession(sessionId), [removeActiveSession]);

  // Context value
  const contextValue = useMemo(() => ({
    ...state,
    // Core methods
    fetchChatSessions,
    createChatSession,
    fetchMessages,
    sendMessage,
    deleteChatSession,
    // Session management
    addActiveSession,
    removeActiveSession,
    updateActiveSession,
    // Utility methods
    clearError,
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
    deleteChatSession,
    addActiveSession,
    removeActiveSession,
    updateActiveSession,
    clearError,
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
