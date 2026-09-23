"""
PromiseOS — Extraction Agent (Agent 1/5)
Parses raw conversation messages into structured commitments with owner, recipient,
action, deliverable, raw deadline, normalized deadline, confidence, and source message citation.
"""

import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..models.schemas import Message, Commitment, CommitmentStatus
from ..services.llm_service import llm_service


DAY_MAP = {
    "monday": 0, "mon": 0,
    "tuesday": 1, "tue": 1,
    "wednesday": 2, "wed": 2,
    "thursday": 3, "thu": 3,
    "friday": 4, "fri": 4,
    "saturday": 5, "sat": 5,
    "sunday": 6, "sun": 6
}


def normalize_relative_deadline(raw_deadline: str, base_time: datetime) -> Optional[datetime]:
    """Normalizes relative strings like 'tomorrow', 'Friday', 'today', 'EOD' into ISO datetimes."""
    if not raw_deadline:
        return None
    raw_lower = raw_deadline.lower().strip()

    if "today" in raw_lower or "eod" in raw_lower:
        return base_time.replace(hour=18, minute=0, second=0, microsecond=0)
    elif "tomorrow" in raw_lower:
        target = base_time + timedelta(days=1)
        return target.replace(hour=18, minute=0, second=0, microsecond=0)
    
    for day_name, day_idx in DAY_MAP.items():
        if day_name in raw_lower:
            current_day = base_time.weekday()
            days_ahead = (day_idx - current_day) % 7
            if days_ahead == 0:
                days_ahead = 7
            target = base_time + timedelta(days=days_ahead)
            return target.replace(hour=18, minute=0, second=0, microsecond=0)
            
    # Default to 3 days out if unspecified
    return base_time + timedelta(days=3)


