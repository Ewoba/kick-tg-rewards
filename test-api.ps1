# Скрипт для тестирования API endpoints
param(
    [string]$BaseUrl = "http://localhost:3000",
    [string]$Token = ""
)

Write-Host "=== Тестирование API ===" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl`n" -ForegroundColor Gray

# 1. Health check
Write-Host "1. Health check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get -TimeoutSec 2
    Write-Host "   ✅ Health: $($health | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Health check failed: $_" -ForegroundColor Red
}

# 2. Twitch OAuth start
Write-Host "`n2. Twitch OAuth start..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/twitch/start" -Method Get -MaximumRedirection 0 -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "   ✅ Redirects to: $location" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Failed: $_" -ForegroundColor Red
    }
}

# 3. /me endpoint (if token provided)
if ($Token) {
    Write-Host "`n3. /me endpoint..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
        }
        $me = Invoke-RestMethod -Uri "$BaseUrl/me" -Method Get -Headers $headers -TimeoutSec 2
        Write-Host "   ✅ User info:" -ForegroundColor Green
        $me | ConvertTo-Json -Depth 3 | Write-Host
    } catch {
        Write-Host "   ✗ Failed: $_" -ForegroundColor Red
    }
} else {
    Write-Host "`n3. /me endpoint skipped (no token provided)" -ForegroundColor Gray
    Write-Host "   Usage: .\test-api.ps1 -Token 'your_jwt_token'" -ForegroundColor Gray
}

Write-Host "`n=== Тестирование завершено ===" -ForegroundColor Cyan
