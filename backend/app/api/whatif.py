"""
PromiseOS — What-If Simulator API
Executes counterfactual delay simulations without persisting mutations to the database.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..db.session import get_db
from ..db.models import CommitmentModel, DependencyModel
from ..models.schemas import WhatIfRequest, Commitment, DependencyEdge, EdgeType
from ..services.whatif_engine import whatif_engine

router = APIRouter(prefix="", tags=["whatif"])


@router.post("/what-if")
async def run_what_if_simulation(req: WhatIfRequest, db: AsyncSession = Depends(get_db)):
    target_id = req.get_commitment_id()
    if not target_id:
        raise HTTPException(status_code=400, detail="Please provide 'commitment_id' or 'id' in request body.")

    # 1. Fetch target commitment to identify conversation
    t_res = await db.execute(select(CommitmentModel).where(CommitmentModel.id == target_id))
    target = t_res.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Target commitment not found for simulation")

    # 2. Fetch all commitments and dependencies for this conversation
    c_res = await db.execute(
        select(CommitmentModel).where(CommitmentModel.conversation_id == target.conversation_id)
    )
    commitments_db = c_res.scalars().all()

    c_ids = [c.id for c in commitments_db]
    if c_ids:
        d_res = await db.execute(
            select(DependencyModel).where(DependencyModel.from_commitment_id.in_(c_ids))
        )
        dependencies_db = d_res.scalars().all()
    else:
        dependencies_db = []

    # Convert to Pydantic objects for the non-destructive engine
    commitments = [
        Commitment(
            id=c.id,
            conversation_id=c.conversation_id,
            owner_name=c.owner_name,
            recipient_name=c.recipient_name,
            action_text=c.action_text,
            deliverable_text=c.deliverable_text,
            deadline_raw=c.deadline_raw,
            deadline_normalized=c.deadline_normalized,
            confidence=c.confidence,
            status=c.status,
            source_message_id=c.source_message_id or ""
        )
        for c in commitments_db
    ]

    dependencies = [
        DependencyEdge(
            id=d.id,
            from_commitment_id=d.from_commitment_id,
            to_commitment_id=d.to_commitment_id,
            edge_type=EdgeType(d.edge_type) if d.edge_type in [e.value for e in EdgeType] else EdgeType.DEPENDS_ON,
            confidence=d.confidence
        )
        for d in dependencies_db
    ]

    # 3. Simulate delay cascade in memory
    simulation_result = whatif_engine.simulate_delay(
        target_commitment_id=target_id,
        commitments=commitments,
        dependencies=dependencies
    )

    return simulation_result
