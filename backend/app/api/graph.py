"""
PromiseOS — Graph Visualization API
Formats commitment nodes and dependency edges for ReactFlow interactive rendering.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any

from ..db.session import get_db
from ..db.models import CommitmentModel, DependencyModel, RiskAssessmentModel, MessageModel

router = APIRouter(prefix="", tags=["graph"])


@router.get("/graph/{conversation_id}")
async def get_graph(conversation_id: str, db: AsyncSession = Depends(get_db)):
    # 1. Fetch commitments for this conversation
    c_res = await db.execute(
        select(CommitmentModel).where(CommitmentModel.conversation_id == conversation_id)
    )
    commitments = c_res.scalars().all()
    if not commitments:
        return {"nodes": [], "edges": []}

    c_ids = [c.id for c in commitments]

    # 2. Fetch risk assessments
    r_res = await db.execute(
        select(RiskAssessmentModel).where(RiskAssessmentModel.commitment_id.in_(c_ids))
    )
    risks = {r.commitment_id: r for r in r_res.scalars().all()}

    # 3. Fetch dependencies
    d_res = await db.execute(
        select(DependencyModel).where(DependencyModel.from_commitment_id.in_(c_ids))
    )
    dependencies = d_res.scalars().all()

    nodes: List[Dict[str, Any]] = []
    edges: List[Dict[str, Any]] = []

    # Map people to create person nodes and commitment nodes for full Section 3 graph view:
    # "Client —requests→ Harshit —promises→ Quotation —requires→ Updated Pricing ←promises— Amit"
    people_seen = set()
    x_offset = 50
    y_offset = 80

    for idx, c in enumerate(commitments):
        risk = risks.get(c.id)
        risk_level = risk.level if risk else "LOW"
        risk_score = risk.score if risk else 0.0

        # Commitment Node
        nodes.append({
            "id": c.id,
            "type": "commitmentNode",
            "position": {"x": 360, "y": 80 + idx * 180},
            "data": {
                "id": c.id,
                "label": c.deliverable_text or c.action_text,
                "action": c.action_text,
                "deliverable": c.deliverable_text,
                "owner": c.owner_name,
                "recipient": c.recipient_name,
                "deadline": c.deadline_raw,
                "risk_level": risk_level,
                "risk_score": risk_score,
                "status": c.status,
                "confidence": c.confidence
            }
        })

        # Person Node (Owner)
        if c.owner_name and c.owner_name not in people_seen:
            people_seen.add(c.owner_name)
            nodes.append({
                "id": f"person_{c.owner_name}",
                "type": "personNode",
                "position": {"x": 80, "y": 80 + len(people_seen) * 140},
                "data": {
                    "label": c.owner_name,
                    "role": "Team Member" if c.owner_name != "Client" else "External Stakeholder"
                }
            })

        # Edge from Owner -> Commitment
        edges.append({
            "id": f"edge_owner_{c.owner_name}_{c.id}",
            "source": f"person_{c.owner_name}",
            "target": c.id,
            "label": "promises",
            "animated": False,
            "style": {"stroke": "#94a3b8", "strokeWidth": 1.5}
        })

        # Person Node (Recipient)
        if c.recipient_name and c.recipient_name not in people_seen and c.recipient_name != "Team":
            people_seen.add(c.recipient_name)
            nodes.append({
                "id": f"person_{c.recipient_name}",
                "type": "personNode",
                "position": {"x": 720, "y": 80 + len(people_seen) * 140},
                "data": {
                    "label": c.recipient_name,
                    "role": "Client" if "client" in c.recipient_name.lower() else "Stakeholder"
                }
            })

    # Commitment-to-Commitment Dependency Edges
    for dep in dependencies:
        edges.append({
            "id": f"dep_{dep.id}",
            "source": dep.from_commitment_id,
            "target": dep.to_commitment_id,
            "label": "requires",
            "animated": True,
            "style": {
                "stroke": "#f43f5e",
                "strokeWidth": 2.5,
                "strokeDasharray": "5,5"
            }
        })

    return {"nodes": nodes, "edges": edges}
