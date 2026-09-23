"""
PromiseOS — What-If Counterfactual Simulation Engine
Implements Section 13: Traverses downstream dependency chains from a hypothetically delayed
commitment, simulates risk cascades non-destructively in memory, and recommends mitigations.
"""

from typing import List, Dict, Set, Optional
from datetime import datetime
from ..models.schemas import (
    Commitment, DependencyEdge, CascadeItem, WhatIfResponse, RiskLevel, Recommendation, ActionType
)
from ..agents.risk_agent import risk_agent


class WhatIfEngine:
    """Non-destructive graph simulation engine for counterfactual delay analysis."""

    def simulate_delay(
        self,
        target_commitment_id: str,
        commitments: List[Commitment],
        dependencies: List[DependencyEdge]
    ) -> WhatIfResponse:
        commitments_by_id = {c.id: c for c in commitments}
        target = commitments_by_id.get(target_commitment_id)
        if not target:
            return WhatIfResponse(source_commitment_id=target_commitment_id, cascade=[])

        # Step 1: Compute baseline risk scores for comparison
        baseline_risks = {r.commitment_id: r for r in risk_agent.compute_all(commitments, dependencies)}

        # Step 2: Build downstream adjacency graph (who depends on target?)
        # If A depends_on B, then an edge exists with from=A, to=B.
        # Downstream of B is A!
        downstream_map: Dict[str, List[str]] = {}
        for edge in dependencies:
            prereq = edge.to_commitment_id
            dependent = edge.from_commitment_id
            if prereq not in downstream_map:
                downstream_map[prereq] = []
            downstream_map[prereq].append(dependent)

        # Step 3: Traverse downstream using BFS with cycle detection
        visited: Set[str] = set()
        queue: List[tuple[str, int]] = [(target_commitment_id, 0)]  # (commitment_id, depth)
        cascade_items: List[CascadeItem] = []

        # Add target itself at depth 0
        target_baseline = baseline_risks.get(target.id)
        target_orig_score = target_baseline.score if target_baseline else 0.4
        target_orig_level = target_baseline.level if target_baseline else RiskLevel.LOW

        cascade_items.append(CascadeItem(
            commitment_id=target.id,
            commitment_action=target.action_text,
            owner_name=target.owner_name,
            original_risk_score=target_orig_score,
            original_risk_level=target_orig_level,
            new_risk_score=0.92,
            new_risk_level=RiskLevel.HIGH,
            depth=0
        ))
        visited.add(target.id)

        while queue:
            curr_id, depth = queue.pop(0)
            downstream_nodes = downstream_map.get(curr_id, [])

            for next_id in downstream_nodes:
                if next_id not in visited:
                    visited.add(next_id)
                    dep_c = commitments_by_id.get(next_id)
                    if dep_c:
                        b_risk = baseline_risks.get(dep_c.id)
                        orig_score = b_risk.score if b_risk else 0.35
                        orig_level = b_risk.level if b_risk else RiskLevel.LOW

                        # Downstream risk spikes due to upstream delay
                        new_score = round(min(1.0, orig_score + 0.35 * (1.0 - orig_score) + 0.15), 3)
                        new_level = RiskLevel.HIGH if new_score >= 0.65 else RiskLevel.MEDIUM

                        cascade_items.append(CascadeItem(
                            commitment_id=dep_c.id,
                            commitment_action=dep_c.action_text,
                            owner_name=dep_c.owner_name,
                            original_risk_score=orig_score,
                            original_risk_level=orig_level,
                            new_risk_score=new_score,
                            new_risk_level=new_level,
                            depth=depth + 1
                        ))
                        queue.append((next_id, depth + 1))

        # Step 4: Synthesize counterfactual recommendation for the furthest downstream commitment
        rec = None
        if len(cascade_items) > 1:
            furthest = cascade_items[-1]
            rec = Recommendation(
                risk_assessment_id=furthest.commitment_id,
                action_type=ActionType.RENEGOTIATE_DEADLINE,
                description=(
                    f"Cascade Warning: A delay in {target.owner_name}'s '{target.deliverable_text}' immediately threatens "
                    f"{furthest.owner_name}'s deadline for '{furthest.commitment_action}'. Proactively alert stakeholder now."
                ),
                target_person_name=furthest.owner_name,
                draft_message=(
                    f"Heads-up {furthest.owner_name}: {target.owner_name}'s '{target.deliverable_text}' is delayed in our simulation. "
                    f"To protect our delivery on '{furthest.commitment_action}', should we renegotiate the schedule today?"
                )
            )

        return WhatIfResponse(
            source_commitment_id=target_commitment_id,
            cascade=cascade_items,
            recommendation=rec
        )


whatif_engine = WhatIfEngine()
