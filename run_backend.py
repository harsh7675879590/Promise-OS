"""
PromiseOS — Single-Click Backend Launcher
Runs the FastAPI backend from anywhere in the repository, accepting both local and external network requests.
"""

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_path))

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print(" PromiseOS — Autonomous Commitment Graph & Risk Engine")
    print(" Local: http://localhost:8000")
    print(" Network: http://0.0.0.0:8000")
    print(" API Documentation: http://localhost:8000/docs")
    print("="*60 + "\n")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
