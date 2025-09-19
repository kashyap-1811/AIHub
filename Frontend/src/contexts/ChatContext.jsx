import React, { createContext, useContext, useReducer } from 'react';
import api from '../services/api';

const ChatContext = createContext();

const initialState = {
  chatSessions: [],
  activeSessions: [], // Currently open chat sessions
  messages: {},
  loading: false,
  error: null
};

const chatReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CHAT_SESSIONS':
      return { ...state, chatSessions: action.payload, loading: false };
    case 'ADD_CHAT_SESSION':
      return { 
        ...state, 
        chatSessions: [action.payload, ...state.chatSessions],
        loading: false 
      };
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.sessionId]: action.payload.messages
        },
        loading: false
      };
    case 'ADD_MESSAGE':
      const { sessionId, message } = action.payload;
      return {
        ...state,
        messages: {
          ...state.messages,
          [sessionId]: [...(state.messages[sessionId] || []), message]
        }
      };
    case 'ADD_ACTIVE_SESSION':
      return {
        ...state,
        activeSessions: [...state.activeSessions, action.payload]
      };
    case 'REMOVE_ACTIVE_SESSION':
      return {
        ...state,
        activeSessions: state.activeSessions.filter(session => session.id !== action.payload)
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const fetchChatSessions = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get('/api/chat/sessions');
      dispatch({ type: 'SET_CHAT_SESSIONS', payload: response.data });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to fetch chat sessions' 
      });
    }
  };

  const createChatSession = async (title, serviceName = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/api/chat/sessions', {
        title,
        serviceName
      });
      dispatch({ type: 'ADD_CHAT_SESSION', payload: response.data });
      return { success: true, session: response.data };
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to create chat session' 
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.get(`/api/chat/sessions/${sessionId}/messages`);
      dispatch({ 
        type: 'SET_MESSAGES', 
        payload: { sessionId, messages: response.data } 
      });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to fetch messages' 
      });
    }
  };

  const sendMessage = async (sessionId, serviceName, message) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post(`/api/chat/sessions/${sessionId}/messages`, {
        serviceName,
        message
      });
      
      // Add both user and AI messages
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { sessionId, message: response.data.userMessage } 
      });
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { sessionId, message: response.data.aiMessage } 
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true };
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to send message' 
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  const broadcastMessage = async (message, serviceNames) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/api/chat/broadcast', {
        message,
        serviceNames
      });
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: true, responses: response.data };
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to broadcast message' 
      });
      return { success: false, error: error.response?.data?.message };
    }
  };

  const addActiveSession = (session) => {
    dispatch({ type: 'ADD_ACTIVE_SESSION', payload: session });
  };

  const removeActiveSession = (sessionId) => {
    dispatch({ type: 'REMOVE_ACTIVE_SESSION', payload: sessionId });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <ChatContext.Provider value={{
      ...state,
      fetchChatSessions,
      createChatSession,
      fetchMessages,
      sendMessage,
      broadcastMessage,
      addActiveSession,
      removeActiveSession,
      clearError
    }}>
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
