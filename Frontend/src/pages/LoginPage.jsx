import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login({
          username: formData.username,
          password: formData.password
        });
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-primary">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle mb-3" style={{ width: '60px', height: '60px' }}>
                    <MessageSquare size={24} className="text-white" />
                  </div>
                  <h2 className="fw-bold text-primary mb-2">AIHub</h2>
                  <p className="text-muted">Your AI Assistant Platform</p>
                </div>

                {/* Tabs */}
                <div className="d-flex mb-4">
                  <button
                    className={`btn flex-fill ${isLogin ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </button>
                  <button
                    className={`btn flex-fill ms-2 ${!isLogin ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setIsLogin(false)}
                  >
                    Register
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <div className="me-2">⚠️</div>
                      <div>{error}</div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      <User size={16} className="me-2" />
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="form-control"
                      placeholder="Enter your username"
                    />
                  </div>

                  {!isLogin && (
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        <Mail size={16} className="me-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="Enter your email"
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      <Lock size={16} className="me-2" />
                      Password
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {!isLogin && (
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label">
                        <Lock size={16} className="me-2" />
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="form-control"
                        placeholder="Confirm your password"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-100 py-2"
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isLogin ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      isLogin ? 'Sign In' : 'Create Account'
                    )}
                  </button>
                </form>

                {/* Footer */}
                <div className="text-center mt-4">
                  <p className="text-muted small">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
