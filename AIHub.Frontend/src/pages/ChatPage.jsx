import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';

const ChatPage = () => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      <Sidebar />
      <ChatContainer />
    </div>
  );
};

export default ChatPage;
