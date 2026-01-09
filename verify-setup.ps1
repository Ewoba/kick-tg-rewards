<#
Simple verification script for local development:
- Waits for backend /health to respond
- Checks /auth/twitch/start for redirect
- Optionally prints ngrok tunnels from local ngrok API
#>
Write-Host "=== Verify Setup ===" -ForegroundColor Green

function Wait-ForHealth {
    param([int]$Retries = 60)
    for ($i=0; $i -lt $Retries; $i++) {
        try {
            $r = Invoke-RestMethod http://localhost:3000/health -TimeoutSec 3
            Write-Host "Health OK:" ($r | ConvertTo-Json -Compress) -ForegroundColor Green
            return $true
        } catch {
            Write-Host "Not ready yet ($i). Retrying..." -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
    Write-Host "Health check failed after $Retries attempts." -ForegroundColor Red
    return $false
}

function Check-OAuthStart {
    try {
        $response = Invoke-WebRequest -Uri http://localhost:3000/auth/twitch/start -MaximumRedirection 0 -ErrorAction Stop
        Write-Host "OAuth start returned status: $($response.StatusCode)" -ForegroundColor Green
        if ($response.Headers['Location']) { Write-Host "Location: $($response.Headers['Location'])" -ForegroundColor Cyan }
    } catch {
        if ($_.Exception.Response) {
            Write-Host "OAuth start returned status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            Write-Host "Location: $($_.Exception.Response.Headers['Location'])" -ForegroundColor Cyan
        } else {
            Write-Host "Failed to contact /auth/twitch/start: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

function Print-NgrokTunnels {
    try {
        $t = Invoke-RestMethod http://127.0.0.1:4040/api/tunnels -ErrorAction Stop
        Write-Host "ngrok tunnels:" -ForegroundColor Green
        $t.tunnels | ConvertTo-Json -Depth 4 | Write-Host
    } catch {
        Write-Host "ngrok API not available on 127.0.0.1:4040. Is ngrok running?" -ForegroundColor Yellow
    }
}

if (Wait-ForHealth) {
    Check-OAuthStart
} else {
    Write-Host "Backend isn't responding; please check logs from 'cd drops-crypto-api; npm run start:dev'" -ForegroundColor Red
}

Print-NgrokTunnels

Write-Host "=== Verify complete ===" -ForegroundColor Green