class ExtractionAgent:
    """Agent that extracts explicit commitments from conversation messages."""

    async def run(self, messages: List[Message], conversation_id: str) -> List[Commitment]:
        commitments: List[Commitment] = []
        if not messages:
            return commitments

        # Attempt structured LLM extraction first if vLLM/OpenAI is available
        llm_results = await self._extract_via_llm(messages)
        if llm_results:
            for item in llm_results:
                commitments.append(Commitment(
                    conversation_id=conversation_id,
                    owner_name=item.get("owner", "Unknown"),
                    recipient_name=item.get("recipient", "Team"),
                    action_text=item.get("action", ""),
                    deliverable_text=item.get("deliverable", item.get("action", "")),
                    deadline_raw=item.get("deadline_raw", ""),
                    deadline_normalized=datetime.fromisoformat(item["deadline_normalized"]) if item.get("deadline_normalized") else None,
                    confidence=float(item.get("confidence", 0.85)),
                    status=CommitmentStatus.OPEN,
                    source_message_id=item.get("source_message_id", "")
                ))
            return commitments

        # High-precision deterministic fallback rule-set for conversation flow
        return self._extract_deterministic(messages, conversation_id)

    async def _extract_via_llm(self, messages: List[Message]) -> Optional[List[Dict[str, Any]]]:
        prompt = (
            "Analyze the following conversation messages and extract all explicit commitments.\n"
            "Only extract explicit promises ('I will...', 'Yes, I will send it', 'I'll do X by Y').\n"
            "Return a JSON object with key 'commitments' containing an array of objects with keys:\n"
            "  - owner (string, person making the promise)\n"
            "  - recipient (string, person or client receiving the promise)\n"
            "  - action (string, clear description of the promised action)\n"
            "  - deliverable (string, the artifact or output promised, e.g. 'revised quotation', 'updated pricing')\n"
            "  - deadline_raw (string, as mentioned in text)\n"
            "  - deadline_normalized (ISO 8601 string)\n"
            "  - confidence (float between 0.0 and 1.0)\n"
            "  - source_message_id (string ID of message containing promise)\n\n"
            "Messages:\n"
        )
        for m in messages:
            prompt += f"[{m.sent_at.isoformat()}] (ID: {m.id}) {m.sender_name}: {m.text}\n"

        system_prompt = (
            "You are an expert information extraction agent specialized in commitment tracking for PromiseOS. "
            "Respond ONLY with valid JSON."
        )
        res = await llm_service.generate_json(prompt, system_prompt)
        if res and "commitments" in res and isinstance(res["commitments"], list):
            return res["commitments"]
        return None

    def _extract_deterministic(self, messages: List[Message], conversation_id: str) -> List[Commitment]:
        commitments: List[Commitment] = []

        # Analyze context across message sequence
        for i, msg in enumerate(messages):
            text = msg.text.strip()
            sender = msg.sender_name.strip()
            prev_msg = messages[i - 1] if i > 0 else None

            # Pattern 1: Response to a request (e.g. Client: "Can you send the revised quotation by Friday?" -> Harshit: "Yes, I'll send it.")
            if prev_msg and re.search(r"(?:can you|could you|please)\s+(?:send|prepare|share|provide|complete)\s+(.+?)(?:\s+by\s+([a-zA-Z0-9\s]+))?\?", prev_msg.text, re.IGNORECASE):
                req_match = re.search(r"(?:can you|could you|please)\s+(?:send|prepare|share|provide|complete)\s+(.+?)(?:\s+by\s+([a-zA-Z0-9\s]+))?\?", prev_msg.text, re.IGNORECASE)
                deliverable = req_match.group(1).strip()
                raw_deadline = req_match.group(2).strip() if req_match.group(2) else ""

                if re.search(r"^(yes|sure|ok|will do|i will|i'll send|i'll do)", text, re.IGNORECASE):
                    norm_deadline = normalize_relative_deadline(raw_deadline, msg.sent_at)
                    commitments.append(Commitment(
                        conversation_id=conversation_id,
                        owner_name=sender,
                        recipient_name=prev_msg.sender_name,
                        action_text=f"send {deliverable}",
                        deliverable_text=deliverable,
                        deadline_raw=raw_deadline,
                        deadline_normalized=norm_deadline,
                        confidence=0.93,
                        status=CommitmentStatus.OPEN,
                        source_message_id=msg.id
                    ))
                    continue

            # Pattern 2: Direct statement of promise (e.g. "I'll send Harshit the updated pricing tomorrow.")
            direct_promise = re.search(r"(?:i will|i'll)\s+(?:send|share|give|deliver|prepare)\s+([a-zA-Z0-9_\s]+?)\s+(?:the\s+)?(.+?)(?:\s+(tomorrow|today|by\s+[a-zA-Z]+|eod|next\s+week))(?:\.|$)", text, re.IGNORECASE)
            if direct_promise:
                target_recipient = direct_promise.group(1).strip()
                deliverable = direct_promise.group(2).strip()
                raw_deadline = direct_promise.group(3).strip()

                # Clean target recipient if it's "Harshit" or similar
                if target_recipient.lower() in ["the", "a", "an"]:
                    deliverable = f"{target_recipient} {deliverable}"
                    target_recipient = prev_msg.sender_name if prev_msg else "Team"

                norm_deadline = normalize_relative_deadline(raw_deadline, msg.sent_at)
                commitments.append(Commitment(
                    conversation_id=conversation_id,
                    owner_name=sender,
                    recipient_name=target_recipient,
                    action_text=f"send {deliverable}",
                    deliverable_text=deliverable,
                    deadline_raw=raw_deadline,
                    deadline_normalized=norm_deadline,
                    confidence=0.88,
                    status=CommitmentStatus.OPEN,
                    source_message_id=msg.id
                ))
                continue

            # Pattern 3: Standard promise without explicit recipient in sentence (e.g. "I'll finish the pricing by Thursday")
            promise_general = re.search(r"(?:i will|i'll|will do)\s+(?:send|finish|complete|prepare|handle)\s+(?:the\s+)?(.+?)(?:\s+(by\s+[a-zA-Z]+|tomorrow|today|eod))?(?:\.|$)", text, re.IGNORECASE)
            if promise_general:
                deliverable = promise_general.group(1).strip()
                raw_deadline = promise_general.group(2).strip() if promise_general.group(2) else ""
                recipient = prev_msg.sender_name if prev_msg else "Team"
                norm_deadline = normalize_relative_deadline(raw_deadline, msg.sent_at)

                commitments.append(Commitment(
                    conversation_id=conversation_id,
                    owner_name=sender,
                    recipient_name=recipient,
                    action_text=f"deliver {deliverable}",
                    deliverable_text=deliverable,
                    deadline_raw=raw_deadline,
                    deadline_normalized=norm_deadline,
                    confidence=0.82,
                    status=CommitmentStatus.OPEN,
                    source_message_id=msg.id
                ))

        return commitments


extraction_agent = ExtractionAgent()
