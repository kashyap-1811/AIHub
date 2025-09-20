import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { MessageSquare } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import NewChatModal from '../components/NewChatModal';

const ChatPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    chatSessions, 
    activeSessions, 
    fetchChatSessions, 
    addActiveSession,
    removeActiveSession 
  } = useChat();
  
  const [showNewChatModal, setShowNewChatModal] = useState(false);
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

  // Handle session close
  const handleSessionClose = (sessionId) => {
    removeActiveSession(sessionId);
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      navigate('/');
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
      />

      {/* Main Chat Area */}
      <div className="flex-grow-1 d-flex flex-column">
        {currentSession ? (
          <ChatInterface 
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
    </div>
  );
};

export default ChatPage;
