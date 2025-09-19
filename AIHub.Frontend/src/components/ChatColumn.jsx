import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '../contexts/ChatContext';

const ChatColumn = ({ session, onClose }) => {
  const { sendMessage, messages, sendingMessage, addMessageToSession } = useChat();

  // Keep only valid messages for this session
  const sessionMessages = useMemo(
    () => {
      const sessionMsgs = (messages[session.id] || []).filter((m) => m && (m.role || m.Role));
      console.log(`Session ${session.id} messages:`, sessionMsgs);
      return sessionMsgs;
    },
    [messages, session.id]
  );

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const messageToSend = inputMessage.trim();
    console.log('Sending message:', messageToSend, 'to session:', session.id);
    console.log('Session object:', session);
    
    // Clear input immediately
    setInputMessage('');
    setIsTyping(true);

    // Add user message immediately to UI
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageToSend,
      serviceName: session.serviceName,
      createdAt: new Date().toISOString()
    };
    
    // Add to messages state immediately
    addMessageToSession(session.id, tempUserMessage);

    try {
      const result = await sendMessage(session.id, session.serviceName, messageToSend);
      console.log('Send message result:', result);
      
      if (!result.success) {
        console.error('Send message failed:', result.error);
        // Show error to user
        alert(`Failed to send message: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
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
      ChatGPT: 'bi-robot',
      Gemini: 'bi-gem',
      Claude: 'bi-lightning',
      DeepSeek: 'bi-search',
    };
    return icons[serviceName] || 'bi-robot';
  };

  return (
    <div className="chat-column">
      {/* Header */}
      <div className="chat-header">
        <div className="column-header">
          <i
            className={`bi ${getServiceIcon(session.serviceName)} me-2`}
            style={{ color: getServiceColor(session.serviceName) }}
          ></i>
          <div>
            <h6 className="mb-0">{session.title}</h6>
            <small className="text-muted">{session.serviceName}</small>
          </div>
        </div>
        <button
          className="close-column-btn"
          onClick={onClose}
          title="Close chat"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {sessionMessages.length === 0 ? (
          <div className="empty-state">
            <i
              className={`bi ${getServiceIcon(session.serviceName)}`}
              style={{ color: getServiceColor(session.serviceName) }}
            ></i>
            <h5>Start a conversation</h5>
            <p>Send a message to begin chatting with {session.serviceName}</p>
          </div>
        ) : (
          sessionMessages.map((message) => {
            // Handle both lowercase and uppercase properties from backend
            const messageId = message.id || message.Id;
            const messageRole = message.role || message.Role;
            const messageContent = message.content || message.Content;
            const messageServiceName = message.serviceName || message.ServiceName;
            const messageCreatedAt = message.createdAt || message.CreatedAt;
            
            return (
              <div key={messageId} className={`message ${messageRole}`}>
                <div className="message-avatar">
                  {messageRole === 'user' ? (
                    <i className="bi bi-person"></i>
                  ) : (
                    <i className={`bi ${getServiceIcon(messageServiceName)}`}></i>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-text">{messageContent}</div>
                  <small className="message-time text-muted">
                    {new Date(messageCreatedAt).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="message assistant">
            <div className="message-avatar">
              <i className={`bi ${getServiceIcon(session.serviceName)}`}></i>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span>AI is typing</span>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-input">
          <div className="input-group">
            <textarea
              ref={textareaRef}
              className="form-control"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown} // ✅ use onKeyDown, not onKeyPress
              placeholder={`Message ${session.serviceName}...`}
              rows="1"
              disabled={sendingMessage}
              style={{ resize: 'none' }}
            />
          </div>
          <button
            type="submit"
            className="btn-send"
            disabled={!inputMessage.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <div
                className="loading-spinner"
                style={{ width: '16px', height: '16px' }}
              ></div>
            ) : (
              <i className="bi bi-send"></i>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatColumn;
