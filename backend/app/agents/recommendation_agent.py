"""
PromiseOS — Recommendation Agent (Agent 5/5)
Synthesizes risk factors and evidence into one clear mitigation action.
Drafts the proposed communication for human review and approval.
"""

from typing import List, Dict, Optional
from ..models.schemas import (
    RiskAssessment, Evidence, Commitment, Recommendation, ActionType, RiskLevel
)
from ..services.llm_service import llm_service


class RecommendationAgent:
    """Proposes actionable mitigations with human-in-the-loop drafts."""

    async def run(
        self,
        assessment: RiskAssessment,
        commitment: Commitment,
        evidence: List[Evidence],
        all_commitments: Dict[str, Commitment]
    ) -> Optional[Recommendation]:
        if assessment.level not in [RiskLevel.HIGH, RiskLevel.MEDIUM]:
            return None

        # Determine dominant risk cause
        has_upstream_block = False
        upstream_owner = ""
        upstream_deliverable = ""

        for ev in evidence:
            if ev.source_commitment_id and ev.source_commitment_id in all_commitments:
                upstream = all_commitments[ev.source_commitment_id]
                has_upstream_block = True
                upstream_owner = upstream.owner_name
                upstream_deliverable = upstream.deliverable_text
                break

        # Decision logic mapping to fixed action types:
        if has_upstream_block and upstream_owner:
            action_type = ActionType.FOLLOW_UP
            target_person = upstream_owner
            description = (
                f"Urgent follow-up needed with {upstream_owner} on '{upstream_deliverable}'. "
                f"If not received by today EOD, renegotiate the '{commitment.deliverable_text}' deadline with {commitment.recipient_name}."
            )
            draft_message = (
                f"Hi {upstream_owner}, checking in on the {upstream_deliverable}. "
                f"I need it today to finalize and deliver {commitment.recipient_name}'s {commitment.deliverable_text} on time. "
                f"Could you please confirm if this will be ready by 3 PM?"
            )
        elif "urgency" in [f.name for f in assessment.factors if f.value > 0.6]:
            action_type = ActionType.RENEGOTIATE_DEADLINE
            target_person = commitment.recipient_name
            description = (
                f"Proactively renegotiate deadline for '{commitment.deliverable_text}' with {commitment.recipient_name}."
            )
            draft_message = (
                f"Hi {commitment.recipient_name}, regarding the {commitment.deliverable_text}: "
                f"We are ensuring maximum accuracy and may need until Monday morning to finalize. "
                f"Would that timeline work on your end?"
            )
        else:
            action_type = ActionType.FOLLOW_UP
            target_person = commitment.owner_name
            description = f"Request status update on {commitment.action_text}."
            draft_message = f"Hi {commitment.owner_name}, quick check-in on the progress for {commitment.action_text}."

        return Recommendation(
            risk_assessment_id=assessment.id,
            action_type=action_type,
            description=description,
            target_person_name=target_person,
            draft_message=draft_message
        )


recommendation_agent = RecommendationAgent()
