import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { MessageSquare } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import NewChatModal from '../components/NewChatModal';
import DeleteChatModal from '../components/DeleteChatModal';

const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    chatSessions, 
    activeSessions, 
    fetchChatSessions, 
    addActiveSession,
    removeActiveSession,
    deleteChatSession
  } = useChat();
  
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  // Load chat sessions on mount
  useEffect(() => {
    if (user) {
      fetchChatSessions();
    }
  }, [user, fetchChatSessions]);

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

  // Handle session close (just close the tab, don't delete)
  const handleSessionClose = (sessionId) => {
    removeActiveSession(sessionId);
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      navigate('/');
    }
  };

  // Handle session delete request (show modal)
  const handleSessionDelete = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteChatSession(sessionToDelete.id);
      if (result.success) {
        // If we're currently viewing the deleted session, navigate away
        if (currentSession?.id === sessionToDelete.id) {
          setCurrentSession(null);
          navigate('/');
        }
        setShowDeleteModal(false);
        setSessionToDelete(null);
      } else {
        console.error('Failed to delete session:', result.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      // You could show a toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete modal close
  const handleDeleteModalClose = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setSessionToDelete(null);
    }
  };

  return (
    <div className="d-flex h-100 position-relative">
      {/* Sidebar */}
      <Sidebar 
        sessions={chatSessions}
        activeSessions={activeSessions}
        currentSession={currentSession}
        onSessionSelect={handleSessionSelect}
        onNewChat={() => setShowNewChatModal(true)}
        onSessionClose={handleSessionClose}
        onSessionDelete={handleSessionDelete}
      />

      {/* Main Chat Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {currentSession ? (
          <ChatInterface 
            session={currentSession}
            onClose={() => handleSessionClose(currentSession.id)}
            onDelete={handleSessionDelete}
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

      {/* Delete Chat Modal */}
      <DeleteChatModal
        show={showDeleteModal}
        onHide={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        chatName={sessionToDelete?.name || 'this chat'}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ChatPage;
