import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Send, X, Bot, User, Loader2, Trash2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import TextShimmer from './ui/TextShimmer';
import './ui/TextShimmer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

const ChatInterface = ({ session, onClose, onDelete }) => {
  const { sendMessage, messages, sendingMessage, fetchMessages } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedId(id);
        // hide after 2 seconds
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Copy failed', err);
      });
  };

  const sessionMessages = messages[session.id] || [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionMessages]);

  // Load messages when session changes
  useEffect(() => {
    if (session.id && !session.loading) {
      fetchMessages(session.id);
    }
  }, [session.id, session.loading, fetchMessages]);

  // Show loading state if session is still loading
  if (session.loading) {
    return (
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <div className="chat-header d-flex align-items-center justify-content-between p-3 border-bottom">
          <div className="d-flex align-items-center">
            <div className="me-3">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <Bot size={16} className="text-white" />
              </div>
            </div>
            <div>
              <h6 className="mb-0">Loading Chat...</h6>
              <small className="text-muted">Please wait while we load your conversation</small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => onDelete && onDelete(session.id)}
              title="Delete chat"
            >
              <Trash2 size={16} />
            </button>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={onClose}
              title="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-grow-1 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <Loader2 size={32} className="text-primary mb-3" style={{ animation: 'spin 1s linear infinite' }} />
            <h5 className="text-primary mb-2">Loading Chat Session</h5>
            <p className="text-muted">Please wait while we restore your conversation...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sendingMessage) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      const result = await sendMessage(session.id, session.serviceName, messageToSend);
      if (!result.success) {
        console.error('Send message failed:', result.error);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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

  return (
    <div className="d-flex flex-column h-100 bg-primary">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-primary bg-secondary">
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center me-3" 
            style={{ 
              width: '32px', 
              height: '32px', 
              backgroundColor: getServiceColor(session.serviceName),
              fontSize: '16px'
            }}
          >
            {getServiceIcon(session.serviceName)}
          </div>
          <div>
            <h6 className="mb-0 text-primary">{session.title}</h6>
            <small className="text-muted">{session.serviceName}</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onDelete && onDelete(session.id)}
            title="Delete chat"
          >
            <Trash2 size={16} />
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={onClose}
            title="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3">
        {sessionMessages.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="text-center">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" 
                style={{ 
                  width: '60px', 
                  height: '60px', 
                  backgroundColor: getServiceColor(session.serviceName),
                  fontSize: '24px'
                }}
              >
                {getServiceIcon(session.serviceName)}
              </div>
              <h5 className="text-primary mb-2">Start a conversation</h5>
              <p className="text-muted">Send a message to begin chatting with {session.serviceName}</p>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {sessionMessages.map((message, index) => (
              <div
                key={message.id || index}
                className={`d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div className={`d-flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} align-items-start gap-3`} style={{ maxWidth: '80%' }}>
                  {/* Avatar */}
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ 
                      width: '32px', 
                      height: '32px',
                      backgroundColor: message.role === 'user' ? '#667eea' : getServiceColor(message.serviceName),
                      fontSize: '14px'
                    }}
                  >
                    {message.role === 'user' ? <User size={16} className="text-white" /> : getServiceIcon(message.serviceName)}
                  </div>

                  {/* Message Content */}
                  <div className={`p-3 rounded ${message.role === 'user' ? 'bg-primary text-white' : 'bg-secondary text-primary text-start'}`}>
                    {message.role === 'user' ? (
                      <div className="message-content" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </div>
                    ) : (
                      <MarkdownRenderer 
                        content={message.content} 
                        className="message-content"
                      />
                    )}
                    <div
                      className={`small mt-2 d-flex align-items-center gap-2 position-relative ${
                        message.role === 'user' ? 'text-white-50' : 'text-muted'
                      }`}
                    >
                      {message.role !== 'user' && (
                        <div className="position-relative">
                          {/* Copy button */}
                          <button
                            className="btn btn-sm btn-link text-decoration-none p-0"
                            onClick={() => handleCopy(message.content, message.Id || index)}
                            title="Copy message"
                          >
                            <FontAwesomeIcon icon={faCopy} className="text-white" />
                          </button>

                          {/* Popup only for this message */}
                          {copiedId === (message.Id || index) && (
                            <div
                              className="position-absolute start-50 translate-middle-x"
                              style={{
                                bottom: '125%',
                                background: 'rgba(0,0,0,0.85)',
                                color: '#fff',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                                boxShadow: '0px 2px 6px rgba(0,0,0,0.2)',
                                zIndex: 10
                              }}
                            >
                              Message is copied!
                            </div>
                          )}
                        </div>
                      )}

                      <span className="text-white">
                        {new Date(message.timestamp || message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="d-flex justify-content-start">
                <div className="d-flex align-items-start gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ 
                      width: '32px', 
                      height: '32px',
                      backgroundColor: getServiceColor(session.serviceName),
                      fontSize: '14px'
                    }}
                  >
                    {getServiceIcon(session.serviceName)}
                  </div>
                  <div className="p-3 rounded bg-secondary text-primary">
                    <div className="d-flex align-items-center gap-2">
                      <TextShimmer 
                        as="span" 
                        className="text-muted"
                        duration={1.5}
                        spread={1.5}
                      >
                        Generating response...
                      </TextShimmer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-top border-primary bg-secondary">
        <form onSubmit={handleSendMessage} className="d-flex gap-2">
          <div className="flex-grow-1 position-relative">
            <textarea
              ref={textareaRef}
              className="form-control"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${session.serviceName}...`}
              rows="1"
              disabled={sendingMessage}
              style={{ 
                resize: 'none',
                minHeight: '44px',
                maxHeight: '120px'
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary d-flex align-items-center justify-content-center"
            disabled={!inputMessage.trim() || sendingMessage}
            style={{ width: '44px', height: '44px' }}
          >
            {sendingMessage ? (
              <Loader2 size={16} className="spinner-border-sm" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
