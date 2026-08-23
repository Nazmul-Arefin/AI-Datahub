@echo off
cd /d "%~dp0"
call .venv\Scripts\activate.bat
echo SAFE mode: control API only, no WeChat inject, dry-run.
python bridge.py
pause
