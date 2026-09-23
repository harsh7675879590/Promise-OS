"""
PromiseOS — FastAPI Backend Application
Autonomous commitment extraction, dependency graph generation, deterministic risk scoring,
what-if counterfactual cascade simulation, and AMD ROCm benchmark harness.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .db.session import init_db
from .api.conversations import router as conversations_router
from .api.commitments import router as commitments_router
from .api.graph import router as graph_router
from .api.risks import router as risks_router
from .api.whatif import router as whatif_router
from .api.approvals import router as approvals_router
from .api.benchmark import router as benchmark_router


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
