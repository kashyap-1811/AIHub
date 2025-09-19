import React, { useState, useEffect } from 'react';
import { apiKeyAPI } from '../../services/api';

const ApiKeySettings = ({ onBack }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState({});
  const [showKeys, setShowKeys] = useState({});
  const [formData, setFormData] = useState({
    ChatGPT: '',
    Gemini: '',
    Claude: '',
    DeepSeek: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const services = [
    { name: 'ChatGPT', description: 'OpenAI GPT models' },
    { name: 'Gemini', description: 'Google Gemini models' },
    { name: 'Claude', description: 'Anthropic Claude models' },
    { name: 'DeepSeek', description: 'DeepSeek models' }
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await apiKeyAPI.getApiKeys();
      console.log('Fetched API keys:', response.data);
      setApiKeys(response.data);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      setError('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = async (serviceName) => {
    const apiKey = formData[serviceName];
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      console.log('Saving API key for:', serviceName);
      const response = await apiKeyAPI.saveApiKey({
        serviceName,
        apiKey: apiKey.trim()
      });
      console.log('Save response:', response.data);
      
      setFormData(prev => ({ ...prev, [serviceName]: '' }));
      await fetchApiKeys();
    } catch (error) {
      console.error('Save API key error:', error);
      setError(error.response?.data?.message || 'Failed to save API key');
    } finally {
      setSaving(false);
    }
  };

  const handleValidateApiKey = async (serviceName) => {
    try {
      setValidating(prev => ({ ...prev, [serviceName]: true }));
      console.log('Validating API key for:', serviceName);
      const response = await apiKeyAPI.validateApiKey(serviceName);
      console.log('Validation response:', response.data);
      
      if (response.data.isValid) {
        setError('');
        setSuccess(`${serviceName} API key is valid!`);
        setTimeout(() => setSuccess(''), 3000);
        console.log(`${serviceName} API key is valid!`);
      } else {
        setError(`${serviceName} API key is invalid`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setError(error.response?.data?.message || 'Failed to validate API key');
    } finally {
      setValidating(prev => ({ ...prev, [serviceName]: false }));
    }
  };

  const handleDeleteApiKey = async (serviceName) => {
    if (window.confirm(`Are you sure you want to delete the ${serviceName} API key?`)) {
      try {
        await apiKeyAPI.deleteApiKey(serviceName);
        await fetchApiKeys();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete API key');
      }
    }
  };

  const toggleShowKey = (serviceName) => {
    setShowKeys(prev => ({ ...prev, [serviceName]: !prev[serviceName] }));
  };

  const getApiKeyStatus = (serviceName) => {
    const apiKey = apiKeys.find(ak => ak.serviceName === serviceName);
    return apiKey ? (apiKey.hasKey ? 'saved' : 'empty') : 'not-found';
  };

  const getSavedApiKey = (serviceName) => {
    const apiKey = apiKeys.find(ak => ak.serviceName === serviceName);
    return apiKey?.apiKey || '';
  };

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
              <i className="bi bi-key-fill text-white"></i>
            </div>
            <h1 className="h2 fw-bold text-dark mb-0">API Key Settings</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-grow-1 overflow-auto p-4">
        <div className="container-fluid">
          {error && (
            <div className="alert alert-danger mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4">
              {success}
            </div>
          )}

          <div className="row g-4">
            {services.map((service) => {
              const status = getApiKeyStatus(service.name);
              const hasKey = status === 'saved';
              const savedKey = getSavedApiKey(service.name);
              
              return (
                <div key={service.name} className="col-12">
                  <div className="card">
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                          <h3 className="h5 fw-semibold text-dark mb-1">{service.name}</h3>
                          <p className="text-muted small mb-0">{service.description}</p>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          {hasKey && (
                            <span className="badge bg-success d-flex align-items-center gap-1">
                              <i className="bi bi-check-circle-fill"></i>
                              Saved
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Show saved API key if exists */}
                      {hasKey && (
                        <div className="mb-3">
                          <label className="form-label fw-medium text-dark">
                            Saved API Key
                          </label>
                          <div className="d-flex gap-2">
                            <div className="flex-grow-1 position-relative">
                              <input
                                type={showKeys[service.name] ? 'text' : 'password'}
                                value={savedKey}
                                readOnly
                                className="form-control pe-5 bg-light"
                                placeholder="API key saved"
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
                                onClick={() => toggleShowKey(service.name)}
                              >
                                {showKeys[service.name] ? (
                                  <i className="bi bi-eye-slash"></i>
                                ) : (
                                  <i className="bi bi-eye"></i>
                                )}
                              </button>
                            </div>
                            <button
                              onClick={() => navigator.clipboard.writeText(savedKey)}
                              className="btn btn-outline-primary d-flex align-items-center gap-2"
                              title="Copy to clipboard"
                            >
                              <i className="bi bi-clipboard"></i>
                              <span>Copy</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mb-3">
                        <label className="form-label fw-medium text-dark">
                          {hasKey ? 'Update API Key' : 'API Key'}
                        </label>
                        <div className="d-flex gap-2">
                          <div className="flex-grow-1 position-relative">
                            <input
                              type={showKeys[service.name] ? 'text' : 'password'}
                              value={formData[service.name]}
                              onChange={(e) => setFormData(prev => ({ ...prev, [service.name]: e.target.value }))}
                              placeholder={hasKey ? `Update your ${service.name} API key` : `Enter your ${service.name} API key`}
                              className="form-control pe-5"
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary position-absolute top-50 end-0 translate-middle-y me-2"
                              onClick={() => toggleShowKey(service.name)}
                            >
                              {showKeys[service.name] ? (
                                <i className="bi bi-eye-slash"></i>
                              ) : (
                                <i className="bi bi-eye"></i>
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => handleSaveApiKey(service.name)}
                            disabled={saving || !formData[service.name].trim()}
                            className="btn btn-primary d-flex align-items-center gap-2"
                          >
                            {saving ? (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Saving...</span>
                              </div>
                            ) : (
                              <i className="bi bi-key-fill"></i>
                            )}
                            <span>{hasKey ? 'Update' : 'Save'}</span>
                          </button>
                        </div>
                      </div>

                      {hasKey && (
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => handleValidateApiKey(service.name)}
                            disabled={validating[service.name]}
                            className="btn btn-secondary d-flex align-items-center gap-2"
                          >
                            {validating[service.name] ? (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Validating...</span>
                              </div>
                            ) : (
                              <i className="bi bi-check-circle-fill"></i>
                            )}
                            <span>Validate</span>
                          </button>
                          <button
                            onClick={() => handleDeleteApiKey(service.name)}
                            className="btn btn-outline-danger d-flex align-items-center gap-2"
                          >
                            <i className="bi bi-trash-fill"></i>
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySettings;
