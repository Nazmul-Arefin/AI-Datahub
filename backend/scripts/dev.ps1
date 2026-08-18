param(
  [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path ".venv")) {
  python -m venv .venv
}

.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt

if (-not (Test-Path ".env")) {
  Copy-Item .env.example .env
}

$env:PYTHONPATH = (Get-Location).Path
Write-Host "Starting API on http://localhost:$Port"
uvicorn app.main:app --reload --port $Port
