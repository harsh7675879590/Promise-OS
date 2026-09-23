"""
PromiseOS — Conversation & Ingest Endpoints
Handles creation of conversations, parsing chat exports (WhatsApp/email),
and triggering the LangGraph state machine.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import re
from datetime import datetime
import uuid

from ..db.session import get_db
from ..db.models import (
    ConversationModel, MessageModel, CommitmentModel, DependencyModel,
    RiskAssessmentModel, EvidenceModel, RecommendationModel, AgentRunModel
)
from ..models.schemas import (
    CreateConversationRequest, IngestRequest, IngestResponse, Conversation, Message, PipelineState
)
from ..orchestration.state_machine import pipeline_app

router = APIRouter(prefix="", tags=["conversations"])


def parse_whatsapp_text(raw_text: str, conversation_id: str) -> List[Message]:
    """
    Parses WhatsApp format: [Day Time] Sender: Message text
    e.g. [Mon 10:02] Client: Can you send the revised quotation by Friday?
    Also handles standard [Date Time] formats or Sender: Message.
    """
    messages: List[Message] = []
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

    base_time = datetime.utcnow()

    for idx, line in enumerate(lines):
        # Match [Day/Date Time] Sender: Message
        match_bracket = re.match(r"^\[(.*?)\]\s*([^:]+):\s*(.*)$", line)
        if match_bracket:
            timestamp_str = match_bracket.group(1).strip()
            sender = match_bracket.group(2).strip()
            text = match_bracket.group(3).strip()
            
            # Simple synthetic timestamp relative to now based on idx
            sent_at = base_time.replace(hour=10 + (idx // 2), minute=idx * 5 % 60, second=0)

            messages.append(Message(
                id=str(uuid.uuid4()),
                conversation_id=conversation_id,
                sender_name=sender,
                text=text,
                sent_at=sent_at,
                raw_index=idx
            ))
            continue

        # Match Sender: Message
        match_colon = re.match(r"^([^:]+):\s*(.*)$", line)
        if match_colon:
            sender = match_colon.group(1).strip()
            text = match_colon.group(2).strip()
            sent_at = base_time.replace(hour=10 + (idx // 2), minute=idx * 5 % 60, second=0)
            messages.append(Message(
                id=str(uuid.uuid4()),
                conversation_id=conversation_id,
                sender_name=sender,
                text=text,
                sent_at=sent_at,
                raw_index=idx
            ))

    return messages


@router.post("/conversations")
async def create_conversation(req: CreateConversationRequest, db: AsyncSession = Depends(get_db)):
    conv = ConversationModel(
        title=req.title or "Demo WhatsApp Thread",
        source_type=req.source_type
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return {"conversation_id": conv.id, "title": conv.title, "source_type": conv.source_type}


@router.get("/conversations")
async def list_conversations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ConversationModel).order_by(ConversationModel.uploaded_at.desc()))
    convs = result.scalars().all()
    return [{"id": c.id, "title": c.title, "source_type": c.source_type, "uploaded_at": c.uploaded_at.isoformat()} for c in convs]


@router.post("/ingest")
async def ingest_conversation(req: IngestRequest, db: AsyncSession = Depends(get_db)):
    # 1. Verify conversation
    result = await db.execute(select(ConversationModel).where(ConversationModel.id == req.conversation_id))
    conv = result.scalar_one_or_none()
    if not conv:
        # Create on the fly if not yet registered
        conv = ConversationModel(id=req.conversation_id, title="Imported Thread")
        db.add(conv)
        await db.commit()

    # 2. Parse raw text into structured messages
    parsed_messages = parse_whatsapp_text(req.raw_text, req.conversation_id)
    if not parsed_messages:
        raise HTTPException(status_code=400, detail="Could not parse any messages from provided text format.")

    # Save messages to database
    for m in parsed_messages:
        msg_db = MessageModel(
            id=m.id,
            conversation_id=req.conversation_id,
            sender_name=m.sender_name,
            text=m.text,
            sent_at=m.sent_at,
            raw_index=m.raw_index
        )
        db.add(msg_db)
    await db.commit()

    # 3. Execute LangGraph 5-Agent pipeline
    initial_state: PipelineState = {
        "conversation_id": req.conversation_id,
        "messages": parsed_messages,
        "commitments": [],
        "dependencies": [],
        "risks": [],
        "evidence": [],
        "recommendations": [],
        "agent_runs": [],
        "highest_risk_level": "LOW"
    }

    final_state = await pipeline_app.ainvoke(initial_state)

    # 4. Persist pipeline results to database
    # Commitments
    commitment_models = {}
    for c in final_state.get("commitments", []):
        c_db = CommitmentModel(
            id=c.id,
            conversation_id=req.conversation_id,
            owner_name=c.owner_name,
            recipient_name=c.recipient_name,
            action_text=c.action_text,
            deliverable_text=c.deliverable_text,
            deadline_raw=c.deadline_raw,
            deadline_normalized=c.deadline_normalized,
            confidence=c.confidence,
            status=c.status.value if hasattr(c.status, "value") else c.status,
            source_message_id=c.source_message_id
        )
        db.add(c_db)
        commitment_models[c.id] = c_db
    await db.flush()

    # Dependencies
    for d in final_state.get("dependencies", []):
        d_db = DependencyModel(
            id=d.id,
            from_commitment_id=d.from_commitment_id,
            to_commitment_id=d.to_commitment_id,
            edge_type=d.edge_type.value if hasattr(d.edge_type, "value") else d.edge_type,
            confidence=d.confidence
        )
        db.add(d_db)

    # Risk Assessments
    risk_assessment_map = {}
    for r in final_state.get("risks", []):
        r_db = RiskAssessmentModel(
            id=r.id,
            commitment_id=r.commitment_id,
            score=r.score,
            level=r.level.value if hasattr(r.level, "value") else r.level,
            factors_json=[f.model_dump() if hasattr(f, "model_dump") else dict(f) for f in r.factors]
        )
        db.add(r_db)
        risk_assessment_map[r.id] = r_db
    await db.flush()

    # Evidence
    for ev in final_state.get("evidence", []):
        ev_db = EvidenceModel(
            id=ev.id,
            risk_assessment_id=ev.risk_assessment_id,
            description=ev.description,
            source_message_id=ev.source_message_id,
            source_commitment_id=ev.source_commitment_id
        )
        db.add(ev_db)

    # Recommendations
    for rec in final_state.get("recommendations", []):
        rec_db = RecommendationModel(
            id=rec.id,
            risk_assessment_id=rec.risk_assessment_id,
            action_type=rec.action_type.value if hasattr(rec.action_type, "value") else rec.action_type,
            description=rec.description,
            target_person_name=rec.target_person_name,
            draft_message=rec.draft_message
        )
        db.add(rec_db)

    # Agent Runs (Full Audit Trail for judges)
    for run in final_state.get("agent_runs", []):
        run_db = AgentRunModel(
            id=run.id,
            conversation_id=req.conversation_id,
            agent_name=run.agent_name,
            input_json={"summary": run.input_summary},
            output_json={"summary": run.output_summary},
            status=run.status.value if hasattr(run.status, "value") else run.status,
            started_at=run.started_at,
            finished_at=run.finished_at or datetime.utcnow()
        )
        db.add(run_db)

    await db.commit()

    return {
        "status": "completed",
        "conversation_id": req.conversation_id,
        "commitments_extracted": len(final_state.get("commitments", [])),
        "dependencies_found": len(final_state.get("dependencies", [])),
        "highest_risk": final_state.get("highest_risk_level", "LOW")
    }
