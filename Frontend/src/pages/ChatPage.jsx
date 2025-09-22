import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { MessageSquare } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import MultiColumnChat from '../components/MultiColumnChat';
import NewChatModal from '../components/NewChatModal';
import ColumnManagementModal from '../components/ColumnManagementModal';

const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    chatSessions, 
    activeSessions, 
    conversations,
    activeConversations,
    fetchChatSessions, 
    addActiveSession,
    removeActiveSession,
    deleteChatSession,
    updateConversationTitle,
    deleteConversation,
    showColumn,
    hideColumn
  } = useChat();
  
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Load chat sessions on mount
  useEffect(() => {
    if (user) {
      console.log('Fetching chat sessions for user:', user.id);
      fetchChatSessions();
    }
  }, [user]); // Removed fetchChatSessions from dependencies to prevent re-fetching

  // Handle session selection from URL
  useEffect(() => {
    if (sessionId) {
      if (chatSessions.length === 0) {
        // Sessions are still loading, show loading state
        setCurrentSession({ id: sessionId, loading: true });
      } else {
        // Sessions loaded, try to find the session
        const session = chatSessions.find(s => s.id === sessionId);
        if (session) {
          setCurrentSession(session);
          addActiveSession(session);
        } else {
          // Session not found, redirect to home
          navigate('/');
        }
      }
    }
  }, [sessionId, chatSessions, addActiveSession, navigate]);

  // Handle new chat creation
  const handleNewChat = (session) => {
    setCurrentSession(session);
    addActiveSession(session);
    navigate(`/chat/${session.id}`);
    setShowNewChatModal(false);
  };

  // Handle session selection
  const handleSessionSelect = (session) => {
    setCurrentSession(session);
    addActiveSession(session);
    navigate(`/chat/${session.id}`);
  };

  // Handle session close
  const handleSessionClose = (sessionId) => {
    removeActiveSession(sessionId);
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      navigate('/');
    }
  };

  const handleDeleteSession = async (session) => {
    console.log('Delete session clicked:', session);
    if (window.confirm(`Are you sure you want to delete "${session.title}"? This will permanently delete the chat and all its columns.`)) {
      try {
        console.log('Calling deleteChatSession with ID:', session.id);
        const result = await deleteChatSession(session.id);
        console.log('Delete result:', result);
        if (result?.success) {
          if (currentSession?.id === session.id) {
            setCurrentSession(null);
            navigate('/');
          }
        } else {
          alert('Failed to delete chat: ' + (result?.error || 'Unknown error'));
        }
      } catch (error) {
        console.error('Failed to delete chat:', error);
        alert('Failed to delete chat: ' + error.message);
      }
    }
  };

  const handleManageColumns = async (session) => {
    console.log('Manage columns clicked:', session);
    console.log('Current conversations for session:', conversations[session?.id] || []);
    console.log('Current active conversations for session:', activeConversations[session?.id] || []);
    
    // Ensure conversations are fetched for this session
    if (session?.id && (!conversations[session.id] || conversations[session.id].length === 0)) {
      console.log('Fetching conversations for session:', session.id);
      try {
        await fetchConversations(session.id);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    }
    
    setSelectedSession(session);
    setShowColumnModal(true);
  };

  const handleUpdateColumn = async (conversationId, newTitle) => {
    try {
      const result = await updateConversationTitle(conversationId, newTitle);
      if (!result?.success) {
        alert('Failed to update column: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to update column:', error);
      alert('Failed to update column: ' + error.message);
    }
  };

  const handleDeleteColumn = async (conversationId) => {
    try {
      const result = await deleteConversation(conversationId);
      if (!result?.success) {
        alert('Failed to delete column: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to delete column:', error);
      alert('Failed to delete column: ' + error.message);
    }
  };

  const handleShowColumn = (conversationId) => {
    if (selectedSession?.id) {
      showColumn(selectedSession.id, conversationId);
    }
  };

  const handleHideColumn = (conversationId) => {
    if (selectedSession?.id) {
      hideColumn(selectedSession.id, conversationId);
    }
  };

  return (
    <div className="d-flex h-100">
      {/* Sidebar */}
      <Sidebar 
        sessions={chatSessions}
        activeSessions={activeSessions}
        currentSession={currentSession}
        onSessionSelect={handleSessionSelect}
        onNewChat={() => setShowNewChatModal(true)}
        onSessionClose={handleSessionClose}
        onDeleteSession={handleDeleteSession}
        onManageColumns={handleManageColumns}
      />

      {/* Main Chat Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {currentSession ? (
          <MultiColumnChat 
            session={currentSession}
            onClose={() => handleSessionClose(currentSession.id)}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center">
              <div className="mb-4">
                <div className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle mb-3" style={{ width: '80px', height: '80px' }}>
                  <MessageSquare size={32} className="text-white" />
                </div>
                <h3 className="text-primary mb-3">Welcome to AIHub</h3>
                <p className="text-muted mb-4">Select a chat from the sidebar or start a new conversation</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowNewChatModal(true)}
                >
                  <MessageSquare size={16} className="me-2" />
                  New Chat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <NewChatModal 
        show={showNewChatModal}
        onHide={() => setShowNewChatModal(false)}
        onChatCreated={handleNewChat}
      />
      
      {/* Column Management Modal */}
      <ColumnManagementModal
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        session={selectedSession}
        conversations={selectedSession ? conversations[selectedSession.id] || [] : []}
        activeConversations={selectedSession ? activeConversations[selectedSession.id] || [] : []}
        onUpdateColumn={handleUpdateColumn}
        onDeleteColumn={handleDeleteColumn}
        onShowColumn={handleShowColumn}
        onHideColumn={handleHideColumn}
      />
    </div>
  );
};

export default ChatPage;
