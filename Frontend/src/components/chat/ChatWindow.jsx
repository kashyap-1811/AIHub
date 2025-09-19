import React, { useState, useRef, useEffect } from 'react';

const ChatWindow = ({ session, messages = [], onSendMessage, loading }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !loading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const getServiceColor = (serviceName) => {
    const colors = {
      'ChatGPT': 'bg-success text-white',
      'Gemini': 'bg-info text-white',
      'Claude': 'bg-warning text-dark',
      'DeepSeek': 'bg-primary text-white'
    };
    return colors[serviceName] || 'bg-secondary text-white';
  };

  return (
    <div className="d-flex flex-column h-100 bg-white rounded shadow-sm border">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light rounded-top">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary p-2 rounded">
            <i className="bi bi-robot text-white"></i>
          </div>
          <div>
            <h3 className="h6 fw-semibold text-dark mb-1">{session.title}</h3>
            {session.serviceName && (
              <span className={`badge ${getServiceColor(session.serviceName)}`}>
                {session.serviceName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3">
        {messages.length === 0 ? (
          <div className="text-center text-muted mt-5">
            <i className="bi bi-robot display-4 text-muted mb-3"></i>
            <p>Start a conversation with {session.serviceName || 'AI'}</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`d-flex ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`message-bubble p-3 rounded ${
                    message.role === 'user'
                      ? 'message-user'
                      : 'message-ai'
                  }`}
                >
                  <div className="d-flex align-items-start gap-2">
                    {message.role === 'assistant' && (
                      <i className="bi bi-robot flex-shrink-0 mt-1"></i>
                    )}
                    {message.role === 'user' && (
                      <i className="bi bi-person-fill flex-shrink-0 mt-1"></i>
                    )}
                    <div className="flex-grow-1">
                      <p className="mb-2 small">{message.content}</p>
                      {message.serviceName && message.role === 'assistant' && (
                        <span className={`badge ${getServiceColor(message.serviceName)}`}>
                          {message.serviceName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {loading && (
          <div className="d-flex justify-content-start">
            <div className="message-ai p-3 rounded">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-robot"></i>
                <div className="d-flex gap-1">
                  <div className="loading-dots"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-top">
        <form onSubmit={handleSubmit} className="d-flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${session.serviceName || 'AI'}...`}
            className="form-control"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="btn btn-primary d-flex align-items-center justify-content-center px-3"
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Sending...</span>
              </div>
            ) : (
              <i className="bi bi-send-fill"></i>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
