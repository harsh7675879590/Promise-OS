"""
PromiseOS — Benchmark, Evaluation & Historical RAG API
Exposes endpoints to view and trigger live benchmark runs:
1. AMD ROCm GPU acceleration vs CPU throughput
2. Agent Quality Evaluation Metrics (Precision, Recall, F1, Groundedness)
3. Historical Commitment & Reliability RAG store
"""

from fastapi import APIRouter, Query, Body
from typing import Dict, Any
from ..services.benchmark_service import benchmark_service
from ..services.evaluation_service import evaluation_service
from ..services.rag_service import rag_service

router = APIRouter(prefix="", tags=["benchmark"])


@router.get("/benchmark")
async def get_benchmark_summary():
    """Returns baseline comparative metrics between AMD ROCm and CPU inference."""
    return benchmark_service.run_benchmark(batch_size=50)


@router.post("/benchmark/run")
async def execute_live_benchmark(batch_size: int = Query(50, ge=10, le=200)):
    """Triggers an active batch benchmark run against AMD GPU (ROCm) vs CPU."""
    return benchmark_service.run_benchmark(batch_size=batch_size)


@router.get("/evaluation")
async def get_evaluation_metrics():
    """Returns quality evaluation metrics (Precision, Recall, F1, Groundedness)."""
    return await evaluation_service.run_evaluation()


@router.post("/evaluation/run")
async def execute_evaluation_run():
    """Executes a live evaluation run across all annotated benchmark scenarios."""
    return await evaluation_service.run_evaluation()


@router.get("/rag/profiles")
async def get_historical_rag_profiles():
    """Returns all participant reliability profiles retrieved from the RAG knowledge store."""
    return rag_service.get_all_profiles()


@router.post("/rag/index")
async def index_historical_outcome(payload: Dict[str, Any] = Body(...)):
    """Indexes a newly completed or delayed commitment outcome into the RAG store."""
    owner = payload.get("owner", "Unknown")
    deliverable = payload.get("deliverable", "Unnamed Deliverable")
    on_time = payload.get("on_time", True)
    notes = payload.get("notes", "")
    return rag_service.index_commitment_outcome(owner, deliverable, on_time, notes)

