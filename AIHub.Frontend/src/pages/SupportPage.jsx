import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SupportPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="support-page">
        <div className="support-container">
          <div className="support-header">
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate('/')}
            >
              <i className="bi bi-arrow-left"></i> Back to Chat
            </button>
            <h1>Support</h1>
          </div>

          <div className="support-content">
            <div className="success-message">
              <i className="bi bi-check-circle-fill text-success"></i>
              <h3>Message Sent Successfully!</h3>
              <p>
                Thank you for contacting us. We'll get back to you within 24 hours.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    category: 'general'
                  });
                }}
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="support-page">
      <div className="support-container">
        <div className="support-header">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
          >
            <i className="bi bi-arrow-left"></i> Back to Chat
          </button>
          <h1>Support</h1>
        </div>

        <div className="support-content">
          <div className="support-info">
            <h3>Get Help</h3>
            <p>
              Having trouble with AIHub? We're here to help! Send us a message
              and we'll get back to you as soon as possible.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="support-form">
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                className="form-control"
                placeholder="Please describe your issue or question in detail..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Send Message
                </>
              )}
            </button>
          </form>

          <div className="support-contact">
            <h4>Other Ways to Reach Us</h4>
            <div className="contact-methods">
              <div className="contact-item">
                <i className="bi bi-envelope"></i>
                <div>
                  <h5>Email</h5>
                  <p>support@aihub.com</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="bi bi-chat-dots"></i>
                <div>
                  <h5>Live Chat</h5>
                  <p>Available 24/7</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="bi bi-book"></i>
                <div>
                  <h5>Documentation</h5>
                  <p>docs.aihub.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
