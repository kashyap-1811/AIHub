# AI Hub Setup Guide

This guide will help you set up and run the AI Hub application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **.NET 9.0 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/9.0)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **SQL Server** (or SQL Server LocalDB) - [Download here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

## Quick Start

### Option 1: Using the Startup Scripts

**Windows:**
```bash
# Double-click start-dev.bat or run in command prompt
start-dev.bat
```

**Linux/Mac:**
```bash
# Make the script executable and run
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Setup

## Backend Setup (.NET Core API)

1. **Navigate to the backend directory:**
   ```bash
   cd AIHub.API
   ```

2. **Restore NuGet packages:**
   ```bash
   dotnet restore
   ```

3. **Update the database connection string** in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=AIHubDB;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

4. **Run the backend:**
   ```bash
   dotnet run
   ```

   The API will be available at: `https://localhost:7000`
   Swagger documentation: `https://localhost:7000/swagger`

## Frontend Setup (React + Vite)

1. **Navigate to the frontend directory:**
   ```bash
   cd AIHub.Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update the API base URL** in `src/services/api.js` if needed:
   ```javascript
   const api = axios.create({
     baseURL: 'https://localhost:7000', // Your backend URL
   });
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at: `http://localhost:5173`

## Database Setup

The application uses Entity Framework Core with Code First migrations. The database will be created automatically when you first run the backend.

### Manual Database Creation (Optional)

If you want to create the database manually:

```bash
cd AIHub.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Configuration

### Backend Configuration (`AIHub.API/appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Your-SQL-Server-Connection-String"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong!",
    "Issuer": "AIHub",
    "Audience": "AIHub"
  },
  "Google": {
    "ClientId": "your-google-client-id",
    "ClientSecret": "your-google-client-secret"
  },
  "Encryption": {
    "Key": "YourEncryptionKeyThatIsAtLeast32CharactersLong!"
  }
}
```

### Frontend Configuration

Update the API base URL in `AIHub.Frontend/src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'https://localhost:7000', // Change this to your backend URL
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Getting API Keys

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

## Usage

1. **Start the application** using one of the methods above
2. **Open your browser** and go to `http://localhost:5173`
3. **Create an account** or sign in
4. **Go to Settings** and add your AI service API keys
5. **Create a new chat session** with your preferred AI model
6. **Start chatting!**

## Troubleshooting

### Common Issues

**Backend won't start:**
- Ensure .NET 9.0 SDK is installed
- Check that the connection string is correct
- Make sure SQL Server is running

**Frontend won't start:**
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check that the API base URL is correct

**Database connection issues:**
- Verify SQL Server is running
- Check the connection string format
- Ensure the database server is accessible

**API key issues:**
- Verify your API keys are valid
- Check that you have sufficient credits
- Ensure the API key format is correct

### Port Conflicts

If you encounter port conflicts:

**Backend (default: 7000):**
```bash
cd AIHub.API
dotnet run --urls="https://localhost:7001"
```

**Frontend (default: 5173):**
```bash
cd AIHub.Frontend
npm run dev -- --port 5174
```

## Development

### Project Structure

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
├── start-dev.bat             # Windows startup script
├── start-dev.sh              # Linux/Mac startup script
└── README.md
```

### Building for Production

**Backend:**
```bash
cd AIHub.API
dotnet publish -c Release -o ./publish
```

**Frontend:**
```bash
cd AIHub.Frontend
npm run build
```

## Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the application logs
3. Ensure all prerequisites are installed
4. Verify your configuration settings

For additional help, refer to the Support section within the application or create an issue in the repository.

---

**Happy coding with AI Hub!** 🚀
