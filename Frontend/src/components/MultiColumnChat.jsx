import React, { useState, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Plus, Send, Bot, User, Loader2, X, MessageSquare } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import ChatColumn from './ChatColumn';

// Token retrieval function (same as AuthContext)
const getTokenFromStorage = () => {
  try {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
};

const MultiColumnChat = ({ session, onClose }) => {
  const { 
    conversations, 
    activeConversations, 
    conversationMessages,
    fetchConversations, 
    createConversation,
    loadConversationMessages,
    sendMessageToConversation,
    broadcastMessage: broadcastMessageToAIs,
    addActiveConversation,
    removeActiveConversation,
    addTemporaryMessage,
    removeTemporaryMessage
  } = useChat();
  const [inputMessages, setInputMessages] = useState({});
  const [sendingMessages, setSendingMessages] = useState({});
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [newConversationService, setNewConversationService] = useState('ChatGPT');
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [defaultConversationCreated, setDefaultConversationCreated] = useState(false);

  const availableServices = ['ChatGPT', 'Gemini', 'Claude', 'DeepSeek'];

  // Debug modal state
  useEffect(() => {
    console.log('Modal state changed:', showNewConversationModal);
  }, [showNewConversationModal]);

  // Load conversations when session changes
  useEffect(() => {
    if (session?.id) {
      fetchConversations(session.id);
      setDefaultConversationCreated(false); // Reset flag for new session
    }
  }, [session?.id, fetchConversations]);

  // Create default conversation if none exist
  useEffect(() => {
    if (session?.id && conversations[session.id] && conversations[session.id].length === 0 && !defaultConversationCreated) {
      console.log('Creating default conversation for session:', session.id);
      handleCreateDefaultConversation();
      setDefaultConversationCreated(true);
    }
  }, [conversations, session?.id, defaultConversationCreated]);

  // Load messages for all conversations when they are fetched
  useEffect(() => {
    if (session?.id && conversations[session.id]) {
      conversations[session.id].forEach(conversation => {
        if (!conversationMessages[conversation.id]) {
          loadConversationMessages(conversation.id);
        }
      });
    }
  }, [conversations, session?.id, conversationMessages, loadConversationMessages]);

  const handleCreateDefaultConversation = async () => {
    try {
      console.log('Creating default conversation for session:', session.id);
      const result = await createConversation(session.id, 'ChatGPT Assistant', 'ChatGPT');
      if (result?.success && result.data) {
        console.log('Default conversation created successfully:', result.data);
        addActiveConversation(session.id, result.data);
        loadConversationMessages(result.data.id);
      } else {
        console.error('Failed to create default conversation:', result);
      }
    } catch (error) {
      console.error('Failed to create default conversation:', error);
    }
  };

  // Load messages for each conversation
  useEffect(() => {
    if (conversations[session?.id]) {
      conversations[session.id].forEach(conversation => {
        loadConversationMessages(conversation.id);
      });
    }
  }, [conversations, session?.id]);


  const handleCreateConversation = async (e) => {
    e.preventDefault();
    if (!newConversationTitle.trim()) return;

    try {
      const result = await createConversation(session.id, newConversationTitle.trim(), newConversationService);
      if (result?.success && result.data) {
        addActiveConversation(session.id, result.data);
        setNewConversationTitle('');
        setShowNewConversationModal(false);
        // Load messages for the new conversation
        loadConversationMessages(result.data.id);
      } else {
        console.error('Failed to create conversation:', result?.error);
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSendMessage = async (conversationId, serviceName) => {
    const message = inputMessages[conversationId]?.trim();
    if (!message || sendingMessages[conversationId]) return;

    // Create temporary user message for immediate display
    const tempUserMessage = {
      id: `temp-user-${Date.now()}`,
      content: message,
      role: 'user',
      serviceName: serviceName,
      createdAt: new Date().toISOString()
    };

    // Add user message immediately to UI
    addTemporaryMessage(conversationId, tempUserMessage);

    setSendingMessages(prev => ({ ...prev, [conversationId]: true }));
    setInputMessages(prev => ({ ...prev, [conversationId]: '' }));

    try {
      const result = await sendMessageToConversation(conversationId, serviceName, message);
      if (result?.success && result.data) {
        // Remove temporary message and reload conversation messages
        removeTemporaryMessage(conversationId, tempUserMessage.id);
        loadConversationMessages(conversationId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the temporary user message on error
      removeTemporaryMessage(conversationId, tempUserMessage.id);
    } finally {
      setSendingMessages(prev => ({ ...prev, [conversationId]: false }));
    }
  };

  const handleBroadcastMessage = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    const activeConversations = conversations[session?.id] || [];
    if (activeConversations.length === 0) return;

    const message = broadcastMessage.trim();
    const timestamp = Date.now();

    // Add user message immediately to all conversations
    activeConversations.forEach(conversation => {
      const tempUserMessage = {
        id: `temp-user-${timestamp}-${conversation.id}`,
        content: message,
        role: 'user',
        serviceName: conversation.serviceName,
        createdAt: new Date().toISOString()
      };

      addTemporaryMessage(conversation.id, tempUserMessage);
      // Set sending state for each conversation
      setSendingMessages(prev => ({ ...prev, [conversation.id]: true }));
    });

    setBroadcastMessage('');

    try {
      const serviceNames = activeConversations.map(c => c.serviceName);
      const result = await broadcastMessageToAIs(session.id, message, serviceNames);
      
      if (result?.success && result.data) {
        // Remove temporary messages and reload conversation messages
        activeConversations.forEach(conversation => {
          removeTemporaryMessage(conversation.id, `temp-user-${timestamp}-${conversation.id}`);
          loadConversationMessages(conversation.id);
        });
      }
    } catch (error) {
      console.error('Failed to broadcast message:', error);
      // Remove temporary user messages on error
      activeConversations.forEach(conversation => {
        removeTemporaryMessage(conversation.id, `temp-user-${timestamp}-${conversation.id}`);
      });
    } finally {
      // Clear sending state for all conversations
      activeConversations.forEach(conversation => {
        setSendingMessages(prev => ({ ...prev, [conversation.id]: false }));
      });
      // Turn off broadcast mode after sending
      setBroadcastMode(false);
    }
  };

  const handleCloseConversation = (conversationId) => {
    removeActiveConversation(session.id, conversationId);
  };

  const sessionConversations = activeConversations[session?.id] || [];
  
  // Debug conversations
  useEffect(() => {
    console.log('Session ID:', session?.id);
    console.log('Conversations:', conversations);
    console.log('Active Conversations:', activeConversations);
    console.log('Session Conversations:', sessionConversations);
  }, [session?.id, conversations, activeConversations, sessionConversations]);

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <div className="chat-header d-flex align-items-center justify-content-between p-3 border-bottom">
        <div className="d-flex align-items-center">
          <div className="me-3">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
              <MessageSquare size={16} className="text-white" />
            </div>
          </div>
          <div>
            <h6 className="mb-0">{session?.title || 'Multi-AI Chat'}</h6>
            <small className="text-muted">
              {sessionConversations.length} AI conversation{sessionConversations.length !== 1 ? 's' : ''}
            </small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setBroadcastMode(!broadcastMode)}
          >
            <Send size={16} className="me-1" />
            {broadcastMode ? 'Individual' : 'Broadcast'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              console.log('Add AI button clicked');
              setShowNewConversationModal(true);
            }}
          >
            <Plus size={16} className="me-1" />
            Add AI
          </button>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Broadcast Mode */}
      {broadcastMode && (
        <div className="p-3 border-bottom bg-light">
          <form onSubmit={handleBroadcastMessage} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Ask all AI assistants..."
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!broadcastMessage.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Chat Columns */}
      <div className="flex-grow-1 d-flex overflow-hidden">
        {sessionConversations.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center w-100">
            <div className="text-center">
              <div className="mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle mb-3" style={{ width: '80px', height: '80px' }}>
                  <Bot size={32} className="text-white" />
                </div>
                <h5 className="text-primary mb-3">No AI Conversations</h5>
                <p className="text-muted mb-4">Add AI assistants to start chatting</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowNewConversationModal(true)}
                >
                  <Plus size={16} className="me-2" />
                  Add AI
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="chat-columns-container d-flex w-100"
            style={{
              overflowX: sessionConversations.length > 3 ? 'auto' : 'visible',
              minHeight: '100%'
            }}
          >
            {sessionConversations.map((conversation) => {
              // Calculate responsive column width
              const getColumnWidth = () => {
                const columnCount = sessionConversations.length;
                console.log('Column count:', columnCount);
                if (columnCount === 1) {
                  console.log('Using full width (100%) for 1 column');
                  return '100%'; // Full width for 1 column
                } else if (columnCount === 2) {
                  console.log('Using half width (50%) for 2 columns');
                  return '50%'; // Half width for 2 columns
                } else if (columnCount === 3) {
                  console.log('Using one-third width (33.33%) for 3 columns');
                  return '33.33%'; // One-third width for 3 columns
                } else {
                  console.log('Using minimum width (300px) for 4+ columns');
                  return '300px'; // Minimum width for 4+ columns
                }
              };

              return (
              <div 
                key={conversation.id} 
                className="chat-column d-flex flex-column"
                style={{ 
                  width: getColumnWidth(),
                  minWidth: '300px' // Ensure minimum width for readability
                }}
              >
                <ChatColumn
                  conversation={conversation}
                  messages={conversationMessages[conversation.id] || []}
                  inputMessage={inputMessages[conversation.id] || ''}
                  sendingMessage={sendingMessages[conversation.id] || false}
                  onInputChange={(value) => setInputMessages(prev => ({ ...prev, [conversation.id]: value }))}
                  onSendMessage={() => handleSendMessage(conversation.id, conversation.serviceName)}
                  onClose={() => handleCloseConversation(conversation.id)}
                />
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add AI Assistant</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowNewConversationModal(false)}
                    aria-label="Close"
                  ></button>
              </div>
              <form onSubmit={handleCreateConversation}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Conversation Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newConversationTitle}
                      onChange={(e) => setNewConversationTitle(e.target.value)}
                      placeholder="e.g., ChatGPT Assistant"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">AI Service</label>
                    <select
                      className="form-select"
                      value={newConversationService}
                      onChange={(e) => setNewConversationService(e.target.value)}
                    >
                      {availableServices.map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowNewConversationModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add AI
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default MultiColumnChat;
