import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiKeyAPI } from '../services/api';
import { 
  ArrowLeft, 
  User, 
  Key, 
  Plus, 
  Trash2, 
  Save, 
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    serviceName: 'ChatGPT',
    apiKey: ''
  });
  const [editingKey, setEditingKey] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const services = [
    { value: 'ChatGPT', label: 'ChatGPT', icon: '🤖', color: '#10a37f' },
    { value: 'Gemini', label: 'Gemini', icon: '💎', color: '#4285f4' },
    { value: 'Claude', label: 'Claude', icon: '⚡', color: '#ff6b35' },
    { value: 'DeepSeek', label: 'DeepSeek', icon: '🔍', color: '#6366f1' },
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
      console.error('Failed to load API keys:', error);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = async (e) => {
    e.preventDefault();
    if (!newApiKey.apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await apiKeyAPI.saveApiKey(newApiKey);
      setNewApiKey({ serviceName: 'ChatGPT', apiKey: '' });
      setSuccess('API key saved successfully');
      loadApiKeys();
    } catch (error) {
      console.error('Failed to add API key:', error);
      setError('Failed to save API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (serviceName) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;

    try {
      setLoading(true);
      await apiKeyAPI.deleteApiKey(serviceName);
      setSuccess('API key deleted successfully');
      loadApiKeys();
    } catch (error) {
      console.error('Failed to delete API key:', error);
      setError('Failed to delete API key');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getServiceInfo = (serviceName) => {
    return services.find(s => s.value === serviceName) || services[0];
  };

  const maskApiKey = (key) => {
    if (!key) return 'No key';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

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
          <h1 className="text-primary mb-0">Profile Settings</h1>
        </div>

        <div className="row">
          {/* User Info */}
          <div className="col-md-4 mb-4">
            <div className="card bg-secondary border-primary">
              <div className="card-body text-center">
                <div className="mb-3">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                    <User size={32} className="text-white" />
                  </div>
                </div>
                <h5 className="text-primary mb-1">{user?.username || 'Unknown User'}</h5>
                <p className="text-muted mb-3">{user?.email || 'No email'}</p>
                <button
                  className="btn btn-danger w-100"
                  onClick={handleLogout}
                >
                  <ArrowLeft size={16} className="me-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="col-md-8">
            <div className="card bg-secondary border-primary">
              <div className="card-header border-primary">
                <h5 className="mb-0 d-flex align-items-center">
                  <Key size={20} className="me-2" />
                  API Keys
                </h5>
                <small className="text-muted">Manage your API keys for different AI services</small>
              </div>
              <div className="card-body">
                {/* Add New API Key Form */}
                <form onSubmit={handleAddApiKey} className="mb-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Service</label>
                      <select
                        className="form-select"
                        value={newApiKey.serviceName}
                        onChange={(e) => setNewApiKey({ ...newApiKey, serviceName: e.target.value })}
                        disabled={loading}
                      >
                        {services.map((service) => (
                          <option key={service.value} value={service.value}>
                            {service.icon} {service.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">API Key</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter your API key..."
                        value={newApiKey.apiKey}
                        onChange={(e) => setNewApiKey({ ...newApiKey, apiKey: e.target.value })}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">&nbsp;</label>
                      <button
                        type="submit"
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                        disabled={loading || !newApiKey.apiKey.trim()}
                      >
                        {loading ? (
                          <Loader2 size={16} className="spinner-border-sm" />
                        ) : (
                          <>
                            <Save size={16} className="me-1" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {/* Error/Success Messages */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-3">
                    <AlertCircle size={16} className="me-2" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="alert alert-success d-flex align-items-center mb-3">
                    <Check size={16} className="me-2" />
                    {success}
                  </div>
                )}

                {/* API Keys List */}
                <div className="row g-3">
                  {apiKeys.length === 0 ? (
                    <div className="col-12 text-center py-4">
                      <div className="text-muted mb-2">
                        <Key size={32} />
                      </div>
                      <p className="text-muted">No API keys configured</p>
                    </div>
                  ) : (
                    apiKeys.map((apiKey) => {
                      const serviceInfo = getServiceInfo(apiKey.serviceName);
                      return (
                        <div key={apiKey.serviceName} className="col-md-6">
                          <div className="card bg-tertiary border-primary">
                            <div className="card-body">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                  <div 
                                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                    style={{ 
                                      width: '40px', 
                                      height: '40px',
                                      backgroundColor: serviceInfo.color,
                                      fontSize: '18px'
                                    }}
                                  >
                                    {serviceInfo.icon}
                                  </div>
                                  <div>
                                    <h6 className="mb-1 text-primary">{apiKey.serviceName}</h6>
                                    <small className="text-muted">
                                      {maskApiKey(apiKey.apiKey || apiKey.ApiKey)}
                                    </small>
                                  </div>
                                </div>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteApiKey(apiKey.serviceName)}
                                  disabled={loading}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
