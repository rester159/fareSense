# Deploy .env to Unraid and restart dokidoki-api
# Prerequisite: Create .env in project root with DATABASE_URL (Neon) and JWT_SECRET

$ErrorActionPreference = "Stop"
$key = "C:\Users\edang\.ssh\unraid_deploy"
$target = "root@enrico.local:/mnt/user/appdata/dokidoki"

$envPath = Join-Path (Split-Path $PSScriptRoot -Parent) ".env"
if (-not (Test-Path $envPath)) {
    Write-Error "No .env found at $envPath - create it with DATABASE_URL and JWT_SECRET (see .env.example)"
}

Write-Host "Deploying .env and restarting container..."
scp -i $key $envPath "${target}/.env"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$cmd = @"
docker restart dokidoki-api
"@
ssh -i $key root@enrico.local $cmd
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done. Container restarted."
