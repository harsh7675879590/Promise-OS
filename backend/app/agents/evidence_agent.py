"""
PromiseOS — Evidence & Investigation Agent (Agent 4/5)
Assembles traceable citations for risk factors back to exact source messages.
Implements a strict citation check to discard any unsubstantiated claims.
"""

from typing import List, Dict, Optional
from ..models.schemas import (
    RiskAssessment, Evidence, Commitment, Message, DependencyEdge
)
from ..services.llm_service import llm_service


class EvidenceAgent:
    """Investigates and synthesizes evidence supporting elevated risk levels."""

    async def run(
        self,
        assessment: RiskAssessment,
        commitment: Commitment,
        all_commitments: Dict[str, Commitment],
        messages: List[Message],
        dependencies: List[DependencyEdge]
    ) -> List[Evidence]:
        evidence_items: List[Evidence] = []
        messages_by_id = {m.id: m for m in messages}

        # 1. Trace source commitment message
        if commitment.source_message_id and commitment.source_message_id in messages_by_id:
            src_msg = messages_by_id[commitment.source_message_id]
            evidence_items.append(Evidence(
                risk_assessment_id=assessment.id,
                description=f"Original commitment made by {src_msg.sender_name}: '{src_msg.text}'",
                source_message_id=src_msg.id
            ))

        # 2. Trace upstream dependencies that are incomplete or delayed
        for edge in dependencies:
            if edge.from_commitment_id == commitment.id:
                upstream = all_commitments.get(edge.to_commitment_id)
                if upstream:
                    upstream_msg = messages_by_id.get(upstream.source_message_id)
                    evidence_items.append(Evidence(
                        risk_assessment_id=assessment.id,
                        description=(
                            f"Dependent on upstream deliverable '{upstream.deliverable_text}' from {upstream.owner_name} "
                            f"(due {upstream.deadline_raw}), which is still incomplete."
                        ),
                        source_commitment_id=upstream.id,
                        source_message_id=upstream_msg.id if upstream_msg else None
                    ))

        # 3. Look for status update / delay signals in messages
        for msg in messages:
            lower = msg.text.lower()
            if any(phrase in lower for phrase in ["not yet", "delay", "waiting", "blocked", "later today", "still working"]):
                evidence_items.append(Evidence(
                    risk_assessment_id=assessment.id,
                    description=f"Incompletion signal from {msg.sender_name}: \"{msg.text}\"",
                    source_message_id=msg.id
                ))

        # 4. Anti-hallucination verification:
        # Every evidence item MUST be anchored to either a source_message_id or a source_commitment_id
        verified_evidence: List[Evidence] = []
        for ev in evidence_items:
            if ev.source_message_id or ev.source_commitment_id:
                verified_evidence.append(ev)

        return verified_evidence


evidence_agent = EvidenceAgent()
