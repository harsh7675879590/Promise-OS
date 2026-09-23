"""
PromiseOS — Risk Center API
Fetches prioritized risk assessments, mathematical factor decompositions, and linked evidence.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from ..db.session import get_db
from ..db.models import RiskAssessmentModel, CommitmentModel, EvidenceModel, RecommendationModel

router = APIRouter(prefix="", tags=["risks"])


@router.get("/risks")
async def list_risks(
    conversation_id: Optional[str] = Query(None),
    min_level: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(RiskAssessmentModel).join(CommitmentModel)
    if conversation_id:
        query = query.where(CommitmentModel.conversation_id == conversation_id)

    # Sort HIGH first, then MEDIUM, then LOW
    result = await db.execute(query.order_by(RiskAssessmentModel.score.desc()))
    assessments = result.scalars().all()

    output = []
    level_hierarchy = {"LOW": 1, "MEDIUM": 2, "HIGH": 3}
    min_threshold = level_hierarchy.get((min_level or "LOW").upper(), 1)

    for r in assessments:
        if level_hierarchy.get(r.level, 1) < min_threshold:
            continue

        # Commitment info
        c_res = await db.execute(select(CommitmentModel).where(CommitmentModel.id == r.commitment_id))
        c = c_res.scalar_one_or_none()

        # Evidence
        ev_res = await db.execute(select(EvidenceModel).where(EvidenceModel.risk_assessment_id == r.id))
        ev_items = ev_res.scalars().all()

        # Recommendation
        rec_res = await db.execute(select(RecommendationModel).where(RecommendationModel.risk_assessment_id == r.id))
        rec = rec_res.scalar_one_or_none()

        output.append({
            "id": r.id,
            "commitment_id": r.commitment_id,
            "commitment_action": c.action_text if c else "",
            "deliverable": c.deliverable_text if c else "",
            "owner": c.owner_name if c else "",
            "recipient": c.recipient_name if c else "",
            "deadline": c.deadline_raw if c else "",
            "score": r.score,
            "level": r.level,
            "factors": r.factors_json,
            "evidence": [
                {
                    "id": e.id,
                    "description": e.description,
                    "source_message_id": e.source_message_id,
                    "source_commitment_id": e.source_commitment_id
                }
                for e in ev_items
            ],
            "recommendation": {
                "id": rec.id,
                "action_type": rec.action_type,
                "description": rec.description,
                "target_person": rec.target_person_name,
                "draft_message": rec.draft_message
            } if rec else None
        })

    return output
