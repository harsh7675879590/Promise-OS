"""
PromiseOS — Resolution & Dependency Agent (Agent 2/5)
Identifies semantic artifact relationships and creates dependency edges across commitments.
Forms: Commitment A (e.g. Quotation) depends_on Commitment B (e.g. Pricing).
"""

import re
from typing import List, Optional, Dict, Any
from ..models.schemas import Commitment, Message, DependencyEdge, EdgeType
from ..services.llm_service import llm_service


class ResolutionAgent:
    """Discovers dependency edges between commitments using conversational cues and deliverable matching."""

    async def run(self, commitments: List[Commitment], messages: List[Message]) -> List[DependencyEdge]:
        if len(commitments) < 2:
            return []

        # Try LLM adjudication first if available
        llm_edges = await self._resolve_via_llm(commitments, messages)
        if llm_edges is not None:
            return llm_edges

        return self._resolve_deterministic(commitments, messages)

    async def _resolve_via_llm(self, commitments: List[Commitment], messages: List[Message]) -> Optional[List[DependencyEdge]]:
        prompt = (
            "Analyze these commitments and messages. Find dependencies where one commitment's deliverable is required "
            "for another commitment to be completed.\n"
            "Return JSON with key 'dependencies' containing a list of objects with:\n"
            "  - from_commitment_id (the dependent commitment)\n"
            "  - to_commitment_id (the prerequisite commitment it depends on)\n"
            "  - edge_type ('depends_on')\n"
            "  - confidence (float)\n\n"
            "Commitments:\n"
        )
        for c in commitments:
            prompt += f"- ID: {c.id} | Owner: {c.owner_name} -> {c.recipient_name} | Action: {c.action_text} | Deliverable: {c.deliverable_text}\n"

        prompt += "\nContext Messages:\n"
        for m in messages:
            prompt += f"[{m.sent_at.isoformat()}] {m.sender_name}: {m.text}\n"

        system_prompt = (
            "You are a dependency resolution agent for PromiseOS. "
            "Output valid JSON identifying which commitments depend on others."
        )

        res = await llm_service.generate_json(prompt, system_prompt)
        if res and "dependencies" in res and isinstance(res["dependencies"], list):
            edges = []
            for item in res["dependencies"]:
                edges.append(DependencyEdge(
                    from_commitment_id=item["from_commitment_id"],
                    to_commitment_id=item["to_commitment_id"],
                    edge_type=EdgeType.DEPENDS_ON,
                    confidence=float(item.get("confidence", 0.9))
                ))
            return edges
        return None

    def _resolve_deterministic(self, commitments: List[Commitment], messages: List[Message]) -> List[DependencyEdge]:
        edges: List[DependencyEdge] = []
        commitments_by_id = {c.id: c for c in commitments}

        # Scan messages for explicit dependency statements:
        # e.g. "I need the updated pricing to finish the quote"
        for msg in messages:
            text = msg.text.lower()
            
            # Pattern: "need <item1> to (finish|complete|do|send) <item2>"
            dep_match = re.search(r"need\s+(?:the\s+)?(.+?)\s+to\s+(?:finish|complete|do|send|make)\s+(?:the\s+)?(.+?)(?:\.|$)", text)
            if dep_match:
                prereq_phrase = dep_match.group(1).strip()
                dependent_phrase = dep_match.group(2).strip()

                prereq_commitments = [
                    c for c in commitments 
                    if any(w in c.deliverable_text.lower() or w in c.action_text.lower() for w in prereq_phrase.split())
                    or c.owner_name.lower() in text
                ]
                dependent_commitments = [
                    c for c in commitments 
                    if any(w in c.deliverable_text.lower() or w in c.action_text.lower() for w in dependent_phrase.split())
                    or c.owner_name.lower() == msg.sender_name.lower()
                ]

                for dep in dependent_commitments:
                    for prereq in prereq_commitments:
                        if dep.id != prereq.id:
                            # dep requires prereq
                            edges.append(DependencyEdge(
                                from_commitment_id=dep.id,
                                to_commitment_id=prereq.id,
                                edge_type=EdgeType.DEPENDS_ON,
                                confidence=0.92
                            ))

        # Fallback keyword deliverable matching if no explicit edge was discovered
        if not edges:
            for c1 in commitments:
                for c2 in commitments:
                    if c1.id == c2.id:
                        continue
                    # If C1 mentions pricing and C2 is sending pricing, C1 depends on C2
                    if "quot" in c1.action_text.lower() and "pric" in c2.action_text.lower():
                        edges.append(DependencyEdge(
                            from_commitment_id=c1.id,
                            to_commitment_id=c2.id,
                            edge_type=EdgeType.DEPENDS_ON,
                            confidence=0.88
                        ))

        # Deduplicate
        unique_edges = {}
        for edge in edges:
            key = (edge.from_commitment_id, edge.to_commitment_id, edge.edge_type)
            if key not in unique_edges:
                unique_edges[key] = edge

        return list(unique_edges.values())


resolution_agent = ResolutionAgent()
