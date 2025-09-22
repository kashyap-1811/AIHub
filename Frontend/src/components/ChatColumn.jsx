import React, { useRef, useEffect } from 'react';
import { Send, X, Bot, User, Loader2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const ChatColumn = ({ 
  conversation, 
  messages, 
  inputMessage, 
  sendingMessage, 
  onInputChange, 
  onSendMessage, 
  onClose 
}) => {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const getServiceIcon = (serviceName) => {
    switch (serviceName) {
      case 'ChatGPT':
        return '🤖';
      case 'Gemini':
        return '💎';
      case 'Claude':
        return '🧠';
      case 'DeepSeek':
        return '🔍';
      default:
        return '🤖';
    }
  };

  return (
    <div className="d-flex flex-column h-100 bg-dark">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center">
          <div className="me-2 fs-4">{getServiceIcon(conversation.serviceName)}</div>
          <div>
            <h6 className="mb-0 text-white">{conversation.title}</h6>
            <small className="text-muted">{conversation.serviceName}</small>
          </div>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-area flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
        {messages.length === 0 ? (
          <div className="d-flex align-items-center justify-content-center h-100 p-3">
            <div className="text-center text-muted">
              <Bot size={32} className="mb-2" />
              <p>Start a conversation with {conversation.serviceName}</p>
            </div>
          </div>
        ) : (
          <div className="flex-grow-1 overflow-auto p-3">
            <div className="d-flex flex-column gap-3">
              {messages.map((message) => (
              <div
                key={message.id}
                className={`d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`d-flex align-items-start gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                  style={{ maxWidth: '85%' }}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle ${
                    message.role === 'user' ? 'bg-primary' : 'bg-secondary'
                  }`} style={{ width: '32px', height: '32px' }}>
                    {message.role === 'user' ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`p-3 rounded-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-white'
                    }`}
                    style={{ wordBreak: 'break-word' }}
                  >
                    {message.role === 'assistant' ? (
                      <MarkdownRenderer content={message.content} />
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {sendingMessage && (
              <div className="d-flex justify-content-start">
                <div className="d-flex align-items-start gap-2">
                  <div className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-circle bg-secondary" style={{ width: '32px', height: '32px' }}>
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="p-3 rounded-3 bg-secondary text-white">
                    <Loader2 size={16} className="text-primary" style={{ animation: 'spin 1s linear infinite' }} />
                    <span className="ms-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-container p-3">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            className="form-control bg-dark border-secondary text-white"
            placeholder={`Message ${conversation.serviceName}...`}
            value={inputMessage}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sendingMessage}
            style={{ 
              borderTopRightRadius: '0',
              borderBottomRightRadius: '0'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || sendingMessage}
            style={{ 
              borderTopLeftRadius: '0',
              borderBottomLeftRadius: '0'
            }}
          >
            {sendingMessage ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatColumn;
