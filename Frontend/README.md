# AIHub Frontend - ChatGPT-like Interface

A modern, dark-themed frontend for AIHub with a ChatGPT-inspired interface.

## 🚀 Features

### 🎨 **ChatGPT-like UI**
- **Dark Theme**: Professional dark interface matching ChatGPT's design
- **Responsive Design**: Works perfectly on desktop and mobile
- **Modern Components**: Built with React + Bootstrap + Lucide React icons

### 💬 **Chat Management**
- **Model Selection**: Choose between ChatGPT, Gemini, Claude, and DeepSeek for each chat
- **URL-based Routing**: Each chat has its own URL (`/chat/:sessionId`)
- **Real-time Messaging**: Send and receive messages with typing indicators
- **Chat History**: Persistent chat sessions with proper state management

### 🔐 **Authentication**
- **Login/Register**: Secure user authentication
- **Session Management**: Automatic token handling and refresh
- **Protected Routes**: Secure access to chat features

### ⚙️ **API Key Management**
- **Multiple Services**: Support for all major AI providers
- **Secure Storage**: Encrypted API key storage
- **Easy Management**: Add, edit, and delete API keys

### 📱 **Pages & Routing**
- **`/`** - Main chat interface
- **`/chat/:sessionId`** - Individual chat sessions
- **`/login`** - Authentication page
- **`/profile`** - User profile and API key management
- **`/support`** - Help and support page

## 🛠️ **Tech Stack**

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Bootstrap 5** - UI framework
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client
- **Context API** - State management

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- Backend API running on http://localhost:3000

### Installation
```bash
cd Frontend
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## 📁 **Project Structure**

```
Frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.jsx     # Main navigation sidebar
│   │   ├── ChatInterface.jsx # Chat conversation UI
│   │   ├── NewChatModal.jsx # Create new chat modal
│   │   └── LoadingSpinner.jsx # Loading component
│   ├── pages/              # Page components
│   │   ├── LoginPage.jsx   # Authentication page
│   │   ├── ChatPage.jsx    # Main chat page
│   │   ├── ProfilePage.jsx # User profile & API keys
│   │   └── SupportPage.jsx # Help & support
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.jsx # Authentication state
│   │   └── ChatContext.jsx # Chat state management
│   ├── services/           # API services
│   │   └── api.js         # Axios configuration
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── package.json
├── vite.config.js
└── index.html
```

## 🎨 **UI Features**

### **Dark Theme**
- Professional dark color scheme
- High contrast for readability
- Smooth animations and transitions

### **ChatGPT-like Interface**
- Sidebar with chat history
- Main chat area with message bubbles
- Model selection for each chat
- Typing indicators and loading states

### **Responsive Design**
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly interface

## 🔧 **Configuration**

### **API Configuration**
The frontend connects to the backend API at `http://localhost:3000`. Update the base URL in `src/services/api.js` if needed.

### **Styling**
Global styles and CSS variables are defined in `src/index.css`. The dark theme uses CSS custom properties for easy customization.

## 🚀 **Deployment**

### **Build for Production**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

## 📱 **Mobile Support**

The interface is fully responsive and works great on mobile devices:
- Touch-friendly buttons and inputs
- Collapsible sidebar
- Optimized message layout
- Swipe gestures support

## 🔒 **Security**

- Secure token storage in sessionStorage
- Automatic token refresh
- Protected routes
- Input validation and sanitization

## 🎯 **Key Features**

1. **Model Selection**: Choose AI model for each chat
2. **URL Routing**: Each chat has its own URL
3. **Real-time Updates**: Live message updates
4. **API Key Management**: Secure key storage
5. **User Profile**: Complete user management
6. **Support System**: Built-in help and support

## 🐛 **Troubleshooting**

### **Common Issues**

1. **API Connection Failed**
   - Ensure backend is running on port 3000
   - Check CORS configuration

2. **Authentication Issues**
   - Clear browser storage
   - Check token validity

3. **Styling Issues**
   - Ensure Bootstrap CSS is loaded
   - Check CSS custom properties

## 📞 **Support**

For support and questions:
- Check the Support page in the app
- Review the FAQ section
- Contact support via the contact form

---

**Built with ❤️ for AIHub**
