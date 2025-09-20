import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  HelpCircle, 
  Mail, 
  MessageSquare, 
  Github, 
  ExternalLink,
  CheckCircle,
  Send
} from 'lucide-react';

const SupportPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('Support form submitted:', formData);
    setSubmitted(true);
  };

  const supportChannels = [
    {
      icon: <Mail size={24} />,
      title: 'Email Support',
      description: 'Get help via email',
      contact: 'support@aihub.com',
      color: '#10a37f'
    },
    {
      icon: <MessageSquare size={24} />,
      title: 'Live Chat',
      description: 'Chat with our support team',
      contact: 'Available 24/7',
      color: '#4285f4'
    },
    {
      icon: <Github size={24} />,
      title: 'GitHub Issues',
      description: 'Report bugs and request features',
      contact: 'github.com/aihub/issues',
      color: '#6c757d'
    }
  ];

  const faqs = [
    {
      question: 'How do I add API keys?',
      answer: 'Go to your Profile page and click on "API Keys" section. Add your API keys for ChatGPT, Gemini, Claude, or DeepSeek.'
    },
    {
      question: 'Which AI models are supported?',
      answer: 'We support ChatGPT (OpenAI), Gemini (Google), Claude (Anthropic), and DeepSeek models.'
    },
    {
      question: 'How do I create a new chat?',
      answer: 'Click the "New Chat" button in the sidebar, enter a title, select an AI service, and start chatting!'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use secure encryption and your API keys are stored securely. We never share your data with third parties.'
    },
    {
      question: 'Can I use multiple AI models in one chat?',
      answer: 'Currently, each chat session is tied to one AI model. You can create separate chats for different models.'
    }
  ];

  if (submitted) {
    return (
      <div className="min-vh-100 bg-primary d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card bg-secondary border-primary text-center">
                <div className="card-body p-5">
                  <div className="mb-4">
                    <CheckCircle size={64} className="text-success" />
                  </div>
                  <h3 className="text-primary mb-3">Message Sent!</h3>
                  <p className="text-muted mb-4">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/')}
                  >
                    Back to Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-primary">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button
            className="btn btn-outline-secondary me-3"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} className="me-2" />
            Back to Chat
          </button>
          <h1 className="text-primary mb-0 d-flex align-items-center">
            <HelpCircle size={28} className="me-3" />
            Support
          </h1>
        </div>

        <div className="row">
          {/* Contact Form */}
          <div className="col-lg-8 mb-4">
            <div className="card bg-secondary border-primary">
              <div className="card-header border-primary">
                <h5 className="mb-0">Contact Us</h5>
                <small className="text-muted">Send us a message and we'll get back to you</small>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Message</label>
                      <textarea
                        className="form-control"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Describe your issue or question..."
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        <Send size={16} className="me-2" />
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Support Channels & FAQ */}
          <div className="col-lg-4">
            {/* Support Channels */}
            <div className="card bg-secondary border-primary mb-4">
              <div className="card-header border-primary">
                <h6 className="mb-0">Get Help</h6>
              </div>
              <div className="card-body">
                {supportChannels.map((channel, index) => (
                  <div key={index} className="d-flex align-items-center mb-3">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                      style={{ 
                        width: '40px', 
                        height: '40px',
                        backgroundColor: channel.color
                      }}
                    >
                      {channel.icon}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 text-primary">{channel.title}</h6>
                      <small className="text-muted">{channel.description}</small>
                      <div className="small text-muted">{channel.contact}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="card bg-secondary border-primary">
              <div className="card-header border-primary">
                <h6 className="mb-0">Frequently Asked Questions</h6>
              </div>
              <div className="card-body">
                {faqs.map((faq, index) => (
                  <div key={index} className="mb-3">
                    <h6 className="text-primary mb-2">{faq.question}</h6>
                    <p className="text-muted small mb-0">{faq.answer}</p>
                    {index < faqs.length - 1 && <hr className="my-3 border-primary" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
