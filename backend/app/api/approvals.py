"""
PromiseOS — Human-in-the-Loop Approvals API
Implements Section 14: AI proposes, human approves.
Records approval status and generates the confirmed draft text (never auto-dispatches externally).
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from ..db.session import get_db
from ..db.models import RecommendationModel, ApprovalModel
from ..models.schemas import ApproveRequest

router = APIRouter(prefix="", tags=["approvals"])


from typing import Optional

@router.post("/recommendations/{recommendation_id}/approve")
async def approve_recommendation(
    recommendation_id: str,
    req: Optional[ApproveRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    rec_res = await db.execute(
        select(RecommendationModel).where(RecommendationModel.id == recommendation_id)
    )
    rec = rec_res.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    user_id = req.user_id if req and req.user_id else "default_user"

    # Record or update human approval
    app_res = await db.execute(
        select(ApprovalModel).where(ApprovalModel.recommendation_id == recommendation_id)
    )
    approval = app_res.scalar_one_or_none()

    if not approval:
        approval = ApprovalModel(
            recommendation_id=recommendation_id,
            user_id=user_id,
            status="approved",
            decided_at=datetime.utcnow()
        )
        db.add(approval)
    else:
        approval.status = "approved"
        approval.user_id = user_id
        approval.decided_at = datetime.utcnow()

    await db.commit()

    return {
        "status": "approved",
        "recommendation_id": recommendation_id,
        "action_type": rec.action_type,
        "target_person": rec.target_person_name,
        "draft_message": rec.draft_message,
        "note": "Human approval recorded. Draft message prepared for manual copy/dispatch."
    }


@router.post("/recommendations/{recommendation_id}/dismiss")
async def dismiss_recommendation(
    recommendation_id: str,
    req: Optional[ApproveRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    user_id = req.user_id if req and req.user_id else "default_user"

    app_res = await db.execute(
        select(ApprovalModel).where(ApprovalModel.recommendation_id == recommendation_id)
    )
    approval = app_res.scalar_one_or_none()

    if not approval:
        approval = ApprovalModel(
            recommendation_id=recommendation_id,
            user_id=user_id,
            status="dismissed",
            decided_at=datetime.utcnow()
        )
        db.add(approval)
    else:
        approval.status = "dismissed"
        approval.user_id = user_id
        approval.decided_at = datetime.utcnow()

    await db.commit()
    return {"status": "dismissed", "recommendation_id": recommendation_id}
