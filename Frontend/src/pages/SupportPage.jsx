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
  Send,
  Phone,
  MapPin
} from 'lucide-react';
import { ContactCard } from '../components/ui/contact-card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import './SupportPage.css';

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
    <div className="support-page-container">
      <div className="container py-5">
        {/* Header */}
        <div className="text-center mb-4">
          <button
            className="btn btn-outline-secondary btn-sm mb-3"
            onClick={() => navigate('/')}
            style={{ 
              borderRadius: '25px',
              padding: '8px 20px'
            }}
          >
            <ArrowLeft size={16} className="me-2" />
            Back to Chat
          </button>
        </div>

      
      {/* API Setup Instructions */}
      <div className="row mt-2">
        <div className="col-12">
          <div className="card bg-secondary border-primary" style={{ 
            borderRadius: '15px',
            backdropFilter: 'blur(10px)',
            background: 'rgba(45, 55, 72, 0.95)'
          }}>
            <div className="card-body p-4">
              <h3 className="text-primary mb-4 text-center">
                <Github size={24} className="me-2" />
                How to Add API Keys
              </h3>
              <div className="row">
                <div className="col-md-8 mx-auto">
                  <div className="api-instructions">
                    <div className="step-item mb-4">
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <h5 className="text-primary mb-2">Go to OpenRouter</h5>
                        <p className="text-secondary mb-0">
                          Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" 
                          className="text-decoration-none" style={{ color: 'var(--accent-color)' }}>
                            openrouter.ai
                          </a> and sign in to your account
                        </p>
                      </div>
                    </div>
                    
                    <div className="step-item mb-4">
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <h5 className="text-primary mb-2">Navigate to Models</h5>
                        <p className="text-secondary mb-0">
                          Click on the "Models" section in the navigation menu
                        </p>
                      </div>
                    </div>
                    
                    <div className="step-item mb-4">
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <h5 className="text-primary mb-2">Select Your AI Service</h5>
                        <p className="text-secondary mb-0">
                          In the series, go to your preferred AI service:
                          <br />
                          <span className="badge bg-primary me-2 mt-2">ChatGPT</span>
                          <span className="badge bg-primary me-2 mt-2">Gemini</span>
                          <span className="badge bg-primary me-2 mt-2">Claude</span>
                          <span className="badge bg-primary me-2 mt-2">DeepSeek</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="step-item mb-4">
                      <div className="step-number">4</div>
                      <div className="step-content">
                        <h5 className="text-primary mb-2">Go to API Selection</h5>
                        <p className="text-secondary mb-0">
                          Click on "API" or "API Keys" section for your selected model
                        </p>
                      </div>
                    </div>
                    
                    <div className="step-item mb-4">
                      <div className="step-number">5</div>
                      <div className="step-content">
                        <h5 className="text-primary mb-2">Create API Key</h5>
                        <p className="text-secondary mb-0">
                          Click "Create API Key" or "Generate Key" button
                        </p>
                      </div>
                    </div>
                    
                    <div className="step-item mb-4">
                      <div className="step-number">6</div>
                      <div className="step-content">
                        <h5 className="text-primary mb-2">Copy the API Key</h5>
                        <p className="text-secondary mb-0">
                          Copy the generated API key to your clipboard
                        </p>
                      </div>
                    </div>
                    
                    <div className="step-item mb-4">
                      <div className="step-number">7</div>
                      <div className="step-content">
                        <h5 className="text-primary mb-2">Add to Profile Page</h5>
                        <p className="text-secondary mb-0">
                          Go to your <a href="/profile" className="text-decoration-none" 
                          style={{ color: 'var(--accent-color)' }}>Profile Page</a> and paste the API key in the corresponding field
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="alert alert-info mt-4" style={{
                    background: 'rgba(16, 163, 127, 0.1)',
                    border: '1px solid rgba(16, 163, 127, 0.3)',
                    color: 'var(--text-primary)'
                  }}>
                    <strong>💡 Pro Tip:</strong> Keep your API keys secure and never share them publicly. 
                    You can create multiple API keys for different services.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br></br>

      {/* Contact Card */}
      <div className="row justify-content-center">
        <div className="col-12">
          <ContactCard
            title="Contact Us"
            description="If you have any questions regarding our Services or need help, please fill out the form here. We do our best to respond within 1 business day."
            contactInfo={[
              {
                icon: Mail,
                label: 'Email',
                value: 'support@aihub.com',
              },
              {
                icon: Phone,
                label: 'Phone',
                value: '+91 9876543210'
              },
              {
                icon: MapPin,
                label: 'Address',
                value: 'DDU, Nadiad',
              }
            ]}
          >
            {submitted ? (
              <div className="text-center py-4">
                <CheckCircle size={48} className="text-success mb-3" />
                <h4 className="text-primary mb-2">Message Sent!</h4>
                <p className="text-secondary mb-4">
                  Thank you for contacting us. We'll get back to you soon.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form-field">
                  <Label>Name</Label>
                  <Input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="contact-form-field">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="contact-form-field">
                  <Label>Phone</Label>
                  <Input 
                    type="tel" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="contact-form-field">
                  <Label>Message</Label>
                  <Textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows="4"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100"
                >
                  <Send size={16} className="me-2" />
                  Submit
                </Button>
              </form>
            )}
          </ContactCard>
        </div>
      </div>


      {/* FAQ Section */}
      <div className="row mt-5">
        <div className="col-12">
          <h3 className="text-primary mb-4 text-center">Frequently Asked Questions</h3>
          <div className="row">
            {faqs.map((faq, index) => (
              <div key={index} className="col-md-6 mb-4">
                <div className="card bg-secondary border-primary h-100" style={{ 
                  borderRadius: '15px',
                  backdropFilter: 'blur(10px)',
                  background: 'rgba(45, 55, 72, 0.95)'
                }}>
                  <div className="card-body p-4">
                    <h5 className="text-primary mb-3">
                      <HelpCircle size={20} className="me-2" />
                      {faq.question}
                    </h5>
                    <p className="text-secondary">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      

      {/* Footer */}
      <div className="text-center mt-5">
        <p className="text-muted">
          Need more help? Check out our{' '}
          <a href="#" className="text-decoration-none" style={{ color: 'var(--accent-color)' }}>
            documentation
          </a>{' '}
          or{' '}
          <a href="#" className="text-decoration-none" style={{ color: 'var(--accent-color)' }}>
            community forum
          </a>
        </p>
      </div>
      </div>
    </div>
  );
};

export default SupportPage;
