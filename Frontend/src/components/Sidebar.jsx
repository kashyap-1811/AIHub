import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  Plus, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Trash2,
  MoreVertical,
  User
} from 'lucide-react';

const Sidebar = ({ 
  sessions = [], 
  activeSessions = [], 
  currentSession, 
  onSessionSelect, 
  onNewChat, 
  onSessionClose 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

  const getServiceIcon = (serviceName) => {
    const icons = {
      ChatGPT: '🤖',
      Gemini: '💎',
      Claude: '⚡',
      DeepSeek: '🔍',
    };
    return icons[serviceName] || '🤖';
  };

  return (
    <div className="sidebar bg-secondary d-flex flex-column" style={{ width: 'var(--sidebar-width)', minWidth: 'var(--sidebar-width)' }}>
      {/* Header */}
      <div className="p-3 border-bottom border-primary">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
              <MessageSquare size={18} className="text-white" />
            </div>
            <span className="fw-bold text-primary">AIHub</span>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button 
          className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
          onClick={onNewChat}
        >
          <Plus size={16} className="me-2" />
          New Chat
        </button>
      </div>

      {/* Chat Sessions */}
      <div className="flex-grow-1 overflow-auto">
        <div className="px-3 mb-2">
          <small className="text-muted text-uppercase fw-bold">Recent Chats</small>
        </div>
        
        {sessions.length === 0 ? (
          <div className="text-center p-4">
            <div className="text-muted mb-2">
              <MessageSquare size={24} />
            </div>
            <small className="text-muted">No chats yet</small>
          </div>
        ) : (
          <div className="px-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`chat-session-item p-2 mb-1 rounded cursor-pointer d-flex align-items-center justify-content-between ${
                  currentSession?.id === session.id ? 'bg-primary' : 'hover-bg-tertiary'
                }`}
                onClick={() => onSessionSelect(session)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <div className="d-flex align-items-center flex-grow-1 min-width-0">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-2" 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      backgroundColor: getServiceColor(session.serviceName),
                      fontSize: '12px'
                    }}
                  >
                    {getServiceIcon(session.serviceName)}
                  </div>
                  <div className="flex-grow-1 min-width-0">
                    <div className="text-truncate text-primary" style={{ fontSize: '14px' }}>
                      {session.title}
                    </div>
                    <div className="d-flex align-items-center">
                      <small className="text-muted me-2">{session.serviceName}</small>
                      <small className="text-muted">{formatDate(session.createdAt)}</small>
                    </div>
                  </div>
                </div>
                
                {currentSession?.id === session.id && (
                  <button
                    className="btn btn-sm btn-outline-danger p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSessionClose(session.id);
                    }}
                    style={{ width: '24px', height: '24px' }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-top border-primary">
        <div className="d-flex flex-column gap-2">
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-start"
            onClick={() => navigate('/profile')}
          >
            <Settings size={16} className="me-2" />
            Settings
          </button>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-start"
            onClick={() => navigate('/support')}
          >
            <HelpCircle size={16} className="me-2" />
            Support
          </button>
          
          {/* User Menu */}
          <div className="position-relative">
            <button
              className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-between"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="d-flex align-items-center">
                <User size={16} className="me-2" />
                {user?.username || 'User'}
              </div>
              <MoreVertical size={14} />
            </button>
            
            {showUserMenu && (
              <div className="position-absolute bottom-100 start-0 w-100 mb-2 bg-tertiary rounded border border-primary" style={{ zIndex: 1000 }}>
                <div className="p-2">
                  <div className="text-muted small px-2 py-1">{user?.email}</div>
                  <hr className="my-2 border-primary" />
                  <button
                    className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-start"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="me-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
