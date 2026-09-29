<#
Start-dev.ps1

Convenience script to start the project for local development on Windows (PowerShell).
It opens two new PowerShell windows: one running the backend (nodemon) and one running the
frontend (Next dev). It also opens the Admin UI and Prisma Studio in your default browser.

Usage:
  .\scripts\start-dev.ps1

Notes:
- Run this from anywhere; the script uses its own location to compute the repo root.
- If you need to run `npm install` or `npx prisma db push` first, run those manually before using this script.
#>

Set-StrictMode -Version Latest

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition }
$projectRoot = (Resolve-Path (Join-Path $scriptDir '..')).Path
$backendPath = Join-Path $projectRoot 'backend'

Write-Host "Project root: $projectRoot"
Write-Host "Backend path: $backendPath"

Write-Host "Starting backend in a new PowerShell window..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '$backendPath'; npm run dev" -WorkingDirectory $backendPath

Start-Sleep -Seconds 1

Write-Host "Starting frontend in a new PowerShell window..."
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd '$projectRoot'; npm run start-frontend" -WorkingDirectory $projectRoot

Start-Sleep -Seconds 2

Write-Host "Opening Admin UI and Prisma Studio in browser..."
Start-Process 'http://localhost:3000/admin'
Start-Process 'http://localhost:5555'

Write-Host "Done. Backend and frontend windows should be visible. Check the terminals for logs."
