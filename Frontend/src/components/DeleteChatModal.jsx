import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

const DeleteChatModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  chatName = "this chat",
  isDeleting = false 
}) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div 
          className="modal-content border-primary"
          style={{ 
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div 
            className="modal-header border-primary"
            style={{ 
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="d-flex align-items-center">
              <div className="me-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center" 
                  style={{ 
                    width: '40px', 
                    height: '40px',
                    backgroundColor: '#3b82f6'
                  }}
                >
                  <AlertTriangle size={20} className="text-white" />
                </div>
              </div>
              <div>
                <h5 
                  className="modal-title mb-0"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Delete Chat
                </h5>
                <small style={{ color: 'var(--text-muted)' }}>
                  This action cannot be undone
                </small>
              </div>
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onHide}
              disabled={isDeleting}
              style={{ 
                filter: 'invert(1)',
                opacity: isDeleting ? '0.5' : '1'
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          <div 
            className="modal-body"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <div className="d-flex align-items-start">
              <div className="me-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center" 
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    backgroundColor: '#1d4ed8'
                  }}
                >
                  <Trash2 size={16} className="text-white" />
                </div>
              </div>
              <div>
                <p 
                  className="mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Are you sure you want to delete <strong style={{ color: 'var(--accent-color)' }}>"{chatName}"</strong>?
                </p>
                <p 
                  className="mb-0 small"
                  style={{ color: 'var(--text-muted)' }}
                >
                  This will permanently delete all messages in this chat. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          
          <div 
            className="modal-footer border-primary"
            style={{ 
              backgroundColor: 'var(--bg-tertiary)',
              borderColor: 'var(--border-color)'
            }}
          >
            <button 
              type="button" 
              className="btn"
              onClick={onHide}
              disabled={isDeleting}
              style={{
                backgroundColor: 'var(--bg-quaternary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn d-flex align-items-center"
              onClick={onConfirm}
              disabled={isDeleting}
              style={{
                backgroundColor: '#2563eb',
                borderColor: '#2563eb',
                color: 'white'
              }}
            >
              {isDeleting ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Deleting...</span>
                  </div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="me-2" />
                  Delete Chat
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteChatModal;
