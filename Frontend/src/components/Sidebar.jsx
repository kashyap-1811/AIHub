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
  User,
  X,
  Search,
  Filter,
  Clock,
  Star,
  Archive,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Session Item Component
const SessionItem = ({ 
  session, 
  currentSession, 
  onSessionSelect, 
  onSessionClose, 
  onSessionDelete, 
  getServiceColor, 
  getServiceIcon, 
  formatDate 
}) => {
  const isActive = currentSession?.id === session.id;

  return (
    <div
      className={`chat-session-item p-2 mb-1 rounded cursor-pointer d-flex align-items-center justify-content-between ${
        isActive ? 'bg-primary' : 'hover-bg-tertiary'
      }`}
      onClick={() => onSessionSelect(session)}
      style={{ 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        borderRadius: '10px',
        background: isActive ? 'rgba(16, 163, 127, 0.2)' : 'transparent',
        border: isActive ? '1px solid rgba(16, 163, 127, 0.3)' : '1px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.background = 'var(--bg-tertiary)';
          e.target.style.borderColor = 'var(--border-color)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.background = 'transparent';
          e.target.style.borderColor = 'transparent';
        }
      }}
    >
      <div className="d-flex align-items-center flex-grow-1 min-width-0">
        <div 
          className="rounded-circle d-flex align-items-center justify-content-center me-3" 
          style={{ 
            width: '28px', 
            height: '28px', 
            backgroundColor: getServiceColor(session.serviceName),
            fontSize: '14px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {getServiceIcon(session.serviceName)}
        </div>
        <div className="flex-grow-1 min-width-0" style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
          <div 
            className="text-truncate text-primary fw-medium text-left" 
            style={{ 
              fontSize: '14px',
              textAlign: 'left !important',
              justifyContent: 'flex-start !important',
              alignItems: 'flex-start !important',
              display: 'block',
              width: '100%'
            }}
          >
            {session.title}
          </div>
          <div className="d-flex align-items-center text-left">
            <small className="text-muted me-2" style={{ fontSize: '12px' }}>
              {session.serviceName}
            </small>
            <small className="text-muted" style={{ fontSize: '12px' }}>
              {formatDate(session.createdAt)}
            </small>
          </div>
        </div>
      </div>
      
      {isActive && (
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm btn-outline-danger p-1"
            onClick={(e) => {
              e.stopPropagation();
              onSessionDelete && onSessionDelete(session.id);
            }}
            style={{ 
              width: '26px', 
              height: '26px',
              borderRadius: '6px',
              border: '1px solid rgba(220, 53, 69, 0.3)'
            }}
            title="Delete chat"
          >
            <Trash2 size={12} />
          </button>
          {/* <button
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={(e) => {
              e.stopPropagation();
              onSessionClose(session.id);
            }}
            style={{ 
              width: '26px', 
              height: '26px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)'
            }}
            title="Close chat"
          >
            <X size={12} />
          </button> */}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ 
  sessions = [], 
  activeSessions = [], 
  currentSession, 
  onSessionSelect, 
  onNewChat, 
  onSessionClose,
  onSessionDelete
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecent, setShowRecent] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
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
      ChatGPT: (
        <img 
          src="https://img.icons8.com/ios-filled/50/chatgpt.png" 
          alt="ChatGPT" 
          style={{ width: '16px', height: '16px' }}
        />
      ),
      Gemini: (
        <img 
          src="https://img.icons8.com/ios-filled/50/gemini-ai.png" 
          alt="Gemini" 
          style={{ width: '16px', height: '16px' }}
        />
      ),
      Claude: (
        <img 
          src="https://img.icons8.com/ios-filled/50/claude-ai.png" 
          alt="Claude" 
          style={{ width: '16px', height: '16px' }}
        />
      ),
      DeepSeek: (
        <img 
          src="https://img.icons8.com/ios-filled/50/deepseek.png" 
          alt="DeepSeek" 
          style={{ width: '16px', height: '16px' }}
        />
      ),
    };
    return icons[serviceName] || (
      <img 
        src="https://img.icons8.com/ios/50/chatgpt.png" 
        alt="AI" 
        style={{ width: '16px', height: '16px' }}
      />
    );
  };

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date
  const groupSessionsByDate = (sessions) => {
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      if (sessionDate >= today) {
        groups.today.push(session);
      } else if (sessionDate >= yesterday) {
        groups.yesterday.push(session);
      } else if (sessionDate >= weekAgo) {
        groups.thisWeek.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  };

  const sessionGroups = groupSessionsByDate(filteredSessions);

  return (
    <div className="sidebar bg-secondary d-flex flex-column position-relative" style={{ 
      width: 'var(--sidebar-width)', 
      minWidth: 'var(--sidebar-width)', 
      zIndex: 10,
      background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
      borderRight: '1px solid var(--border-color)'
    }}>
      {/* Header */}
      <div className="p-3 border-bottom border-primary" style={{ 
        background: 'rgba(16, 163, 127, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ 
              width: '36px', 
              height: '36px',
              background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))',
              boxShadow: '0 4px 12px rgba(16, 163, 127, 0.3)'
            }}>
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <span className="fw-bold text-primary" style={{ fontSize: '18px' }}>AIHub</span>
              <div className="text-muted small">AI Assistant Platform</div>
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button 
          className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
          onClick={onNewChat}
          style={{
            background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))',
            border: 'none',
            borderRadius: '12px',
            padding: '12px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(16, 163, 127, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(16, 163, 127, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 163, 127, 0.3)';
          }}
        >
          <Plus size={18} className="me-2" />
          New Chat
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-3 mb-3">
        <div className="position-relative">
          <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              paddingLeft: '2.5rem',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Chat Sessions */}
      <div className="flex-grow-1 overflow-auto" style={{ 
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--border-color) transparent'
      }}>
        {filteredSessions.length === 0 ? (
          <div className="text-center p-4">
            <div className="text-muted mb-3">
              <MessageSquare size={32} />
            </div>
            <small className="text-muted">
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </small>
            {!searchQuery && (
              <div className="mt-2">
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={onNewChat}
                >
                  Start your first chat
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="px-2">
            {/* Today */}
            {sessionGroups.today.length > 0 && (
              <div className="mb-3">
                <div className="d-flex align-items-center px-2 mb-2">
                  <Clock size={14} className="me-2 text-muted" />
                  <small className="text-muted text-uppercase fw-bold">Today</small>
                </div>
                {sessionGroups.today.map((session) => (
                  <SessionItem 
                    key={session.id}
                    session={session}
                    currentSession={currentSession}
                    onSessionSelect={onSessionSelect}
                    onSessionClose={onSessionClose}
                    onSessionDelete={onSessionDelete}
                    getServiceColor={getServiceColor}
                    getServiceIcon={getServiceIcon}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {/* Yesterday */}
            {sessionGroups.yesterday.length > 0 && (
              <div className="mb-3">
                <div className="d-flex align-items-center px-2 mb-2">
                  <Clock size={14} className="me-2 text-muted" />
                  <small className="text-muted text-uppercase fw-bold">Yesterday</small>
                </div>
                {sessionGroups.yesterday.map((session) => (
                  <SessionItem 
                    key={session.id}
                    session={session}
                    currentSession={currentSession}
                    onSessionSelect={onSessionSelect}
                    onSessionClose={onSessionClose}
                    onSessionDelete={onSessionDelete}
                    getServiceColor={getServiceColor}
                    getServiceIcon={getServiceIcon}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {/* This Week */}
            {sessionGroups.thisWeek.length > 0 && (
              <div className="mb-3">
                <div className="d-flex align-items-center px-2 mb-2">
                  <Clock size={14} className="me-2 text-muted" />
                  <small className="text-muted text-uppercase fw-bold">This Week</small>
                </div>
                {sessionGroups.thisWeek.map((session) => (
                  <SessionItem 
                    key={session.id}
                    session={session}
                    currentSession={currentSession}
                    onSessionSelect={onSessionSelect}
                    onSessionClose={onSessionClose}
                    onSessionDelete={onSessionDelete}
                    getServiceColor={getServiceColor}
                    getServiceIcon={getServiceIcon}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {/* Older */}
            {sessionGroups.older.length > 0 && (
              <div className="mb-3">
                <div className="d-flex align-items-center px-2 mb-2">
                  <Archive size={14} className="me-2 text-muted" />
                  <small className="text-muted text-uppercase fw-bold">Older</small>
                </div>
                {sessionGroups.older.map((session) => (
                  <SessionItem 
                    key={session.id}
                    session={session}
                    currentSession={currentSession}
                    onSessionSelect={onSessionSelect}
                    onSessionClose={onSessionClose}
                    onSessionDelete={onSessionDelete}
                    getServiceColor={getServiceColor}
                    getServiceIcon={getServiceIcon}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-top border-primary" style={{ 
        background: 'rgba(16, 163, 127, 0.05)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="d-flex flex-column gap-2">
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-start"
            onClick={() => navigate('/settings')}
            style={{
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--accent-color)';
              e.target.style.borderColor = 'var(--accent-color)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--bg-tertiary)';
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.color = 'var(--text-primary)';
            }}
          >
            <Settings size={16} className="me-2" />
            Settings
          </button>
          <button
            className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-start"
            onClick={() => navigate('/support')}
            style={{
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--accent-color)';
              e.target.style.borderColor = 'var(--accent-color)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--bg-tertiary)';
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.color = 'var(--text-primary)';
            }}
          >
            <HelpCircle size={16} className="me-2" />
            Support
          </button>
          
          {/* User Menu */}
          <div className="position-relative">
            <button
              className="btn btn-outline-light btn-sm w-100 d-flex align-items-center justify-content-between"
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-color)';
                e.target.style.borderColor = 'var(--accent-color)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-tertiary)';
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.color = 'var(--text-primary)';
              }}
            >
              <div className="d-flex align-items-center">
                <User size={16} className="me-2" />
                {user?.username || 'User'}
              </div>
              <MoreVertical size={14} />
            </button>
            
            {showUserMenu && (
              <div className="position-absolute bottom-100 start-0 w-100 mb-2 bg-tertiary rounded border border-primary" style={{ 
                zIndex: 1000,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="p-3">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{ 
                      width: '32px', 
                      height: '32px',
                      background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))'
                    }}>
                      <User size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="text-primary fw-medium">{user?.username || 'User'}</div>
                      {/* <div className="text-muted small">{user?.email}</div> */}
                    </div>
                  </div>
                  <hr className="my-3 border-primary" />
                  
                  {/* Profile Link */}
                  <button
                    className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-start mb-2"
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid rgba(16, 163, 127, 0.3)',
                      background: 'rgba(16, 163, 127, 0.1)',
                      color: 'var(--accent-color)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'var(--accent-color)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(16, 163, 127, 0.1)';
                      e.target.style.color = 'var(--accent-color)';
                    }}
                  >
                    <User size={16} className="me-2" />
                    Profile
                  </button>

                  {/* Logout Button */}
                  <button
                    className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-start"
                    onClick={handleLogout}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid rgba(220, 53, 69, 0.3)',
                      background: 'rgba(220, 53, 69, 0.1)',
                      color: '#dc3545',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dc3545';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(220, 53, 69, 0.1)';
                      e.target.style.color = '#dc3545';
                    }}
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
