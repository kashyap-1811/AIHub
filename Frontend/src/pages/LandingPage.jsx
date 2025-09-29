import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowRight, 
  LogIn,
  User,
  Shield,
  Mail,
  Calendar,
  Star,
  Zap,
  Target
} from 'lucide-react';
import { FeatureSteps } from '../components/ui/feature-section';
import { BackgroundPaths } from '../components/BackgroundPaths';
import AIModelsInfographic from '../components/ui/AIModelsInfographic';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Check authentication status and redirect accordingly
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        console.log('LandingPage: User is authenticated, redirecting to chat...');
        navigate('/chat');
      } else {
        console.log('LandingPage: User is not authenticated, staying on landing page');
      }
    }
  }, [isAuthenticated, loading, navigate]);

  // Feature steps data for the landing page
  const landingFeatures = [
    {
      step: 'Step 1',
      title: 'Sign Up & Login',
      content: 'Create your account and securely log in to access the AIHub platform.',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    },
    {
      step: 'Step 2',
      title: 'Add API Keys',
      content: 'Configure your AI service API keys to start chatting with different AI models.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    },
    {
      step: 'Step 3',
      title: 'Start Chatting',
      content: 'Begin your AI journey with powerful conversations and intelligent assistance.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
    }
  ];

  const handleLogin = () => {
    console.log('LandingPage: Login button clicked!');
    console.log('LandingPage: Redirecting to login page...');
    navigate('/login');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <BackgroundPaths>
        <div className="landing-page-container d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Checking authentication...</p>
          </div>
        </div>
      </BackgroundPaths>
    );
  }

  return (
    <BackgroundPaths>
      <div className="landing-page-container">
        <div className="landing-page-content">
          <div className="container">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="mb-4">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    background: 'var(--accent-color)',
                    boxShadow: '0 8px 32px rgba(16, 163, 127, 0.3)'
                  }}
                >
                  <Shield size={40} className="text-white" />
                </div>
                <h1 className="display-3 fw-bold text-primary mb-3">Welcome to AIHub</h1>
                <p className="lead text-muted mb-4">Your AI Assistant Platform</p>
                <p className="text-muted mb-4">Connect with multiple AI services and have intelligent conversations in one place</p>
              </div>

            </div>

            {/* Feature Steps Section */}
            <div className="landing-section">
              <FeatureSteps
                features={landingFeatures}
                title="How to Get Started with AIHub"
                autoPlayInterval={4000}
                imageHeight="h-400px"
              />
            </div>

            {/* AI Models Infographic Section */}
            <div className="landing-section">
              <AIModelsInfographic />
            </div>

            {/* Login Button - After Feature Steps */}
            <div className="landing-section text-center">
              <div className="card bg-secondary border-primary shadow-lg" style={{ 
                borderRadius: '20px',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <div className="card-body p-5">
                  <h3 className="text-primary mb-3">Ready to Get Started?</h3>
                  <p className="text-muted mb-4">
                    Now that you know how AIHub works, let's begin your AI journey!
                  </p>
                  <button
                    className="btn btn-primary btn-lg px-5 py-3 d-flex align-items-center mx-auto login-btn"
                    onClick={handleLogin}
                    style={{ 
                      borderRadius: '25px',
                      fontWeight: '600',
                      fontSize: '1.2rem',
                      boxShadow: '0 8px 32px rgba(16, 163, 127, 0.4)',
                      minWidth: '250px',
                      height: '60px'
                    }}
                  >
                    {/* <LogIn size={20} className="me-2" /> */}
                    Get Started 
                    <ArrowRight size={20} className="ms-2" />
                  </button>
                </div>
              </div>
            </div>

            {/* Features Overview */}
            <div className="landing-section">
              <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="card bg-secondary border-primary shadow-lg" style={{ 
                  borderRadius: '20px'
                }}>
                  <div className="card-header border-primary p-4" style={{ 
                    background: 'transparent',
                    borderRadius: '20px 20px 0 0'
                  }}>
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ 
                          width: '50px', 
                          height: '50px',
                          background: 'var(--accent-color)'
                        }}
                      >
                        <Star size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="mb-1 text-primary" style={{ 
                          fontWeight: '600'
                        }}>
                          Why Choose AIHub?
                        </h4>
                        <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
                          Discover the power of multiple AI services in one platform
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    <div className="row g-4">
                      <div className="col-md-4">
                        <div className="text-center p-3">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{ 
                              width: '60px', 
                              height: '60px',
                              background: 'linear-gradient(135deg, #10a37f, #059669)'
                            }}
                          >
                            <Zap size={24} className="text-white" />
                          </div>
                          <h5 className="text-primary mb-2">Multiple AI Services</h5>
                          <p className="text-muted small">
                            Connect with ChatGPT, Gemini, Claude, and DeepSeek all in one place
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center p-3">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{ 
                              width: '60px', 
                              height: '60px',
                              background: 'linear-gradient(135deg, #4285f4, #1a73e8)'
                            }}
                          >
                            <Shield size={24} className="text-white" />
                          </div>
                          <h5 className="text-primary mb-2">Secure & Private</h5>
                          <p className="text-muted small">
                            Your API keys and conversations are encrypted and secure
                          </p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="text-center p-3">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{ 
                              width: '60px', 
                              height: '60px',
                              background: 'linear-gradient(135deg, #ff6b35, #e55a2b)'
                            }}
                          >
                            <Target size={24} className="text-white" />
                          </div>
                          <h5 className="text-primary mb-2">Easy to Use</h5>
                          <p className="text-muted small">
                            Intuitive interface designed for seamless AI interactions
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </BackgroundPaths>
  );
};

export default LandingPage;
