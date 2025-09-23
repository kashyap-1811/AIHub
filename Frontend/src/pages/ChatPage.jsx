import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { MessageSquare, Plus, Settings } from 'lucide-react';
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
    messages,
    fetchChatSessions, 
    addActiveSession,
    removeActiveSession,
    deleteChatSession,
    updateChatSession
  } = useChat();
  
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);

  // Load chat sessions on mount
  useEffect(() => {
    console.log('ChatPage: User effect triggered, user:', user);
    if (user) {
      console.log('ChatPage: Fetching chat sessions for user:', user.id);
      fetchChatSessions();
    } else {
      console.log('ChatPage: No user found, not fetching chat sessions');
    }
  }, [user]);

  // Handle session selection from URL
  useEffect(() => {
    if (sessionId) {
      if (chatSessions.length === 0) {
        // Sessions are still loading, show loading state
        setCurrentSession({ id: sessionId, loading: true });
      } else {
        const session = chatSessions.find(s => s.id === sessionId);
        if (session) {
          setCurrentSession(session);
          addActiveSession(session);
        } else {
          // Session not found, redirect to home
          navigate('/');
        }
      }
    } else {
      setCurrentSession(null);
    }
  }, [sessionId, chatSessions, navigate, addActiveSession]);

  const handleNewChat = (session) => {
    setCurrentSession(session);
    addActiveSession(session);
    navigate(`/chat/${session.id}`);
    setShowNewChatModal(false);
  };

  const handleDeleteSession = async (session) => {
    console.log('Delete session clicked:', session);
    if (window.confirm(`Are you sure you want to delete "${session.title}"? This will permanently delete the chat.`)) {
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

  const handleUpdateSession = async (sessionId, updates) => {
    try {
      const result = await updateChatSession(sessionId, updates);
      if (result?.success) {
        // Update current session if it's the one being updated
        if (currentSession?.id === sessionId) {
          setCurrentSession({ ...currentSession, ...updates });
        }
      } else {
        alert('Failed to update chat: ' + (result?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to update chat:', error);
      alert('Failed to update chat: ' + error.message);
    }
  };

  // Show loading state while sessions are being fetched
  if (chatSessions.length === 0 && !currentSession) {
    return (
      <div className="d-flex vh-100">
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading your chats...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show home page when no session is selected
  if (!currentSession) {
    return (
      <div className="d-flex vh-100">
        <Sidebar 
          chatSessions={chatSessions}
          activeSessions={activeSessions}
          onNewChat={() => {
            console.log('ChatPage: New Chat button clicked, opening modal');
            setShowNewChatModal(true);
          }}
          onSelectSession={(session) => {
            setCurrentSession(session);
            addActiveSession(session);
            navigate(`/chat/${session.id}`);
          }}
          onDeleteSession={handleDeleteSession}
          onUpdateSession={handleUpdateSession}
        />
        
        <div className="flex-grow-1 d-flex align-items-center justify-content-center bg-dark">
          <div className="text-center text-white">
            <MessageSquare size={64} className="mb-3 text-primary" />
            <h2 className="mb-3">Welcome to AIHub</h2>
            <p className="text-muted mb-4">Select a chat from the sidebar or create a new one to get started.</p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setShowNewChatModal(true)}
            >
              <Plus size={20} className="me-2" />
              New Chat
            </button>
          </div>
        </div>

        <NewChatModal 
          show={showNewChatModal}
          onHide={() => setShowNewChatModal(false)}
          onChatCreated={handleNewChat}
        />
      </div>
    );
  }

  // Show chat interface when session is selected
  return (
    <div className="d-flex vh-100">
      <Sidebar 
        chatSessions={chatSessions}
        activeSessions={activeSessions}
        onNewChat={() => {
          console.log('ChatPage: New Chat button clicked, opening modal');
          setShowNewChatModal(true);
        }}
        onSelectSession={(session) => {
          setCurrentSession(session);
          addActiveSession(session);
          navigate(`/chat/${session.id}`);
        }}
        onDeleteSession={handleDeleteSession}
        onUpdateSession={handleUpdateSession}
      />
      
      <div className="flex-grow-1 d-flex flex-column">
        <ChatInterface 
          session={currentSession}
          messages={messages[currentSession.id] || []}
        />
      </div>

      <NewChatModal 
        show={showNewChatModal}
        onHide={() => setShowNewChatModal(false)}
        onChatCreated={handleNewChat}
      />
    </div>
  );
};

export default ChatPage;