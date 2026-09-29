# Starts frontend+backend in a new PowerShell window and opens the admin UI in the browser
# Usage: Right-click -> Run with PowerShell or from terminal: .\scripts\start-and-open.ps1

$root = "$(Resolve-Path ..)" # script is in repo/scripts when run from repo root
$repo = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $repo

# Start servers in a new PowerShell window so this script can exit
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$repo'; npm run dev:all" -WindowStyle Normal

# give servers a few seconds to start
Start-Sleep -Seconds 3

# open backend admin json and frontend admin page
Start-Process "http://localhost:4000/admin/users"
Start-Process "http://localhost:3000/admin"
