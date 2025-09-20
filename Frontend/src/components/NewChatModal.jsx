import React, { useState } from 'react';
import { useChat } from '../contexts/ChatContext';
import { Modal, Button, Form } from 'react-bootstrap';
import { MessageSquare, Loader2 } from 'lucide-react';

const NewChatModal = ({ show, onHide, onChatCreated }) => {
  const { createChatSession } = useChat();
  const [formData, setFormData] = useState({
    title: '',
    serviceName: 'ChatGPT'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const services = [
    { value: 'ChatGPT', label: 'ChatGPT', icon: '🤖' },
    { value: 'Gemini', label: 'Gemini', icon: '💎' },
    { value: 'Claude', label: 'Claude', icon: '⚡' },
    { value: 'DeepSeek', label: 'DeepSeek', icon: '🔍' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please enter a chat title');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createChatSession(formData.title.trim(), formData.serviceName);
      
      if (result.success) {
        onChatCreated(result.session);
        setFormData({ title: '', serviceName: 'ChatGPT' });
        onHide();
      } else {
        setError(result.error || 'Failed to create chat');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ title: '', serviceName: 'ChatGPT' });
      setError('');
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-primary">
        <Modal.Title className="d-flex align-items-center">
          <MessageSquare size={20} className="me-2 text-primary" />
          New Chat
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <div className="me-2">⚠️</div>
              <div>{error}</div>
            </div>
          )}

          <div className="mb-3">
            <Form.Label htmlFor="title">Chat Title</Form.Label>
            <Form.Control
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a title for your chat..."
              required
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <Form.Label htmlFor="serviceName">AI Service</Form.Label>
            <Form.Select
              id="serviceName"
              name="serviceName"
              value={formData.serviceName}
              onChange={handleChange}
              disabled={loading}
            >
              {services.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.icon} {service.label}
                </option>
              ))}
            </Form.Select>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-primary">
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading || !formData.title.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="me-2 spinner-border-sm" />
                Creating...
              </>
            ) : (
              'Create Chat'
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default NewChatModal;
