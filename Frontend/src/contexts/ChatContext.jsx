import React, { createContext, useContext, useReducer, useCallback, useRef, useEffect, useMemo } from 'react';
import { chatAPI } from '../services/api';

// Token retrieval function (same as AuthContext)
const getTokenFromStorage = () => {
  try {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

const ChatContext = createContext();

const initialState = {
  chatSessions: [],
  activeSessions: [],
  messages: {},
  conversations: {},
  activeConversations: {},
  conversationMessages: {},
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
      console.log('ADD_CHAT_SESSION reducer called with:', action.payload);
      const sessionExists = state.chatSessions.some(session => session.id === action.payload.id);
      if (sessionExists) {
        console.log('Session already exists, skipping add');
        return { ...state, loading: false };
      }
      console.log('Adding new session to chatSessions');
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

    // Conversation cases
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [action.payload.sessionId]: Array.isArray(action.payload.conversations) 
            ? action.payload.conversations 
            : []
        }
      };

    case 'ADD_CONVERSATION':
      const { sessionId: addSessionId, conversation } = action.payload;
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [addSessionId]: [
            ...(state.conversations[addSessionId] || []),
            conversation
          ]
        }
      };

    case 'REMOVE_CONVERSATION':
      const { sessionId: removeSessionId, conversationId } = action.payload;
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [removeSessionId]: (state.conversations[removeSessionId] || []).filter(c => c.id !== conversationId)
        },
        activeConversations: {
          ...state.activeConversations,
          [removeSessionId]: (state.activeConversations[removeSessionId] || []).filter(c => c.id !== conversationId)
        }
      };

    case 'ADD_ACTIVE_CONVERSATION':
      const { sessionId: activeSessionId, conversation: activeConversation } = action.payload;
      const currentActiveConversations = state.activeConversations[activeSessionId] || [];
      const isConversationAlreadyActive = currentActiveConversations.some(conv => conv.id === activeConversation.id);
      
      if (isConversationAlreadyActive) {
        return state;
      }
      
      return {
        ...state,
        activeConversations: {
          ...state.activeConversations,
          [activeSessionId]: [
            ...currentActiveConversations,
            activeConversation
          ]
        }
      };

    case 'REMOVE_ACTIVE_CONVERSATION':
      const { sessionId: removeActiveSessionId, conversationId: removeActiveConversationId } = action.payload;
      return {
        ...state,
        activeConversations: {
          ...state.activeConversations,
          [removeActiveSessionId]: (state.activeConversations[removeActiveSessionId] || []).filter(c => c.id !== removeActiveConversationId)
        }
      };
      
    case 'SET_ACTIVE_CONVERSATIONS':
      const { sessionId: setActiveSessionId, conversations: setActiveConversations } = action.payload;
      return {
        ...state,
        activeConversations: {
          ...state.activeConversations,
          [setActiveSessionId]: setActiveConversations || []
        }
      };
      
    case 'SET_CONVERSATION_MESSAGES':
      const { conversationId: setConvId, messages: conversationMessages } = action.payload;
      return {
        ...state,
        conversationMessages: {
          ...state.conversationMessages,
          [setConvId]: conversationMessages || []
        }
      };
      
    case 'ADD_TEMPORARY_MESSAGE':
      const { conversationId: tempConvId, message: tempMessage } = action.payload;
      return {
        ...state,
        conversationMessages: {
          ...state.conversationMessages,
          [tempConvId]: [...(state.conversationMessages[tempConvId] || []), tempMessage]
        }
      };
      
    case 'REMOVE_TEMPORARY_MESSAGE':
      const { conversationId: removeTempConvId, messageId: tempMessageId } = action.payload;
      return {
        ...state,
        conversationMessages: {
          ...state.conversationMessages,
          [removeTempConvId]: (state.conversationMessages[removeTempConvId] || []).filter(msg => msg.id !== tempMessageId)
        }
      };
      
    case 'UPDATE_CONVERSATION':
      const { conversationId: updateConvId, updates: conversationUpdates } = action.payload;
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [Object.keys(state.conversations).find(sessionId => 
            state.conversations[sessionId]?.some(conv => conv.id === updateConvId)
          )]: state.conversations[Object.keys(state.conversations).find(sessionId => 
            state.conversations[sessionId]?.some(conv => conv.id === updateConvId)
          )]?.map(conv => 
            conv.id === updateConvId ? { ...conv, ...conversationUpdates } : conv
          ) || []
        },
        activeConversations: {
          ...state.activeConversations,
          [Object.keys(state.activeConversations).find(sessionId => 
            state.activeConversations[sessionId]?.some(conv => conv.id === updateConvId)
          )]: state.activeConversations[Object.keys(state.activeConversations).find(sessionId => 
            state.activeConversations[sessionId]?.some(conv => conv.id === updateConvId)
          )]?.map(conv => 
            conv.id === updateConvId ? { ...conv, ...conversationUpdates } : conv
          ) || []
        }
      };
      
    case 'DELETE_CONVERSATION':
      const { conversationId: deleteConvId } = action.payload;
      const sessionIdToUpdate = Object.keys(state.conversations).find(sessionId => 
        state.conversations[sessionId]?.some(conv => conv.id === deleteConvId)
      );
      
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [sessionIdToUpdate]: state.conversations[sessionIdToUpdate]?.filter(conv => conv.id !== deleteConvId) || []
        },
        activeConversations: {
          ...state.activeConversations,
          [sessionIdToUpdate]: state.activeConversations[sessionIdToUpdate]?.filter(conv => conv.id !== deleteConvId) || []
        },
        conversationMessages: {
          ...state.conversationMessages,
          [deleteConvId]: undefined
        }
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
    console.log('Fetching chat sessions...');
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await chatAPI.getChatSessions();
      
      console.log('Chat sessions fetched:', response.data);
      
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

    console.log('Creating chat session:', { title, serviceName });
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await chatAPI.createChatSession({
        title: title.trim(),
        serviceName
      });
      
      console.log('Chat session created successfully:', response.data);
      
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

  // Conversation management
  const fetchConversations = useCallback(async (sessionId) => {
    if (!sessionId) return { success: false, error: 'Session ID is required' };

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await fetch(`http://localhost:3000/api/chat/sessions/${sessionId}/conversations`, {
        headers: {
          'Authorization': `Bearer ${getTokenFromStorage()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const conversations = await response.json();
      
      dispatch({ 
        type: 'SET_CONVERSATIONS', 
        payload: { sessionId, conversations } 
      });
      
      // Only set active conversations if none are currently active
      const currentActiveConversations = state.activeConversations[sessionId] || [];
      console.log('fetchConversations - currentActiveConversations:', currentActiveConversations.length);
      if (currentActiveConversations.length === 0) {
        console.log('Setting active conversations from fetchConversations:', conversations);
        dispatch({ 
          type: 'SET_ACTIVE_CONVERSATIONS', 
          payload: { sessionId, conversations } 
        });
      } else {
        console.log('Active conversations already exist, skipping SET_ACTIVE_CONVERSATIONS');
      }
      
      return { success: true, data: conversations };
    } catch (error) {
      const errorMessage = handleError(error, 'Fetching conversations');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  const createConversation = useCallback(async (sessionId, title, serviceName) => {
    if (!sessionId || !title?.trim()) {
      const error = 'Session ID and title are required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await fetch(`http://localhost:3000/api/chat/sessions/${sessionId}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTokenFromStorage()}`
        },
        body: JSON.stringify({
          title: title.trim(),
          serviceName
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const conversation = await response.json();
      
      console.log('Adding conversation to conversations:', conversation);
      dispatch({ 
        type: 'ADD_CONVERSATION', 
        payload: { sessionId, conversation } 
      });
      
      // Add to active conversations (visible columns) - this will be the first column
      console.log('Adding conversation to active conversations:', conversation);
      dispatch({ 
        type: 'ADD_ACTIVE_CONVERSATION', 
        payload: { sessionId, conversation } 
      });
      
      return { success: true, data: conversation };
    } catch (error) {
      const errorMessage = handleError(error, 'Creating conversation');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  const addTemporaryMessage = useCallback((conversationId, message) => {
    dispatch({ 
      type: 'ADD_TEMPORARY_MESSAGE', 
      payload: { conversationId, message } 
    });
  }, []);

  const removeTemporaryMessage = useCallback((conversationId, messageId) => {
    dispatch({ 
      type: 'REMOVE_TEMPORARY_MESSAGE', 
      payload: { conversationId, messageId } 
    });
  }, []);

  const updateConversationTitle = useCallback(async (conversationId, newTitle) => {
    if (!conversationId || !newTitle?.trim()) {
      return { success: false, error: 'Conversation ID and title are required' };
    }

    try {
      const response = await chatAPI.updateConversation(conversationId, {
        title: newTitle.trim()
      });
      
      const updatedConversation = response.data;
      
      dispatch({ 
        type: 'UPDATE_CONVERSATION', 
        payload: { conversationId, updates: { title: updatedConversation.title } } 
      });
      
      return { success: true, data: updatedConversation };
    } catch (error) {
      const errorMessage = handleError(error, 'Updating conversation title');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  const deleteConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      return { success: false, error: 'Conversation ID is required' };
    }

    try {
      await chatAPI.deleteConversation(conversationId);
      
      dispatch({ 
        type: 'DELETE_CONVERSATION', 
        payload: { conversationId } 
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = handleError(error, 'Deleting conversation');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  const loadConversationMessages = useCallback(async (conversationId) => {
    if (!conversationId) return { success: false, error: 'Conversation ID is required' };

    try {
      const response = await fetch(`http://localhost:3000/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${getTokenFromStorage()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const messages = await response.json();
      
      dispatch({ 
        type: 'SET_CONVERSATION_MESSAGES', 
        payload: { conversationId, messages } 
      });
      
      return { success: true, data: messages };
    } catch (error) {
      const errorMessage = handleError(error, 'Loading conversation messages');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  const sendMessageToConversation = useCallback(async (conversationId, serviceName, message) => {
    if (!conversationId || !message?.trim()) {
      const error = 'Conversation ID and message are required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await fetch(`http://localhost:3000/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTokenFromStorage()}`
        },
        body: JSON.stringify({
          serviceName,
          message: message.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = handleError(error, 'Sending message to conversation');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  const broadcastMessage = useCallback(async (sessionId, message, serviceNames) => {
    if (!sessionId || !message?.trim() || !serviceNames?.length) {
      const error = 'Session ID, message, and service names are required';
      dispatch({ type: 'SET_ERROR', payload: error });
      return { success: false, error };
    }

    try {
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await fetch(`http://localhost:3000/api/chat/sessions/${sessionId}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getTokenFromStorage()}`
        },
        body: JSON.stringify({
          message: message.trim(),
          serviceNames
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      dispatch({ type: 'SET_SENDING_MESSAGE', payload: false });
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = handleError(error, 'Broadcasting message');
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  const addActiveConversation = useCallback((sessionId, conversation) => {
    if (!sessionId || !conversation?.id) return;
    dispatch({ type: 'ADD_ACTIVE_CONVERSATION', payload: { sessionId, conversation } });
  }, []);

  const removeActiveConversation = useCallback((sessionId, conversationId) => {
    if (!sessionId || !conversationId) return;
    dispatch({ type: 'REMOVE_ACTIVE_CONVERSATION', payload: { sessionId, conversationId } });
  }, []);

  const showColumn = useCallback((sessionId, conversationId) => {
    if (!sessionId || !conversationId) return;
    
    // Find the conversation in the conversations array
    const sessionConversations = state.conversations[sessionId] || [];
    const conversation = sessionConversations.find(conv => conv.id === conversationId);
    
    if (conversation) {
      dispatch({ type: 'ADD_ACTIVE_CONVERSATION', payload: { sessionId, conversation } });
    }
  }, [state.conversations]);

  const hideColumn = useCallback((sessionId, conversationId) => {
    if (!sessionId || !conversationId) return;
    dispatch({ type: 'REMOVE_ACTIVE_CONVERSATION', payload: { sessionId, conversationId } });
  }, []);

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
    // Conversation methods
    fetchConversations,
    createConversation,
    loadConversationMessages,
    sendMessageToConversation,
    broadcastMessage,
    addActiveConversation,
    removeActiveConversation,
    showColumn,
    hideColumn,
    addTemporaryMessage,
    removeTemporaryMessage,
    updateConversationTitle,
    deleteConversation,
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
    fetchConversations,
    createConversation,
    loadConversationMessages,
    sendMessageToConversation,
    broadcastMessage,
    addActiveConversation,
    removeActiveConversation,
    showColumn,
    hideColumn,
    addTemporaryMessage,
    removeTemporaryMessage,
    updateConversationTitle,
    deleteConversation,
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
