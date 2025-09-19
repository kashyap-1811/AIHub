import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import ChatColumn from './ChatColumn';

const ChatContainer = () => {
  const { activeSessions, closeChatSession } = useChat();
  const [showAddColumn, setShowAddColumn] = useState(false);

  const handleAddColumn = () => {
    setShowAddColumn(true);
    // 🚨 You probably also want to trigger context to create a new session here
    // e.g. openNewChatSession() if defined in ChatContext
  };

  const handleCloseColumn = (sessionId) => {
    closeChatSession(sessionId);
  };

  return (
    <div className="main-content">
      <div className="chat-container">
        {activeSessions.map((session) => (
          <ChatColumn
            key={session.id}
            session={session}
            onClose={() => handleCloseColumn(session.id)}
          />
        ))}

        {activeSessions.length === 0 && (
          <div className="d-flex align-items-center justify-content-center flex-grow-1">
            <div className="empty-state">
              <i className="bi bi-chat-dots"></i>
              <h4>Welcome to AIHub</h4>
              <p>Start a new conversation by clicking "New Chat" in the sidebar</p>
            </div>
          </div>
        )}

        {activeSessions.length > 0 && activeSessions.length < 3 && (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ minWidth: '200px' }}
          >
            <div className="add-column-btn" onClick={handleAddColumn}>
              <i className="bi bi-plus-lg mb-2" style={{ fontSize: '2rem' }}></i>
              <span>Add Column</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
