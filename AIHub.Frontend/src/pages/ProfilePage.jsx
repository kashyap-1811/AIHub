import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiKeyAPI } from '../services/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    serviceName: 'ChatGPT',
    key: ''
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiKeyAPI.getApiKeys();
      // Debug: Log the API response
      console.log('API Keys response:', response.data);
      // Ensure we have an array of valid API keys
      const apiKeys = Array.isArray(response.data) ? response.data : [];
      setApiKeys(apiKeys);
    } catch (error) {
      console.error('Failed to load API keys:', error);
      setApiKeys([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = async (e) => {
    e.preventDefault();
    if (!newApiKey.key.trim()) return;

    try {
      setLoading(true);
      await apiKeyAPI.saveApiKey({
        serviceName: newApiKey.serviceName,
        key: newApiKey.key
      });
      setNewApiKey({ serviceName: 'ChatGPT', key: '' });
      loadApiKeys();
    } catch (error) {
      console.error('Failed to add API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (serviceName) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) return;

    try {
      setLoading(true);
      await apiKeyAPI.deleteApiKey(serviceName);
      loadApiKeys();
    } catch (error) {
      console.error('Failed to delete API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getServiceColor = (serviceName) => {
    const colors = {
      ChatGPT: '#10a37f',
      Gemini: '#4285f4',
      Claude: '#ff6b35',
      DeepSeek: '#6366f1',
    };
    return colors[serviceName] || '#6c757d';
  };

  const getServiceIcon = (serviceName) => {
    const icons = {
      ChatGPT: 'bi-robot',
      Gemini: 'bi-gem',
      Claude: 'bi-lightning',
      DeepSeek: 'bi-search',
    };
    return icons[serviceName] || 'bi-robot';
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate('/')}
          >
            <i className="bi bi-arrow-left"></i> Back to Chat
          </button>
          <h1>Profile Settings</h1>
        </div>

        <div className="profile-content">
          {/* User Info Section */}
          <div className="profile-section">
            <h3>User Information</h3>
            <div className="user-info">
              <div className="user-avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="user-details">
                <h4>{user?.username || 'Unknown User'}</h4>
                <p>{user?.email || 'No email'}</p>
                <p className="text-muted">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
            <button
              className="btn btn-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>

          {/* API Keys Section */}
          <div className="profile-section">
            <h3>API Keys</h3>
            <p className="text-muted">
              Manage your API keys for different AI services
            </p>

            {/* Add New API Key */}
            <form onSubmit={handleAddApiKey} className="api-key-form">
              <div className="row">
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={newApiKey.serviceName}
                    onChange={(e) =>
                      setNewApiKey({ ...newApiKey, serviceName: e.target.value })
                    }
                  >
                    <option value="ChatGPT">ChatGPT</option>
                    <option value="Gemini">Gemini</option>
                    <option value="Claude">Claude</option>
                    <option value="DeepSeek">DeepSeek</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter API key"
                    value={newApiKey.key}
                    onChange={(e) =>
                      setNewApiKey({ ...newApiKey, key: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-md-2">
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* API Keys List */}
            <div className="api-keys-list">
              {apiKeys.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-key"></i>
                  <p>No API keys configured</p>
                </div>
              ) : (
                apiKeys.filter(apiKey => apiKey && apiKey.serviceName).map((apiKey) => (
                  <div key={apiKey.serviceName} className="api-key-item">
                    <div className="api-key-info">
                      <i
                        className={`bi ${getServiceIcon(apiKey.serviceName)}`}
                        style={{ color: getServiceColor(apiKey.serviceName) }}
                      ></i>
                      <div>
                        <h5>{apiKey.serviceName}</h5>
                        <p className="text-muted">
                          {(apiKey.key || apiKey.ApiKey) ? 
                            `${(apiKey.key || apiKey.ApiKey).substring(0, 8)}...` : 
                            (apiKey.HasKey ? 'Key configured' : 'No key')
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteApiKey(apiKey.serviceName)}
                      disabled={loading}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
