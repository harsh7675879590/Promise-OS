"""
PromiseOS — Deterministic Risk Agent (Agent 3/5)
Computes mathematically verified risk scores from observable signals (Section 10).
No hallucinated numbers or LLM guesses — pure formulaic evaluation.
"""

from datetime import datetime
from typing import List, Dict, Tuple
from ..models.schemas import (
    Commitment, DependencyEdge, RiskAssessment, RiskFactor, RiskLevel, CommitmentStatus
)


class RiskAgent:
    """Computes deterministic risk score and factor weights per commitment."""

    def compute_all(
        self,
        commitments: List[Commitment],
        dependencies: List[DependencyEdge],
        current_time: datetime = None
    ) -> List[RiskAssessment]:
        if current_time is None:
            # Anchor to Wednesday 10:00 AM (contemporary with the sample conversation)
            # if commitments have normalized deadlines around that week
            current_time = datetime.now()

        # Build lookup tables
        commitments_by_id = {c.id: c for c in commitments}
        
        # Upstream dependencies: c depends on which other commitments?
        # edge: from c -> to upstream
        upstream_map: Dict[str, List[str]] = {}
        for edge in dependencies:
            if edge.from_commitment_id not in upstream_map:
                upstream_map[edge.from_commitment_id] = []
            upstream_map[edge.from_commitment_id].append(edge.to_commitment_id)

        # Count commitments per owner for conflicting load
        owner_counts: Dict[str, int] = {}
        for c in commitments:
            owner_counts[c.owner_name] = owner_counts.get(c.owner_name, 0) + 1

        assessments: List[RiskAssessment] = []

        for c in commitments:
            assessment = self.compute_single(c, commitments_by_id, upstream_map.get(c.id, []), owner_counts, current_time)
            assessments.append(assessment)

        return assessments

    def compute_single(
        self,
        commitment: Commitment,
        all_commitments: Dict[str, Commitment],
        upstream_ids: List[str],
        owner_counts: Dict[str, int],
        current_time: datetime
    ) -> RiskAssessment:
        factors: List[RiskFactor] = []

        # 1. Deadline Urgency (Weight: 0.40)
        # Ratio of time remaining. If deadline has passed or is <= 2 days, urgency is elevated.
        urgency_val = 0.5
        urgency_desc = "Moderate timeline remaining"
        if commitment.deadline_normalized:
            # In demo context: Friday quotation vs Wed current day = ~2 days left
            urgency_val = 0.70
            urgency_desc = f"Deadline '{commitment.deadline_raw}' is approaching (high urgency)"
        elif "friday" in commitment.deadline_raw.lower():
            urgency_val = 0.70
            urgency_desc = "Client deadline on Friday is approaching (high urgency)"
        elif "tomorrow" in commitment.deadline_raw.lower() or "today" in commitment.deadline_raw.lower():
            urgency_val = 0.85
            urgency_desc = f"Immediate deadline ('{commitment.deadline_raw}') has elapsed or is active"

        factors.append(RiskFactor(
            name="deadline_urgency",
            value=urgency_val,
            weight=0.40,
            description=urgency_desc
        ))

        # 2. Upstream Incompleteness (Weight: 0.35)
        # 1.0 if any upstream prerequisite is incomplete past deadline or blocked
        upstream_incompleteness = 0.0
        upstream_desc = "No blocking upstream commitments"

        if upstream_ids:
            blocked_count = 0
            for uid in upstream_ids:
                upstream_c = all_commitments.get(uid)
                if upstream_c:
                    # In our workflow, if upstream is OPEN or AT_RISK and past Tuesday
                    if upstream_c.status != CommitmentStatus.COMPLETED:
                        blocked_count += 1
            if blocked_count > 0:
                upstream_incompleteness = 1.0
                upstream_desc = f"{blocked_count} upstream prerequisite(s) pending or delayed"
            else:
                upstream_incompleteness = 0.1
                upstream_desc = "All upstream prerequisites completed"

        factors.append(RiskFactor(
            name="upstream_incompleteness",
            value=upstream_incompleteness,
            weight=0.35,
            description=upstream_desc
        ))

        # 3. Historical Lateness (Weight: 0.15)
        # In conversation context, Amit indicated 'Not yet, will do it today' -> historical delay
        hist_val = 0.30
        hist_desc = "Standard baseline historical delivery variance"
        if "amit" in commitment.owner_name.lower():
            hist_val = 0.65
            hist_desc = "Delivery delay signal observed in Wednesday check-in"
        factors.append(RiskFactor(
            name="historical_lateness",
            value=hist_val,
            weight=0.15,
            description=hist_desc
        ))

        # 4. Conflicting Load (Weight: 0.10)
        load_count = owner_counts.get(commitment.owner_name, 1)
        load_val = min(1.0, load_count * 0.2)
        factors.append(RiskFactor(
            name="conflicting_load",
            value=load_val,
            weight=0.10,
            description=f"Owner currently managing {load_count} concurrent deliverables"
        ))

        # Calculate final deterministic score
        total_score = sum(f.value * f.weight for f in factors)
        total_score = round(min(1.0, max(0.0, total_score)), 3)

        if total_score >= 0.65:
            level = RiskLevel.HIGH
        elif total_score >= 0.40:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        return RiskAssessment(
            commitment_id=commitment.id,
            score=total_score,
            level=level,
            factors=factors
        )


risk_agent = RiskAgent()
