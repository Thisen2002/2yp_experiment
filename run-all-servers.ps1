# Run All Servers Script
# This script launches all backend servers and frontend in separate PowerShell windows

Write-Host "🚀 Starting all servers..." -ForegroundColor Green

# Start Event Backend (Port 3036)
Write-Host "Starting Event Backend on port 3036..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\ravin\Documents\GitHub\2yp_experiment\backend\events'; Write-Host '📅 Event Backend Server' -ForegroundColor Yellow; node index.js"

# Wait a moment before starting next server
Start-Sleep -Seconds 2

# Start Map Backend - Unified Backend (Port 5000)
Write-Host "Starting Unified Backend on port 5000..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\ravin\Documents\GitHub\2yp_experiment\backend\Organizer_Dashboard-main\unified-backend\src'; Write-Host '🗺️ Unified Backend Server' -ForegroundColor Yellow; node index.js"

# Wait a moment before starting next server
Start-Sleep -Seconds 2

# Start Map Backend - Maps Backend (Port 3001)
Write-Host "Starting Maps Backend on port 3000..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\ravin\Documents\GitHub\2yp_experiment\backend\Maps\backend map'; Write-Host '🗺️ Maps Backend Server' -ForegroundColor Yellow; node app.js"

# Wait a moment before starting frontend
Start-Sleep -Seconds 2

# Start Frontend (Vite Dev Server)
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\ravin\Documents\GitHub\2yp_experiment'; Write-Host '⚛️ Frontend Development Server' -ForegroundColor Yellow; npm run dev"

Write-Host "`n✅ All servers are starting in separate windows!" -ForegroundColor Green
Write-Host "`nServers:" -ForegroundColor White
Write-Host "  📅 Event Backend:    http://localhost:3036" -ForegroundColor Gray
Write-Host "  🗺️ Unified Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host "  🗺️ Maps Backend:     http://localhost:3001" -ForegroundColor Gray
Write-Host "  ⚛️ Frontend:         http://localhost:5173" -ForegroundColor Green
Write-Host "`nTo stop all servers, close each PowerShell window." -ForegroundColor Yellow
