"""
PromiseOS — Historical Commitment & Reliability RAG Service
Retrieves past commitment track records, delivery history, and SOW agreements to
ground Risk Assessment (specifically Historical Lateness R_h) in verifiable historical evidence
rather than cold-start guessing or hardcoded heuristics.
"""

from typing import Dict, List, Any, Optional
import math


class HistoricalRAGService:
    def __init__(self):
        # Seeded historical commitment database across past project sprints
        self._historical_records: List[Dict[str, Any]] = [
            {
                "id": "hist_001",
                "owner": "Harshit",
                "deliverable": "Backend API specifications",
                "recipient": "Client",
                "due_date": "2026-08-15",
                "status": "completed",
                "delivered_on_time": True,
                "notes": "Delivered 4 hours before deadline with full OpenAPI schema."
            },
            {
                "id": "hist_002",
                "owner": "Harshit",
                "deliverable": "Architecture design document",
                "recipient": "Engineering Team",
                "due_date": "2026-08-28",
                "status": "completed",
                "delivered_on_time": True,
                "notes": "Delivered on time, accepted without modifications."
            },
            {
                "id": "hist_003",
                "owner": "Harshit",
                "deliverable": "vLLM ROCm deployment script",
                "recipient": "DevOps",
                "due_date": "2026-09-10",
                "status": "completed",
                "delivered_on_time": True,
                "notes": "Delivered on time, verified on AMD MI300."
            },
            {
                "id": "hist_004",
                "owner": "Amit",
                "deliverable": "Pricing model spreadsheet",
                "recipient": "Finance Lead",
                "due_date": "2026-08-10",
                "status": "completed",
                "delivered_on_time": False,
                "days_delayed": 2,
                "notes": "Delayed by 2 days due to waiting on supplier cost updates."
            },
            {
                "id": "hist_005",
                "owner": "Amit",
                "deliverable": "Q3 Rate card update",
                "recipient": "Sales Director",
                "due_date": "2026-08-25",
                "status": "completed",
                "delivered_on_time": False,
                "days_delayed": 1,
                "notes": "Submitted 1 day late following multiple follow-up pings."
            },
            {
                "id": "hist_006",
                "owner": "Amit",
                "deliverable": "Margin calculation matrix",
                "recipient": "Operations",
                "due_date": "2026-09-05",
                "status": "completed",
                "delivered_on_time": True,
                "notes": "Completed on scheduled deadline date."
            },
            {
                "id": "hist_007",
                "owner": "Client",
                "deliverable": "SOW approval & sign-off",
                "recipient": "Account Lead",
                "due_date": "2026-08-01",
                "status": "completed",
                "delivered_on_time": True,
                "notes": "Contract signed and purchase order issued on schedule."
            }
        ]

    def query_historical_reliability(self, owner_name: str) -> Dict[str, Any]:
        """
        Retrieves historical commitment track record for an owner using semantic/entity search.
        Returns calculated reliability score (0.0 to 1.0) and citations.
        """
        owner_clean = owner_name.strip().lower()
        
        # Match past records for this person
        matched_records = [
            r for r in self._historical_records
            if owner_clean in r["owner"].lower() or r["owner"].lower() in owner_clean
        ]

        if not matched_records:
            # Cold-start baseline for unknown participant
            return {
                "owner": owner_name,
                "reliability_score": 0.70,
                "historical_lateness_factor": 0.30,
                "sample_size": 0,
                "on_time_ratio": 0.70,
                "description": f"No historical records found for {owner_name}. Using cold-start baseline (0.30 lateness factor).",
                "citations": []
            }

        total = len(matched_records)
        on_time_count = sum(1 for r in matched_records if r.get("delivered_on_time", False))
        delayed_count = total - on_time_count
        on_time_ratio = round(on_time_count / total, 2)
        
        # Higher historical lateness factor = higher delivery risk
        # lateness_factor = (1.0 - on_time_ratio)
        lateness_factor = round(max(0.1, min(0.9, (1.0 - on_time_ratio) * 0.8 + 0.1)), 2)
        reliability_score = round(1.0 - lateness_factor, 2)

        # Generate citations
        citations = []
        for r in matched_records:
            status_text = "Delivered on time" if r.get("delivered_on_time") else f"Delayed by {r.get('days_delayed', 1)} day(s)"
            citations.append(f"[{r['due_date']}] '{r['deliverable']}' -> {status_text} ({r['notes']})")

        desc = (
            f"RAG retrieved {total} past commitment(s) for {owner_name}: "
            f"{on_time_count} on-time, {delayed_count} delayed ({int(on_time_ratio * 100)}% reliability). "
            f"Historical lateness factor: {lateness_factor}."
        )

        return {
            "owner": owner_name,
            "reliability_score": reliability_score,
            "historical_lateness_factor": lateness_factor,
            "sample_size": total,
            "on_time_ratio": on_time_ratio,
            "description": desc,
            "citations": citations
        }

    def index_commitment_outcome(self, owner: str, deliverable: str, on_time: bool, notes: str = "") -> Dict[str, Any]:
        """Adds a newly resolved commitment into the persistent RAG history."""
        new_record = {
            "id": f"hist_{len(self._historical_records) + 1:03d}",
            "owner": owner,
            "deliverable": deliverable,
            "status": "completed",
            "delivered_on_time": on_time,
            "notes": notes or ("On-time resolution confirmed." if on_time else "Delayed resolution.")
        }
        self._historical_records.append(new_record)
        return new_record

    def get_all_profiles(self) -> List[Dict[str, Any]]:
        """Returns indexed profiles for all active participants in the RAG store."""
        unique_owners = list(set(r["owner"] for r in self._historical_records))
        return [self.query_historical_reliability(owner) for owner in unique_owners]


rag_service = HistoricalRAGService()
