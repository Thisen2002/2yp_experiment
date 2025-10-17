    $folders5 = @(
        ".\backend\Organizer_Dashboard-main\backend\api-gateway",
        ".\backend\Organizer_Dashboard-main\backend\services\export-service",
        ".\backend\Organizer_Dashboard-main\backend\db",
        ".\backend\Organizer_Dashboard-main\backend\services\auth-service",
        ".\backend\Organizer_Dashboard-main\backend\services\building-service",
        ".\backend\Organizer_Dashboard-main\backend\services\event-service",
        ".\backend\Organizer_Dashboard-main\backend\services\Heatmapanalytic-service",
        ".\backend\Organizer_Dashboard-main\backend\services\overview_analytics",
        ".\backend\Organizer_Dashboard-main\backend\services\orgMng-service"
    )

    foreach ($folder in $folders5) {
        Write-Host "Installing in $folder" -ForegroundColor Yellow
        cd $folder
        npm install
        npm install dotenv
        cd $PSScriptRoot
    }

    $folders4 = @(
        ".\",
        ".\backend\events\",
        ".\backend\heatmap\backend\exhibition-map-backend",
        ".\backend\Maps\backend map"
    )

    foreach ($folder in $folders4) {
        Write-Host "Installing in $folder" -ForegroundColor Yellow
        cd $folder
        npm install
        cd $PSScriptRoot
    }