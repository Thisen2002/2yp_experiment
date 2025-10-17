# Simple PowerShell script to start the essential servers
# Usage: .\simple-start.ps1

Write-Host "🚀 Starting Essential Servers..." -ForegroundColor Green

# Function to start a service in a new PowerShell window
function Start-Server {
    param($Name, $Path, $Command)
    
    Write-Host "Starting $Name..." -ForegroundColor Yellow
    
    if (Test-Path $Path) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; $Command" -WindowStyle Normal
        Start-Sleep -Seconds 2
    } else {
        Write-Host "⚠️  $Name path not found: $Path" -ForegroundColor Red
    }
}

# Start main Vite development server
Start-Server "Main App (Vite)" "." "npm run dev"

# Start Events API
Start-Server "Events Service" "backend\events" "npm run dev"

# Start API Gateway
Start-Server "API Gateway" "backend\Organizer_Dashboard-main\backend\api-gateway" "node src\index.js"

# Start Auth Service
Start-Server "Auth Service" "backend\Organizer_Dashboard-main\backend\services\auth-service" "node src\index.js"

# Start Building Service
Start-Server "Building Service" "backend\Organizer_Dashboard-main\backend\services\building-service" "node src\index.js"

# Start Event Service
Start-Server "Event Service" "backend\Organizer_Dashboard-main\backend\services\event-service" "node src\index.js"

# Start Maps API
Start-Server "Maps Service" "backend\Maps\backend map" "node app.js"

# Start Heatmap Service
Start-Server "Heatmap Service" "backend\heatmap\backend\exhibition-map-backend" "node index.js"

# Start Export Service
Start-Server "Export Service" "backend\Organizer_Dashboard-main\backend\services\export-service" "node src\index.js"

# Start Heatmap Analytics Service
Start-Server "Heatmap Analytics Service" "backend\Organizer_Dashboard-main\backend\services\Heatmapanalytic-service" "node src\index.js"

# Start Organization Management Service
Start-Server "Org Management Service" "backend\Organizer_Dashboard-main\backend\services\orgMng-service" "node src\index.js"

# Start Overview Analytics Service
Start-Server "Overview Analytics Service" "backend\Organizer_Dashboard-main\backend\services\overview_analytics" "node src\app.js"

Write-Host ""
Write-Host "✅ All servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Main Application: http://localhost:5173 (Vite dev server)" -ForegroundColor Cyan
Write-Host "🔗 API Gateway: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Note: Each server runs in its own PowerShell window" -ForegroundColor Yellow
Write-Host "📝 Close the windows to stop the servers" -ForegroundColor Yellow

Read-Host "Press Enter to exit..."