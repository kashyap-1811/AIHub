import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Save, Bot, MessageSquare, Plus } from 'lucide-react';

const ColumnManagementModal = ({ 
  isOpen, 
  onClose, 
  session, 
  conversations = [], 
  activeConversations = [],
  onUpdateColumn, 
  onDeleteColumn,
  onShowColumn,
  onHideColumn
}) => {
  const [editingColumn, setEditingColumn] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    if (editingColumn) {
      setEditTitle(editingColumn.title);
    }
  }, [editingColumn]);

  const handleEdit = (conversation) => {
    setEditingColumn(conversation);
  };

  const handleSave = () => {
    if (editingColumn && editTitle.trim()) {
      onUpdateColumn(editingColumn.id, editTitle.trim());
      setEditingColumn(null);
      setEditTitle('');
    }
  };

  const handleCancel = () => {
    setEditingColumn(null);
    setEditTitle('');
  };

  const handleDelete = (conversationId) => {
    if (window.confirm('Are you sure you want to delete this column? This action cannot be undone.')) {
      onDeleteColumn(conversationId);
    }
  };

  const handleShowColumn = (conversationId) => {
    if (onShowColumn) {
      onShowColumn(conversationId);
    }
  };

  const handleHideColumn = (conversationId) => {
    if (onHideColumn) {
      onHideColumn(conversationId);
    }
  };

  const isActiveConversation = (conversationId) => {
    if (!Array.isArray(activeConversations)) {
      return false;
    }
    return activeConversations.some(conv => conv.id === conversationId);
  };

  const getDisplayConversations = () => {
    if (!Array.isArray(conversations)) {
      console.warn('Conversations is not an array:', conversations);
      return [];
    }
    return conversations;
  };

  // Show loading state if conversations are being fetched
  if (conversations === undefined || conversations === null) {
    return (
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content bg-dark border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title text-white">
                Manage Columns - {session?.title}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>
            <div className="modal-body text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2">Loading columns...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getServiceIcon = (serviceName) => {
    switch (serviceName) {
      case 'ChatGPT':
        return <Bot size={16} className="text-primary" />;
      case 'Gemini':
        return <MessageSquare size={16} className="text-info" />;
      case 'Claude':
        return <Bot size={16} className="text-warning" />;
      case 'DeepSeek':
        return <MessageSquare size={16} className="text-success" />;
      default:
        return <Bot size={16} className="text-primary" />;
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

  if (!isOpen) return null;

  // Debug logging
  console.log('ColumnManagementModal rendering:', {
    isOpen,
    session,
    conversations: conversations?.length || 0,
    activeConversations: activeConversations?.length || 0,
    conversationsData: conversations,
    activeConversationsData: activeConversations
  });

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title text-white">
              Manage Columns - {session?.title}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>
          
          <div className="modal-body">
            {(() => {
              const displayConversations = getDisplayConversations();
              
              if (displayConversations.length === 0) {
                return (
                  <div className="text-center text-muted py-4">
                    <Bot size={32} className="mb-2" />
                    <p>No columns found for this chat</p>
                    <small className="text-muted">Create a new column by clicking "Add Column" in the chat interface</small>
                  </div>
                );
              }
              
              return (
                <div className="list-group">
                  {displayConversations.map((conversation) => {
                    if (!conversation || !conversation.id) {
                      console.warn('Invalid conversation:', conversation);
                      return null;
                    }
                    
                    const isActive = isActiveConversation(conversation.id);
                    return (
                  <div
                    key={conversation.id}
                    className="list-group-item bg-secondary border-secondary d-flex align-items-center justify-content-between"
                  >
                    <div className="d-flex align-items-center flex-grow-1">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          backgroundColor: getServiceColor(conversation.serviceName)
                        }}
                      >
                        {getServiceIcon(conversation.serviceName)}
                      </div>
                      
                      {editingColumn?.id === conversation.id ? (
                        <div className="flex-grow-1 d-flex align-items-center">
                          <input
                            type="text"
                            className="form-control form-control-sm me-2"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                            autoFocus
                          />
                          <button
                            className="btn btn-sm btn-success me-1"
                            onClick={handleSave}
                            disabled={!editTitle.trim()}
                          >
                            <Save size={14} />
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={handleCancel}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2">
                            <div className="text-white fw-bold">{conversation.title}</div>
                            {isActive ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">Hidden</span>
                            )}
                          </div>
                          <small className="text-muted">{conversation.serviceName}</small>
                        </div>
                      )}
                    </div>
                    
                    {editingColumn?.id !== conversation.id && (
                      <div className="d-flex gap-1">
                        {!isActive && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleShowColumn(conversation.id)}
                            title="Show column"
                          >
                            <Plus size={14} />
                          </button>
                        )}
                        {isActive && (
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleHideColumn(conversation.id)}
                            title="Hide column"
                          >
                            <EyeOff size={14} />
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(conversation)}
                          title="Edit column name"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(conversation.id)}
                          title="Delete column permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  );
                  })}
                </div>
              );
            })()}
          </div>
          
          <div className="modal-footer border-secondary">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnManagementModal;
