import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    chatSessions,
    openChatSession,
    deleteChatSession,
    createChatSession,
    loadChatSessions,
    loading,
  } = useChat();

  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [newChatService, setNewChatService] = useState('ChatGPT');

  // ✅ load chat sessions whenever a logged-in user changes
  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user, loadChatSessions]);

  const handleNewChat = async (e) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;

    try {
      const result = await createChatSession(newChatTitle.trim(), newChatService);
      if (result?.success && result.session) {
        openChatSession(result.session);
        setNewChatTitle('');
        setShowNewChat(false);
      }
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation(); // ✅ prevents opening chat while clicking delete
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await deleteChatSession(sessionId);
      } catch (error) {
        console.error('Failed to delete chat session:', error);
      }
    }
  };

  // ✅ corrected date formatting logic
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getServiceColor = (serviceName) => {
    const colors = {
      ChatGPT: '#10a37f',
      Gemini: '#4285f4',
      Claude: '#ff6b35',
      DeepSeek: '#6366f1',
    };
    return colors[serviceName] || '#6c757d';
  };

  return (
    <>
      <div className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <h5 className="mb-0 text-white">
            <i className="bi bi-robot me-2"></i>
            AIHub
          </h5>
        </div>

        {/* Content */}
        <div className="sidebar-content">
          {/* New Chat Button */}
          <div className="px-3 mb-3">
            <button
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowNewChat(true)}
            >
              <i className="bi bi-plus-lg"></i>
              New Chat
            </button>
          </div>

          {/* Recent Chats */}
          <div className="px-3">
            <h6 className="text-muted mb-2">Recent Chats</h6>
            {loading ? (
              <div className="text-center py-3">
                <div className="loading-spinner"></div>
              </div>
            ) : (
              <div className="chat-sessions">
                {chatSessions.length === 0 ? (
                  <div className="text-muted text-center py-3">
                    <i className="bi bi-chat-dots d-block mb-2"></i>
                    No chats yet
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className="chat-session-item"
                      onClick={() => openChatSession(session)}
                    >
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span
                            className="service-badge"
                            style={{ backgroundColor: getServiceColor(session.serviceName) }}
                          >
                            {session.serviceName}
                          </span>
                          <small className="text-muted">
                            {formatDate(session.createdAt)}
                          </small>
                        </div>
                        <div
                          className="text-truncate"
                          style={{ maxWidth: '150px' }}
                        >
                          {session.title}
                        </div>
                        <small className="text-muted">
                          {session.messageCount} messages
                        </small>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        style={{ padding: '0.25rem' }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="d-flex flex-column gap-2">
            <button
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
              onClick={() => navigate('/profile')}
            >
              <i className="bi bi-person"></i>
              Profile
            </button>
            <button
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
              onClick={() => navigate('/support')}
            >
              <i className="bi bi-question-circle"></i>
              Support
            </button>
            <button
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <i className="bi bi-box-arrow-right"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Chat</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowNewChat(false)}
                ></button>
              </div>
              <form onSubmit={handleNewChat}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Chat Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      placeholder="Enter chat title..."
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">AI Service</label>
                    <select
                      className="form-select"
                      value={newChatService}
                      onChange={(e) => setNewChatService(e.target.value)}
                    >
                      <option value="ChatGPT">ChatGPT</option>
                      <option value="Gemini">Gemini</option>
                      <option value="Claude">Claude</option>
                      <option value="DeepSeek">DeepSeek</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowNewChat(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Chat
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default Sidebar;
