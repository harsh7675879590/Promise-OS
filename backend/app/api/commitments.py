"""
PromiseOS — Commitments API
Endpoints for fetching extracted commitments, risk levels, and specific commitment details with evidence.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional

from ..db.session import get_db
from ..db.models import CommitmentModel, RiskAssessmentModel, EvidenceModel, MessageModel

router = APIRouter(prefix="", tags=["commitments"])


@router.get("/commitments")
async def list_commitments(
    conversation_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(CommitmentModel)
    if conversation_id:
        query = query.where(CommitmentModel.conversation_id == conversation_id)
    query = query.order_by(CommitmentModel.created_at.desc())

    result = await db.execute(query)
    commitments = result.scalars().all()

    output = []
    for c in commitments:
        # Load risk assessment
        r_result = await db.execute(
            select(RiskAssessmentModel).where(RiskAssessmentModel.commitment_id == c.id)
        )
        risk = r_result.scalar_one_or_none()

        output.append({
            "id": c.id,
            "conversation_id": c.conversation_id,
            "owner": c.owner_name,
            "recipient": c.recipient_name,
            "action": c.action_text,
            "deliverable": c.deliverable_text,
            "deadline": c.deadline_raw,
            "deadline_normalized": c.deadline_normalized.isoformat() if c.deadline_normalized else None,
            "confidence": c.confidence,
            "status": c.status,
            "risk_level": risk.level if risk else "LOW",
            "risk_score": risk.score if risk else 0.0,
            "source_message_id": c.source_message_id
        })

    return output


@router.get("/commitments/{commitment_id}")
async def get_commitment_details(commitment_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CommitmentModel).where(CommitmentModel.id == commitment_id)
    )
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Commitment not found")

    # Fetch risk assessment
    r_result = await db.execute(
        select(RiskAssessmentModel).where(RiskAssessmentModel.commitment_id == c.id)
    )
    risk = r_result.scalar_one_or_none()

    evidence_items = []
    if risk:
        ev_result = await db.execute(
            select(EvidenceModel).where(EvidenceModel.risk_assessment_id == risk.id)
        )
        evidence_items = ev_result.scalars().all()

    # Fetch source message
    src_msg = None
    if c.source_message_id:
        m_result = await db.execute(
            select(MessageModel).where(MessageModel.id == c.source_message_id)
        )
        msg = m_result.scalar_one_or_none()
        if msg:
            src_msg = {
                "id": msg.id,
                "sender": msg.sender_name,
                "text": msg.text,
                "sent_at": msg.sent_at.isoformat()
            }

    return {
        "commitment": {
            "id": c.id,
            "conversation_id": c.conversation_id,
            "owner": c.owner_name,
            "recipient": c.recipient_name,
            "action": c.action_text,
            "deliverable": c.deliverable_text,
            "deadline": c.deadline_raw,
            "confidence": c.confidence,
            "status": c.status,
            "created_at": c.created_at.isoformat()
        },
        "risk_assessment": {
            "id": risk.id if risk else None,
            "score": risk.score if risk else 0.0,
            "level": risk.level if risk else "LOW",
            "factors": risk.factors_json if risk else []
        },
        "evidence": [
            {
                "id": e.id,
                "description": e.description,
                "source_message_id": e.source_message_id,
                "source_commitment_id": e.source_commitment_id
            }
            for e in evidence_items
        ],
        "source_message": src_msg
    }
