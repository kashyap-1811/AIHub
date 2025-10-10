# AIHub

Unified chat hub with multiple AI providers behind a single API. This repo contains:
- Backend: ASP.NET Core 9 Web API with EF Core (SQLite), JWT auth, Google OAuth, and pluggable AI routing
- Frontend: React 18 + Vite app with a modern chat UI and profile/settings pages

## Contents
- Getting Started (clone, run backend, run frontend)
- Project Structure
- Backend Overview (versions, environment, APIs)
- Frontend Overview (commands, env, routing)
- Development Tips

## Getting Started

### Prerequisites
- .NET SDK 9.0+
- Node.js 18+ and npm 9+
- Git

### Clone
```bash
git clone https://github.com/your-org/aihub.git
cd AIHub
```

### Backend: run API
```bash
cd AIHub.API
dotnet restore
dotnet ef database update   # optional if migrations not auto-applied
dotnet run
```
By default the API runs on `https://localhost:5001` and `http://localhost:5000` (or as configured). Swagger is enabled in Development.

### Frontend: run web app
```bash
cd Frontend
npm install
npm run dev
```
Vite starts on `http://localhost:5173` by default.

## Project Structure
```
AIHub/
  AIHub.API/              # ASP.NET Core Web API
    Controllers/          # Auth, Chat, API Key endpoints
    Data/                 # EF Core DbContext
    Migrations/           # EF Core migrations for SQLite
    Models/               # Db entities: User, ChatSession, Message, ApiKey, ContextSummary
    Repositories/         # CRUD repositories
    Services/             # AuthService, ContextService, UnifiedAIService, EncryptionService
    appsettings*.json     # Configuration (Jwt, Google, ConnectionStrings, Encryption)
    Program.cs            # DI, middleware, HTTP clients, Auth, CORS, Swagger
  Frontend/               # React app (Vite)
    src/
      pages/              # Chat, Login, Profile, Settings, Landing, Support
      components/         # UI components and effects
      contexts/           # AuthContext, ChatContext
      services/           # api.js (axios instance + API wrappers)
      styles/             # global styles
    package.json          # dependencies and scripts
  README.md
```

## Backend Overview

### Tech and Versions
- Target Framework: .NET 9 (`net9.0`)
- ASP.NET Core packages:
  - Microsoft.AspNetCore.OpenApi 9.0.6
  - Swashbuckle.AspNetCore 6.5.0 (Swagger UI)
  - Microsoft.AspNetCore.Authentication.JwtBearer 9.0.0
  - Microsoft.AspNetCore.Authentication.Google 9.0.0
- Data:
  - Entity Framework Core 9 (Sqlite + Tools 9.0.0)
  - SQLite database (`AIHubDB.db`)
- Security:
  - System.IdentityModel.Tokens.Jwt 8.2.1
  - BCrypt.Net-Next 4.0.3 (password hashing)
- JSON: Newtonsoft.Json 13.0.3

### Configuration (appsettings.json)
- Jwt: `Key`, `Issuer`, `Audience`
- Google: `ClientId`, `ClientSecret`
- ConnectionStrings: `DefaultConnection` (SQLite)
- Encryption: `Key` (used by `EncryptionService`)

### Authentication and Users
- Register/Login returns `{ token, user }` where `user` includes `id`, `username`, `email`, `createdAt`.
- `/api/auth/me` (GET, authorized) returns the current user loaded from DB (includes `createdAt`).
- JWT lifetime: 7 days (configurable in `AuthService`).

### Chat and AI Routing
- `UnifiedAIService` proxies to OpenRouter models per service name:
  - ChatGPT: `openai/gpt-oss-20b:free`
  - Gemini: `google/gemini-2.0-flash-exp:free`
  - Claude: `anthropic/claude-3-sonnet`
  - DeepSeek: `deepseek/deepseek-chat-v3.1:free`
- `ChatController` resolves the model via `IChatSessionRepository.GetServiceNameByIdAsync(sessionId)` and passes it explicitly to `UnifiedAIService`.

### API Keys Storage
- API keys are stored encrypted at rest via `EncryptionService` (AES with a configured key):
  - Save: encrypt before storing
  - Use/Validate: decrypt before sending to provider
- Endpoints:
  - `GET /api/apikey`
  - `POST /api/apikey` (save/update)
  - `DELETE /api/apikey/{serviceName}`
  - `POST /api/apikey/validate`

### HTTP Clients and Timeouts
- Named HttpClient "Default" (3 minutes timeout) for AI calls.

### CORS
- Policy `AllowReactApp` allows `http://localhost:5173` and `http://localhost:3000` with credentials.

### Running Migrations
Migrations are applied on startup. To add new migrations:
```bash
cd AIHub.API
dotnet ef migrations add <Name>
dotnet ef database update
```

## Frontend Overview

### Tech and Versions
- React 18, Vite 4
- Key deps: axios 1.6, react-router-dom 6, bootstrap 5, react-bootstrap 2, framer-motion, react-markdown, lucide-react

### Scripts
```bash
npm run dev       # start Vite dev server
npm run build     # production build
npm run preview   # preview built app
npm run lint      # lint
```

### Environment
- Frontend API base URL is `http://localhost:3000` in `src/services/api.js`. Update if your backend runs elsewhere.
  - Authorization header is injected from `localStorage/sessionStorage` token.

### Auth Flow
- `AuthContext` persists JWT in localStorage and initializes auth on app load via `/api/auth/me`.
- Login/Register store `{ token, user }` and update context; Profile page consumes `user`.

### Core Pages
- Chat: multi-session chat UI with sidebar, message history, and AI responses
- Profile: displays `username`, `email`, and "Member Since" from `createdAt`
- Settings: manage API keys per provider
- Landing and Support: marketing/help content

## Development Tips
- Keep `Encryption:Key` secret value long (32+ chars) and unique per environment.
- When adding new AI providers, extend `ModelConfigs` in `UnifiedAIService` and allow selecting in the frontend.
- If you change backend URL or CORS, align it with the frontend `api.js` base URL and origins in `Program.cs`.

## Troubleshooting
- 401 on API calls: ensure token exists, is not expired, and CORS allows your frontend origin.
- No AI response: verify API key saved for the selected provider and OpenRouter availability.
- "Member Since" empty: ensure `/api/auth/me` returns `createdAt` and the user exists in DB.

---
MIT License © Your Name / Org

