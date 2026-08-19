@echo off
cd /d "%~dp0.."
if not exist ".venv\Scripts\python.exe" (
  python -m venv .venv
)
if not exist ".env" copy /Y .env.example .env >nul
set PYTHONPATH=%CD%
echo Starting API on http://127.0.0.1:8000
".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
