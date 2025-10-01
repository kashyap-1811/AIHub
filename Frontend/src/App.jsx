import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import LandingPage from './pages/LandingPage';
import LoadingSpinner from './components/LoadingSpinner';
import { BackgroundPaths } from './components/BackgroundPaths';

// --- Protected / Public Wrappers ---
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return !isAuthenticated ? children : <Navigate to="/" />;
}

// --- Define routes ---
const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <PublicRoute><LoginPage /></PublicRoute> },
  { path: '/chat', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
  { path: '/chat/:sessionId', element: <ProtectedRoute><ChatPage /></ProtectedRoute> },
  { path: '/profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
  { path: '/settings', element: <ProtectedRoute><SettingsPage /></ProtectedRoute> },
  { path: '/support', element: <ProtectedRoute><SupportPage /></ProtectedRoute> }
];

// Create the router and enable future flags
const router = createBrowserRouter(routes, {
  v7_startTransition: true,
  v7_relativeSplatPath: true
});

function AppContent() {
  return (
    <BackgroundPaths>
      <RouterProvider router={router} />
    </BackgroundPaths>
  );
}


function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
