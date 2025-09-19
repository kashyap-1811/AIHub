import React, { useState } from 'react';

const SupportSection = ({ onBack }) => {
  const [copied, setCopied] = useState({});

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const apiKeyInstructions = [
    {
      service: 'ChatGPT (OpenAI)',
      steps: [
        'Visit https://platform.openai.com/api-keys',
        'Sign in to your OpenAI account',
        'Click "Create new secret key"',
        'Give your key a name (e.g., "AI Hub")',
        'Copy the generated API key',
        'Paste it in the AI Hub settings'
      ],
      link: 'https://platform.openai.com/api-keys'
    },
    {
      service: 'Gemini (Google)',
      steps: [
        'Visit https://makersuite.google.com/app/apikey',
        'Sign in to your Google account',
        'Click "Create API Key"',
        'Copy the generated API key',
        'Paste it in the AI Hub settings'
      ],
      link: 'https://makersuite.google.com/app/apikey'
    },
    {
      service: 'Claude (Anthropic)',
      steps: [
        'Visit https://console.anthropic.com/',
        'Sign in to your Anthropic account',
        'Go to "API Keys" section',
        'Click "Create Key"',
        'Give your key a name',
        'Copy the generated API key',
        'Paste it in the AI Hub settings'
      ],
      link: 'https://console.anthropic.com/'
    },
    {
      service: 'DeepSeek',
      steps: [
        'Visit https://platform.deepseek.com/',
        'Sign in to your DeepSeek account',
        'Go to "API Keys" section',
        'Click "Create API Key"',
        'Copy the generated API key',
        'Paste it in the AI Hub settings'
      ],
      link: 'https://platform.deepseek.com/'
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with AI Hub?',
      answer: 'First, create an account and sign in. Then, go to Settings and add your API keys for the AI services you want to use. Finally, create a new chat session and start chatting!'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes! All API keys are encrypted and stored securely. Your chat messages are stored locally and can be deleted at any time. We never share your data with third parties.'
    },
    {
      question: 'Can I use multiple AI models at the same time?',
      answer: 'Absolutely! You can create multiple chat sessions with different AI models and have them all open simultaneously. You can also broadcast a message to all active AI models at once.'
    },
    {
      question: 'What if I run out of API credits?',
      answer: 'If you run out of credits for a specific AI service, that service will stop working until you add more credits to your account with that provider.'
    },
    {
      question: 'Can I save my chat sessions?',
      answer: 'Yes! All your chat sessions are automatically saved and can be accessed from the sidebar. You can create new sessions or continue existing ones.'
    }
  ];

  return (
    <div className="vh-100 d-flex flex-column bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-bottom px-4 py-3">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={onBack}
            className="btn btn-secondary d-flex align-items-center gap-2"
          >
            <i className="bi bi-arrow-left"></i>
            <span>Back</span>
          </button>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary p-2 rounded">
              <i className="bi bi-question-circle-fill text-white"></i>
            </div>
            <h1 className="h2 fw-bold text-dark mb-0">Support & Help</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-grow-1 overflow-auto p-4">
        <div className="container-fluid">
          <div className="row g-4">
            {/* Getting Started */}
            <div className="col-12">
              <div className="card">
                <div className="card-body p-4">
                  <h2 className="h4 fw-semibold text-dark mb-4 d-flex align-items-center">
                    <i className="bi bi-chat-dots-fill me-2 text-primary"></i>
                    Getting Started
                  </h2>
                  <div className="alert alert-info">
                    <h3 className="h6 fw-medium text-info mb-2">Quick Start Guide</h3>
                    <ol className="mb-0">
                      <li>Create an account or sign in</li>
                      <li>Go to Settings and add your API keys</li>
                      <li>Create a new chat session</li>
                      <li>Start chatting with AI models!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* API Key Instructions */}
            <div className="col-12">
              <div className="card">
                <div className="card-body p-4">
                  <h2 className="h4 fw-semibold text-dark mb-4 d-flex align-items-center">
                    <i className="bi bi-key-fill me-2 text-primary"></i>
                    How to Get API Keys
                  </h2>
                  <div className="row g-4">
                    {apiKeyInstructions.map((instruction, index) => (
                      <div key={index} className="col-12 col-md-6">
                        <div className="border rounded p-3 h-100">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h3 className="h6 fw-semibold text-dark mb-0">{instruction.service}</h3>
                            <a
                              href={instruction.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                              <span>Visit</span>
                            </a>
                          </div>
                          <ol className="mb-0 small">
                            {instruction.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="mb-1">{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="col-12">
              <div className="card">
                <div className="card-body p-4">
                  <h2 className="h4 fw-semibold text-dark mb-4 d-flex align-items-center">
                    <i className="bi bi-question-circle-fill me-2 text-primary"></i>
                    Frequently Asked Questions
                  </h2>
                  <div className="d-flex flex-column gap-3">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-start border-primary border-3 ps-3">
                        <h3 className="h6 fw-medium text-dark mb-1">{faq.question}</h3>
                        <p className="text-muted small mb-0">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="col-12">
              <div className="card">
                <div className="card-body p-4">
                  <h2 className="h4 fw-semibold text-dark mb-4">Need More Help?</h2>
                  <div className="bg-light rounded p-3">
                    <p className="text-muted mb-3">
                      If you're still having trouble, here are some additional resources:
                    </p>
                    <ul className="mb-0 small text-muted">
                      <li className="mb-1">• Check that your API keys are valid and have sufficient credits</li>
                      <li className="mb-1">• Make sure you have a stable internet connection</li>
                      <li className="mb-1">• Try refreshing the page if you encounter any issues</li>
                      <li>• Clear your browser cache if problems persist</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportSection;
