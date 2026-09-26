@echo off
title PromiseOS Launcher
echo ========================================================
echo  Starting PromiseOS (Backend + Frontend)
echo ========================================================
echo.

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "PromiseOS Backend (FastAPI)" cmd /k "cd /d %~dp0backend && set PYTHONPATH=. && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching React Frontend on http://127.0.0.1:5173 ...
start "PromiseOS Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev -- --port 5173 --host 127.0.0.1"

echo.
echo ========================================================
echo  Both services launched in separate windows!
echo  Open your browser at: http://127.0.0.1:5173
echo ========================================================
pause
