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
    CreateConversationRequest, IngestRequest, IngestResponse, Conversation, Message
)
from ..orchestration.state_machine import pipeline_app, PipelineState

router = APIRouter(prefix="", tags=["conversations"])


def parse_whatsapp_text(raw_text: str, conversation_id: str) -> List[Message]:
    """
    Universally parses chat exports:
    - [Mon 10:02] Sender: Message
    - [24/09/2026, 10:02:15] Sender: Message
    - 24/09/2026, 10:02 - Sender: Message (Standard Android / iOS WhatsApp export)
    - 24/09/2026, 10:02 am - Sender: Message (Standard 12h format)
    - Sender (10:02): Message
    - Sender: Message
    - Multiline continuation lines
    """
    messages: List[Message] = []
    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
    base_time = datetime.utcnow()

    # Ordered list of regex patterns from most specific to general
    header_patterns = [
        # 1. [timestamp] Sender: text
        re.compile(r"^\[(.*?)\]\s*([^:\(\)]+?):\s*(.*)$"),
        # 2. Date, Time (with optional AM/PM) - Sender: text
        re.compile(r"^(?:\d{1,4}[/\-\.]\d{1,2}[/\-\.]\d{1,4}[,\s]+)?(?:\d{1,2}:\d{2}(?::\d{2})?(?:\s*[apAP][mM])?)\s*[\-\–]\s*([^:]+?):\s*(.*)$"),
        # 3. Date/Any - Sender: text
        re.compile(r"^(?:.+?)\s*[\-\–]\s*([^:]+?):\s*(.*)$"),
        # 4. Sender (Time): text
        re.compile(r"^([^:\(\)]+?)\s*\([^\)]+\):\s*(.*)$"),
        # 5. Sender: text
        re.compile(r"^([^:]+?):\s*(.*)$")
    ]

    for idx, line in enumerate(lines):
        matched = False
        for p in header_patterns:
            m = p.match(line)
            if m:
                groups = m.groups()
                if len(groups) == 3:
                    # [timestamp] sender: text
                    sender = groups[1].strip()
                    text = groups[2].strip()
                else:
                    # sender: text
                    sender = groups[0].strip()
                    text = groups[1].strip()

                # Filter out accidental matches like URLs or time stamps as senders
                if len(sender) > 60 or "http" in sender.lower():
                    continue

                sent_at = base_time.replace(hour=9 + (idx // 2), minute=(idx * 7) % 60, second=0)

                messages.append(Message(
                    id=str(uuid.uuid4()),
                    conversation_id=conversation_id,
                    sender_name=sender,
                    text=text,
                    sent_at=sent_at,
                    raw_index=idx
                ))
                matched = True
                break

        if not matched and messages:
            # Continuation of previous message
            messages[-1].text += "\n" + line
        elif not matched:
            # Fallback for line without colon
            messages.append(Message(
                id=str(uuid.uuid4()),
                conversation_id=conversation_id,
                sender_name="Participant",
                text=line,
                sent_at=base_time.replace(hour=9 + (idx // 2), minute=(idx * 7) % 60, second=0),
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
    # 1. Extract text and auto-generate conversation if missing
    raw_text = req.get_text()
    if not raw_text:
        raise HTTPException(
            status_code=400,
            detail="No chat content provided. Please provide conversation text in 'raw_text' or 'text' field."
        )

    conv_id = req.conversation_id or str(uuid.uuid4())

    result = await db.execute(select(ConversationModel).where(ConversationModel.id == conv_id))
    conv = result.scalar_one_or_none()
    if not conv:
        conv = ConversationModel(id=conv_id, title="Imported Chat Thread")
        db.add(conv)
        await db.commit()

    # 2. Parse raw text into structured messages
    parsed_messages = parse_whatsapp_text(raw_text, conv_id)
    if not parsed_messages:
        raise HTTPException(status_code=400, detail="Could not parse any messages from provided text format.")

    # Save messages to database
    for m in parsed_messages:
        msg_db = MessageModel(
            id=m.id,
            conversation_id=conv_id,
            sender_name=m.sender_name,
            text=m.text,
            sent_at=m.sent_at,
            raw_index=m.raw_index
        )
        db.add(msg_db)
    await db.commit()

    # 3. Execute LangGraph 5-Agent pipeline
    initial_state: PipelineState = {
        "conversation_id": conv_id,
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
            conversation_id=conv_id,
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
            conversation_id=conv_id,
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
        "conversation_id": conv_id,
        "commitments_extracted": len(final_state.get("commitments", [])),
        "dependencies_found": len(final_state.get("dependencies", [])),
        "highest_risk": final_state.get("highest_risk_level", "LOW")
    }
