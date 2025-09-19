# AI Hub - Multi-AI Chat Platform

A comprehensive full-stack web application that allows users to interact with multiple AI models (ChatGPT, Gemini, Claude, DeepSeek) simultaneously through a unified interface.

## Features

### 🔐 Authentication
- User registration and login with username/password
- Google OAuth integration
- Secure JWT-based authentication
- Password encryption with BCrypt

### 🤖 AI Integration
- **ChatGPT** - OpenAI GPT models
- **Gemini** - Google's Gemini models  
- **Claude** - Anthropic's Claude models
- **DeepSeek** - DeepSeek models
- Real-time chat with individual AI models
- Broadcast messages to multiple AI models simultaneously

### 💬 Chat Management
- Multi-column chat interface
- Create and manage multiple chat sessions
- Save and load previous conversations
- Real-time message streaming
- Message history persistence

### 🔑 API Key Management
- Secure storage of user API keys
- Encryption of sensitive data
- API key validation
- Support for multiple AI service providers

### 🎨 User Interface
- Modern, responsive design with Tailwind CSS
- Intuitive multi-column layout
- Real-time typing indicators
- Mobile-friendly interface
- Dark/light theme support

## Technology Stack

### Backend (.NET Core 9.0)
- **Framework**: ASP.NET Core 9.0
- **Database**: Entity Framework Core with SQL Server
- **Authentication**: JWT Bearer tokens + Google OAuth
- **Security**: BCrypt password hashing, API key encryption
- **Architecture**: Repository pattern, Dependency Injection

### Frontend (React + Vite)
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Database
- **Provider**: SQL Server (LocalDB for development)
- **ORM**: Entity Framework Core
- **Migrations**: Code-first approach

## Getting Started

### Prerequisites
- .NET 9.0 SDK
- Node.js 18+ and npm
- SQL Server (or LocalDB)

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd AIHub.API
   ```

2. **Restore packages:**
   ```bash
   dotnet restore
   ```

3. **Update connection string** in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Your-SQL-Server-Connection-String"
     }
   }
   ```

4. **Run the application:**
   ```bash
   dotnet run
   ```

The API will be available at `https://localhost:7000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd AIHub.Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API base URL** in `src/services/api.js`:
   ```javascript
   const api = axios.create({
     baseURL: 'https://localhost:7000', // Your backend URL
   });
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Key Setup

### ChatGPT (OpenAI)
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in and create a new secret key
3. Copy the key and paste it in AI Hub settings

### Gemini (Google)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in and create an API key
3. Copy the key and paste it in AI Hub settings

### Claude (Anthropic)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign in and go to API Keys section
3. Create a new key and copy it to AI Hub settings

### DeepSeek
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign in and go to API Keys section
3. Create a new key and copy it to AI Hub settings

## Project Structure

```
AIHub/
├── AIHub.API/                 # .NET Core Backend
│   ├── Controllers/           # API Controllers
│   ├── Models/               # Data Models
│   ├── Repositories/         # Data Access Layer
│   ├── Services/             # Business Logic
│   ├── Data/                 # Database Context
│   └── Program.cs            # Application Entry Point
├── AIHub.Frontend/           # React Frontend
│   ├── src/
│   │   ├── components/       # React Components
│   │   ├── contexts/         # State Management
│   │   ├── services/         # API Services
│   │   └── App.jsx           # Main App Component
│   └── package.json
└── README.md
```

## Usage

1. **Register/Login**: Create an account or sign in
2. **Add API Keys**: Go to Settings and add your AI service API keys
3. **Create Sessions**: Start new chat sessions with different AI models
4. **Chat**: Send messages to individual AI models or broadcast to all
5. **Manage**: Save, load, and organize your chat sessions

## Security Features

- JWT token-based authentication
- Encrypted API key storage
- Password hashing with BCrypt
- CORS protection
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the Support section in the application
- Review the FAQ
- Create an issue in the repository

---

**AI Hub** - Your gateway to multiple AI models in one powerful platform! 🚀
