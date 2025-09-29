import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  User, 
  Mail,
  Calendar,
  LogOut,
  Settings,
  Shield
} from 'lucide-react';
import { BackgroundPaths } from '../components/BackgroundPaths';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
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
              <h1 className="display-4 fw-bold text-primary mb-3">Profile</h1>
              <p className="lead text-muted">Manage your account information</p>
            </div>

            {/* Profile Information */}
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card bg-secondary border-primary shadow-lg" style={{ 
                  borderRadius: '20px'
                }}>
                  <div className="card-header border-primary p-4" style={{ 
                    background: 'transparent',
                    borderRadius: '20px 20px 0 0'
                  }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ 
                            width: '50px', 
                            height: '50px',
                            background: 'var(--accent-color)'
                          }}
                        >
                          <User size={24} className="text-white" />
                        </div>
                        <div>
                          <h4 className="mb-1 text-primary" style={{ 
                            fontWeight: '600'
                          }}>
                            User Profile
                          </h4>
                          <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
                            Your personal account information
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-body p-4">
                    {/* Profile Picture */}
                    <div className="text-center mb-4">
                      <div 
                        className="rounded-circle d-inline-flex align-items-center justify-content-center"
                        style={{ 
                          width: '120px', 
                          height: '120px',
                          background: 'var(--accent-color)',
                          fontSize: '48px'
                        }}
                      >
                        <User size={60} className="text-white" />
                      </div>
                      <h5 className="mt-3 mb-1 text-primary">{user?.username || 'User'}</h5>
                      <p className="text-muted mb-0">{user?.email || 'user@example.com'}</p>
                    </div>

                    {/* Profile Details */}
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-tertiary rounded" style={{ 
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div className="d-flex align-items-center mb-2">
                            <User size={18} className="text-primary me-2" />
                            <label className="form-label fw-semibold text-primary mb-0">
                              Username
                            </label>
                          </div>
                          <p className="mb-0 text-white">{user?.username || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 bg-tertiary rounded" style={{ 
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div className="d-flex align-items-center mb-2">
                            <Mail size={18} className="text-primary me-2" />
                            <label className="form-label fw-semibold text-primary mb-0">
                              Email Address
                            </label>
                          </div>
                          <p className="mb-0 text-white">{user?.email || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 bg-tertiary rounded" style={{ 
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div className="d-flex align-items-center mb-2">
                            <Calendar size={18} className="text-primary me-2" />
                            <label className="form-label fw-semibold text-primary mb-0">
                              Member Since
                            </label>
                          </div>
                          <p className="mb-0 text-white">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="p-3 bg-tertiary rounded" style={{ 
                          borderRadius: '12px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div className="d-flex align-items-center mb-2">
                            <Shield size={18} className="text-primary me-2" />
                            <label className="form-label fw-semibold text-primary mb-0">
                              Account Status
                            </label>
                          </div>
                          <span className="badge bg-success" style={{ 
                            borderRadius: '6px',
                            padding: '6px 12px'
                          }}>
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-top border-primary">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <button
                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center"
                            onClick={() => navigate('/settings')}
                            style={{ 
                              borderRadius: '12px',
                              padding: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <Settings size={18} className="me-2" />
                            API Settings
                          </button>
                        </div>
                        <div className="col-md-6">
                          <button
                            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
                            onClick={handleLogout}
                            style={{ 
                              borderRadius: '12px',
                              padding: '12px',
                              fontWeight: '600'
                            }}
                          >
                            <LogOut size={18} className="me-2" />
                            Logout
                          </button>
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

export default ProfilePage;