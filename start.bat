@echo off
title PromiseOS Launcher
echo ========================================================
echo  Starting PromiseOS (Backend + Frontend)
echo ========================================================
echo.

echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "PromiseOS Backend (FastAPI)" cmd /k "cd /d %~dp0backend && set PYTHONPATH=. && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Launching React Frontend on http://localhost:5173 ...
start "PromiseOS Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo  Both services launched in separate windows!
echo  Open your browser at: http://localhost:5173
echo ========================================================
pause
