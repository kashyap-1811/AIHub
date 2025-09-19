import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import ChatWindow from './ChatWindow';
import ApiKeySettings from '../settings/ApiKeySettings';
import SupportSection from '../support/SupportSection';

const ChatInterface = () => {
  const { user, logout } = useAuth();
  const { 
    chatSessions, 
    activeSessions, 
    messages, 
    loading,
    fetchChatSessions, 
    createChatSession, 
    addActiveSession, 
    removeActiveSession,
    sendMessage 
  } = useChat();

  const [showSettings, setShowSettings] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const handleCreateSession = async (serviceName = null) => {
    const title = newSessionTitle || `New ${serviceName || 'Multi-AI'} Chat`;
    const result = await createChatSession(title, serviceName);
    
    if (result.success) {
      addActiveSession(result.session);
      setNewSessionTitle('');
    }
  };

  const handleSendMessage = async (sessionId, message) => {
    const session = activeSessions.find(s => s.id === sessionId);
    if (session && session.serviceName) {
      await sendMessage(sessionId, session.serviceName, message);
    }
  };

  const getServiceColor = (serviceName) => {
    const colors = {
      'ChatGPT': 'border-success bg-light',
      'Gemini': 'border-info bg-light',
      'Claude': 'border-warning bg-light',
      'DeepSeek': 'border-primary bg-light'
    };
    return colors[serviceName] || 'border-secondary bg-light';
  };

  if (showSettings) {
    return (
      <ApiKeySettings onBack={() => setShowSettings(false)} />
    );
  }

  if (showSupport) {
    return (
      <SupportSection onBack={() => setShowSupport(false)} />
    );
  }

  return (
    <div className="vh-100 d-flex flex-column bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-bottom px-4 py-3">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="bg-primary p-2 rounded me-3">
              <i className="bi bi-cpu-fill text-white fs-5"></i>
            </div>
            <h1 className="h2 fw-bold text-dark mb-0">AI Hub</h1>
          </div>
          
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => setShowSupport(true)}
              className="btn btn-secondary d-flex align-items-center gap-2"
            >
              <i className="bi bi-chat-dots"></i>
              <span>Support</span>
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="btn btn-secondary d-flex align-items-center gap-2"
            >
              <i className="bi bi-gear"></i>
              <span>Settings</span>
            </button>
            
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">Welcome, {user?.username}</span>
              <button
                onClick={logout}
                className="btn btn-secondary d-flex align-items-center gap-2"
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow-1 d-flex overflow-hidden">
        {/* Sidebar */}
        <div className="bg-white border-end" style={{width: '320px'}}>
          {/* New Session Controls */}
          <div className="p-4 border-bottom">
            <div className="mb-3">
              <input
                type="text"
                value={newSessionTitle}
                onChange={(e) => setNewSessionTitle(e.target.value)}
                placeholder="Session title (optional)"
                className="form-control form-control-sm"
              />
            </div>
            
            <div className="row g-2 mb-3">
              <div className="col-6">
                <button
                  onClick={() => handleCreateSession('ChatGPT')}
                  className="btn btn-secondary btn-sm w-100"
                >
                  <i className="bi bi-plus"></i> ChatGPT
                </button>
              </div>
              <div className="col-6">
                <button
                  onClick={() => handleCreateSession('Gemini')}
                  className="btn btn-secondary btn-sm w-100"
                >
                  <i className="bi bi-plus"></i> Gemini
                </button>
              </div>
              <div className="col-6">
                <button
                  onClick={() => handleCreateSession('Claude')}
                  className="btn btn-secondary btn-sm w-100"
                >
                  <i className="bi bi-plus"></i> Claude
                </button>
              </div>
              <div className="col-6">
                <button
                  onClick={() => handleCreateSession('DeepSeek')}
                  className="btn btn-secondary btn-sm w-100"
                >
                  <i className="bi bi-plus"></i> DeepSeek
                </button>
              </div>
            </div>
            
            <button
              onClick={() => handleCreateSession()}
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <i className="bi bi-plus"></i>
              <span>Multi-AI Session</span>
            </button>
          </div>

          {/* Active Sessions */}
          <div className="flex-grow-1 overflow-auto p-4">
            <h3 className="h6 fw-semibold text-muted mb-3">Active Sessions</h3>
            {activeSessions.length === 0 ? (
              <p className="text-muted small">No active sessions</p>
            ) : (
              <div className="d-flex flex-column gap-2">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded border cursor-pointer hover-bg-light ${getServiceColor(session.serviceName)}`}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <p className="small fw-medium text-dark mb-1">{session.title}</p>
                        {session.serviceName && (
                          <p className="small text-muted mb-0">{session.serviceName}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeActiveSession(session.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-grow-1 d-flex flex-column">
          {activeSessions.length === 0 ? (
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
              <div className="text-center">
                <i className="bi bi-cpu-fill display-1 text-muted mb-4"></i>
                <h3 className="h4 fw-medium text-dark mb-2">No Active Sessions</h3>
                <p className="text-muted">Create a new chat session to get started</p>
              </div>
            </div>
          ) : (
            <div className="flex-grow-1 p-4">
              <div className="row g-4 h-100">
                {activeSessions.map((session) => (
                  <div key={session.id} className="col-12 col-lg-6 col-xl-4 h-100">
                    <ChatWindow
                      session={session}
                      messages={messages[session.id] || []}
                      onSendMessage={(message) => handleSendMessage(session.id, message)}
                      loading={loading}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
