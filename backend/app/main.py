"""
PromiseOS — FastAPI Backend Application
Autonomous commitment extraction, dependency graph generation, deterministic risk scoring,
what-if counterfactual cascade simulation, and AMD ROCm benchmark harness.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path so both absolute and relative execution modes work seamlessly
current_file = Path(__file__).resolve()
backend_dir = current_file.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.session import init_db
from app.api.conversations import router as conversations_router
from app.api.commitments import router as commitments_router
from app.api.graph import router as graph_router
from app.api.risks import router as risks_router
from app.api.whatif import router as whatif_router
from app.api.approvals import router as approvals_router
from app.api.benchmark import router as benchmark_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on startup
    await init_db()
    yield


app = FastAPI(
    title="PromiseOS API",
    description="The graph that knows whose promise is about to break yours.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API routers
app.include_router(conversations_router)
app.include_router(commitments_router)
app.include_router(graph_router)
app.include_router(risks_router)
app.include_router(whatif_router)
app.include_router(approvals_router)
app.include_router(benchmark_router)


@app.get("/")
async def root():
    return {
        "app": "PromiseOS",
        "tagline": "The graph that knows whose promise is about to break yours.",
        "status": "online",
        "docs_url": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    print("\nStarting PromiseOS Backend on http://127.0.0.1:8000 ...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
