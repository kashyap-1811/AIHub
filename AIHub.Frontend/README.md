# AIHub Frontend

A modern, ChatGPT-like frontend for the AIHub multimodal chat platform built with React and Vite.

## Features

- **Multi-Column Chat Interface**: Chat with multiple AI services simultaneously in separate columns
- **ChatGPT-like UI**: Clean, modern interface inspired by ChatGPT
- **User Authentication**: Secure login and registration system
- **Chat History**: View and manage previous chat sessions
- **Profile Management**: Manage API keys and user settings
- **Support System**: Built-in help and FAQ section
- **Responsive Design**: Works on desktop and mobile devices

## Supported AI Services

- **ChatGPT** (OpenAI)
- **Google Gemini**
- **Claude** (Anthropic)
- **DeepSeek**

## Technology Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Bootstrap 5** - CSS framework for styling
- **Bootstrap Icons** - Icon library
- **Context API** - State management
- **Fetch API** - HTTP requests

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AIHub Backend API running on `http://localhost:5000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd AIHub.Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthModal.jsx   # Authentication modal
│   ├── ChatColumn.jsx  # Individual chat column
│   ├── ChatContainer.jsx # Main chat container
│   ├── ProfileModal.jsx # User profile modal
│   ├── Sidebar.jsx     # Left sidebar
│   └── SupportModal.jsx # Support and help modal
├── contexts/           # React contexts
│   ├── AuthContext.jsx # Authentication state
│   └── ChatContext.jsx # Chat state management
├── services/           # API services
│   └── api.js         # API client
├── App.jsx            # Main app component
├── main.jsx           # App entry point
└── index.css          # Global styles
```

## Key Features

### Multi-Column Chat
- Open up to 3 chat columns simultaneously
- Each column is independent - messages don't interfere with each other
- Different AI services can be used in different columns
- Easy column management with close buttons

### Chat Management
- Create new chats with custom titles
- View chat history in the sidebar
- Delete unwanted chat sessions
- Real-time message updates

### User Profile
- View and edit user information
- Manage API keys for different AI services
- Secure API key storage and encryption

### Authentication
- User registration and login
- JWT token-based authentication
- Automatic token refresh
- Secure logout functionality

## API Integration

The frontend communicates with the AIHub backend API through the following endpoints:

- **Authentication**: `/api/auth/*`
- **Chat Sessions**: `/api/chat/sessions/*`
- **Messages**: `/api/chat/sessions/{id}/messages`
- **API Keys**: `/api/apikey/*`

## Styling

The application uses Bootstrap 5 with custom CSS variables for theming:

- Primary color: `#10a37f` (ChatGPT green)
- Secondary color: `#f7f7f8` (Light gray)
- Text color: `#343541` (Dark gray)
- Border color: `#e5e5e5` (Light border)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses ESLint for code quality and consistency. Make sure to follow the established patterns:

- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable and function names
- Add comments for complex logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the AIHub platform. See the main project for license information.