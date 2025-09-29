import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AuthUI } from '../components/ui/auth-fuse';
import OrbitingSkills from '../components/ui/orbiting-skills';

const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const result = await login({
        username: formData.username,
        password: formData.password
      });

      if (result.success) {
        navigate('/chat');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (formData) => {
    setLoading(true);
    setError('');

    try {
      if (formData.error) {
        setError(formData.error);
        setLoading(false);
        return;
      }

      const result = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        navigate('/chat');
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
    <AuthUI 
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      loading={loading}
      error={error}
      customComponent={<OrbitingSkills />}
      signInContent={{
        quote: {
          text: "Welcome Back! The journey continues.",
          author: "AIHub Team"
        }
      }}
      signUpContent={{
        quote: {
          text: "Create an account. A new chapter awaits.",
          author: "AIHub Team"
        }
      }}
    />
  );
};

export default LoginPage;
