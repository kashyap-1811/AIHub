# AIHub Development Startup Script
# This script starts both the backend API and frontend development servers

Write-Host "Starting AIHub Development Environment..." -ForegroundColor Green

# Start the backend API
Write-Host "Starting Backend API on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'AIHub.API'; dotnet run"

# Wait a moment for the backend to start
Start-Sleep -Seconds 3

# Start the frontend
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'AIHub.Frontend'; npm run dev"

Write-Host "Both servers are starting up..." -ForegroundColor Green
Write-Host "Backend API: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Press any key to exit this script (servers will continue running)" -ForegroundColor White

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
