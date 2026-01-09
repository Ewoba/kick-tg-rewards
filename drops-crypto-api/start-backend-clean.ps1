Write-Host "=== Start Drops Crypto API (clean) ===" -ForegroundColor Green

if (-not (Test-Path .env)) {
    Write-Host "ERROR: .env not found" -ForegroundColor Red
    exit 1
}

## try to find npm; fallback to common Node install location
$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue) -or (Get-Command npm -ErrorAction SilentlyContinue)
if ($npmCmd) {
    $npmPath = $npmCmd.Path
} else {
    $npmPath = 'C:\Program Files\nodejs\npm.cmd'
}

if (-not (Test-Path $npmPath)) {
    Write-Host "ERROR: npm not found. Install Node.js and ensure npm is on PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Launching backend in a new PowerShell window (shows logs)..." -ForegroundColor Gray
$backendDir = (Get-Location).Path
Start-Process -FilePath powershell -ArgumentList '-NoExit','-Command',"cd '$backendDir'; npm run start:dev" -WindowStyle Normal
