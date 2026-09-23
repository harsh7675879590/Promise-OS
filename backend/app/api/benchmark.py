"""
PromiseOS — AMD ROCm Benchmark API
Exposes endpoints to view and trigger live benchmark runs comparing AMD ROCm GPU acceleration to CPU.
"""

from fastapi import APIRouter, Query
from ..services.benchmark_service import benchmark_service

router = APIRouter(prefix="", tags=["benchmark"])


@router.get("/benchmark")
async def get_benchmark_summary():
    """Returns baseline comparative metrics between AMD ROCm and CPU inference."""
    return benchmark_service.run_benchmark(batch_size=50)


@router.post("/benchmark/run")
async def execute_live_benchmark(batch_size: int = Query(50, ge=10, le=200)):
    """Triggers an active batch benchmark run against AMD GPU (ROCm) vs CPU."""
    return benchmark_service.run_benchmark(batch_size=batch_size)
