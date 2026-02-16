$env:PATH = 'C:\Program Files\nodejs;' + [System.Environment]::GetEnvironmentVariable('PATH','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('PATH','User')
Set-Location 'C:\Users\YAMAKASI\calorie-tracker'

# Kill existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Run build
Write-Host "Running vite build..."
& npm run build 2>&1
Write-Host "Exit code: $LASTEXITCODE"
