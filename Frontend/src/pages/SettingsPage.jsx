import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiKeyAPI } from '../services/api';
import { 
  ArrowLeft, 
  Key, 
  Plus, 
  Trash2, 
  Save, 
  Check,
  AlertCircle,
  Loader2,
  Shield,
  Settings
} from 'lucide-react';
import { BackgroundPaths } from '../components/BackgroundPaths';
import './ProfilePage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    serviceName: 'ChatGPT',
    apiKey: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const services = [
    { 
      value: 'ChatGPT', 
      label: 'ChatGPT', 
      icon: (
        <img 
          src="https://img.icons8.com/ios-filled/50/chatgpt.png" 
          alt="ChatGPT" 
          style={{ width: '16px', height: '16px' }}
        />
      ), 
      color: '#10a37f' 
    },
    { 
      value: 'Gemini', 
      label: 'Gemini', 
      icon: (
        <img 
          src="https://img.icons8.com/ios-filled/50/gemini-ai.png" 
          alt="Gemini" 
          style={{ width: '16px', height: '16px' }}
        />
      ), 
      color: '#4285f4' 
    },
    { 
      value: 'Claude', 
      label: 'Claude', 
      icon: (
        <img 
          src="https://img.icons8.com/ios-filled/50/claude-ai.png" 
          alt="Claude" 
          style={{ width: '16px', height: '16px' }}
        />
      ), 
      color: '#ff6b35' 
    },
    { 
      value: 'DeepSeek', 
      label: 'DeepSeek', 
      icon: (
        <img 
          src="https://img.icons8.com/ios-filled/50/deepseek.png" 
          alt="DeepSeek" 
          style={{ width: '16px', height: '16px' }}
        />
      ), 
      color: '#6366f1' 
    },
  ];

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiKeyAPI.getApiKeys();
      setApiKeys(response.data || []);
    } catch (error) {
      console.error('Error loading API keys:', error);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = async (e) => {
    e.preventDefault();
    if (!newApiKey.apiKey.trim()) return;
  
    try {
      setLoading(true);
      setError('');
      const response = await apiKeyAPI.addApiKey(newApiKey);
  
      // ✅ Check backend message instead of success flag
      if (response.data.message) {
        setSuccess(response.data.message);
        setNewApiKey({ serviceName: 'ChatGPT', apiKey: '' });
        loadApiKeys();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'Failed to add API key');
      }
    } catch (error) {
      console.error('Error adding API key:', error);
      setError(error.response?.data?.message || 'Failed to add API key');
    } finally {
      setLoading(false);
    }
  };
  

  const handleDeleteApiKey = async (serviceName) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;
  
    try {
      setLoading(true);
      const response = await apiKeyAPI.deleteApiKey(serviceName);
  
      if (response.data.message) {
        setSuccess(response.data.message);
        loadApiKeys();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      setError(error.response?.data?.message || 'Failed to delete API key');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <BackgroundPaths>
      <div className="profile-page-container">
        <div className="profile-page-content">
          <div className="container">
            {/* Header */}
            <div className="text-center mb-5">
              <button
                className="btn btn-outline-secondary btn-sm mb-3"
                onClick={() => navigate('/chat')}
                style={{ 
                  borderRadius: '25px',
                  padding: '8px 20px'
                }}
              >
                <ArrowLeft size={16} className="me-2" />
                Back to Chat
              </button>
              <h1 className="display-4 fw-bold text-primary mb-3">API Settings</h1>
              <p className="lead text-muted">Manage your AI service API keys</p>
            </div>

            {/* API Keys Management */}
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
                        <Shield size={24} className="text-white" />
                      </div>
                      <div>
                        <h4 className="mb-1 text-primary" style={{ 
                          fontWeight: '600'
                        }}>
                          API Keys Management
                        </h4>
                        <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
                          Configure your AI service API keys securely
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    {/* Success/Error Messages */}
                    {success && (
                      <div className="alert alert-success d-flex align-items-center mb-4" style={{ 
                        borderRadius: '10px'
                      }}>
                        <Check size={20} className="me-2" />
                        {success}
                      </div>
                    )}
                    {error && (
                      <div className="alert alert-danger d-flex align-items-center mb-4" style={{ 
                        borderRadius: '10px'
                      }}>
                        <AlertCircle size={20} className="me-2" />
                        {error}
                      </div>
                    )}

                    {/* Add New API Key Form */}
                    <div className="mb-4 p-4 bg-tertiary" style={{ 
                      borderRadius: '15px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <h6 className="mb-3 text-primary" style={{ 
                        fontWeight: '600'
                      }}>
                        {/* <Plus size={18} className="me-2" /> */}
                        Add New API Key
                      </h6>
                      
                      <form onSubmit={handleAddApiKey}>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <label className="form-label fw-semibold text-primary">
                              Service Provider
                            </label>
                            <select
                              className="form-select"
                              value={newApiKey.serviceName}
                              onChange={(e) => setNewApiKey({ ...newApiKey, serviceName: e.target.value })}
                              disabled={loading}
                              style={{ 
                                borderRadius: '10px',
                                padding: '12px 15px'
                              }}
                            >
                              {services.map((service) => (
                                <option key={service.value} value={service.value}>
                                  {service.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label fw-semibold text-primary">
                              API Key
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              placeholder="Enter your API key securely..."
                              value={newApiKey.apiKey}
                              onChange={(e) => setNewApiKey({ ...newApiKey, apiKey: e.target.value })}
                              required
                              disabled={loading}
                              style={{ 
                                borderRadius: '10px',
                                padding: '12px 15px'
                              }}
                            />
                          </div>
                          <div className="col-md-2">
                            <label className="form-label">&nbsp;</label>
                            <button
                              type="submit"
                              className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                              disabled={loading || !newApiKey.apiKey.trim()}
                              style={{ 
                                borderRadius: '10px',
                                padding: '12px',
                                fontWeight: '600'
                              }}
                            >
                              {loading ? (
                                <Loader2 size={16} className="spinner-border-sm" />
                              ) : (
                                <Save size={16} />
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Existing API Keys */}
                    <div>
                      <h6 className="mb-3 text-primary" style={{ 
                        fontWeight: '600'
                      }}>
                        <Key size={18} className="me-2" />
                        Your API Keys ({apiKeys.length})
                      </h6>
                      
                      {loading && apiKeys.length === 0 ? (
                        <div className="text-center py-4">
                          <Loader2 size={32} className="spinner-border text-primary" />
                          <p className="text-muted mt-2">Loading API keys...</p>
                        </div>
                      ) : apiKeys.length === 0 ? (
                        <div className="text-center py-4">
                          <Key size={48} className="text-muted mb-3" />
                          <p className="text-muted">No API keys configured yet</p>
                          <small className="text-muted">Add your first API key above to get started</small>
                        </div>
                      ) : (
                        <div className="row g-3">
                          {apiKeys.map((key) => (
                            <div key={key.id} className="col-md-6">
                              <div className="p-3 bg-tertiary border border-primary rounded" style={{ 
                                borderRadius: '12px'
                              }}>
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="d-flex align-items-center">
                                    <div 
                                      className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                      style={{ 
                                        width: '32px', 
                                        height: '32px',
                                        backgroundColor: services.find(s => s.value === key.serviceName)?.color || '#6c757d'
                                      }}
                                    >
                                      <span style={{ fontSize: '14px' }}>
                                        {services.find(s => s.value === key.serviceName)?.icon || '🔑'}
                                      </span>
                                    </div>
                                    <div>
                                      <h6 className="mb-0 text-primary" style={{ fontSize: '0.9rem' }}>
                                        {key.serviceName}
                                      </h6>
                                      <small className="text-muted">
                                        {key.apiKey ? '••••••••' + key.apiKey.slice(-4) : 'No key'}
                                      </small>
                                    </div>
                                  </div>
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDeleteApiKey(key.serviceName)}
                                    disabled={loading}
                                    style={{ 
                                      borderRadius: '6px',
                                      padding: '4px 8px'
                                    }}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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

export default SettingsPage;
