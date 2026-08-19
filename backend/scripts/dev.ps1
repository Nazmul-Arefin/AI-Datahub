param(
  [int]$Port = 8000
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path ".venv")) {
  python -m venv .venv
}

.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt

if (-not (Test-Path ".env")) {
  Copy-Item .env.example .env
}

$env:PYTHONPATH = (Get-Location).Path
Write-Host "Starting API on http://127.0.0.1:$Port"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 0.0.0.0 --port $Port
