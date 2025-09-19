# AI Hub Migration Commands
# Use these commands to manage database migrations

Write-Host "AI Hub Database Migration Commands" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

Write-Host "Available Commands:" -ForegroundColor Yellow
Write-Host "1. Add Migration: dotnet ef migrations add <MigrationName>" -ForegroundColor Cyan
Write-Host "2. Update Database: dotnet ef database update" -ForegroundColor Cyan
Write-Host "3. Remove Migration: dotnet ef migrations remove" -ForegroundColor Cyan
Write-Host "4. List Migrations: dotnet ef migrations list" -ForegroundColor Cyan
Write-Host "5. Generate Script: dotnet ef migrations script" -ForegroundColor Cyan
Write-Host ""

Write-Host "Examples:" -ForegroundColor Yellow
Write-Host "dotnet ef migrations add AddNewFeature" -ForegroundColor White
Write-Host "dotnet ef database update" -ForegroundColor White
Write-Host "dotnet ef migrations remove" -ForegroundColor White
Write-Host ""

Write-Host "Note: Make sure to stop the running API before running migrations!" -ForegroundColor Red
