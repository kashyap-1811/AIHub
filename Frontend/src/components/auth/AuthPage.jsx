import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-8">
            <div className="row g-4 align-items-center">
              {/* Left side - Branding */}
              <div className="col-lg-6 d-none d-lg-block">
                <div className="text-center text-white">
                  <div className="mb-4">
                    <div className="bg-white bg-opacity-20 p-4 rounded-3 d-inline-block">
                      <i className="bi bi-cpu-fill" style={{ fontSize: '4rem' }}></i>
                    </div>
                  </div>
                  
                  <h1 className="display-4 fw-bold mb-3">
                    AI Hub
                  </h1>
                  <p className="lead mb-5">
                    Connect with multiple AI models in one powerful platform
                  </p>

                  <div className="text-start">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-success bg-opacity-20 p-2 rounded me-3">
                        <i className="bi bi-stars text-success"></i>
                      </div>
                      <span>Chat with ChatGPT, Gemini, Claude, and DeepSeek</span>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-20 p-2 rounded me-3">
                        <i className="bi bi-layout-three-columns text-info"></i>
                      </div>
                      <span>Multi-column interface for simultaneous conversations</span>
                    </div>
                    
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-warning bg-opacity-20 p-2 rounded me-3">
                        <i className="bi bi-broadcast text-warning"></i>
                      </div>
                      <span>Broadcast messages to all AI models at once</span>
                    </div>
                    
                    <div className="d-flex align-items-center">
                      <div className="bg-danger bg-opacity-20 p-2 rounded me-3">
                        <i className="bi bi-shield-lock text-danger"></i>
                      </div>
                      <span>Secure API key management</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Auth Forms */}
              <div className="col-lg-6">
                {isLogin ? (
                  <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
                ) : (
                  <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
