"""
PromiseOS — Pydantic Models / Schemas
All data types for the system: messages, commitments, dependencies, risk, evidence, recommendations.
"""

from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum
import uuid


# ─── Enums ────────────────────────────────────────────────────────────────────

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class CommitmentStatus(str, Enum):
    OPEN = "open"
    COMPLETED = "completed"
    OVERDUE = "overdue"
    AT_RISK = "at_risk"


class EdgeType(str, Enum):
    DEPENDS_ON = "depends_on"
    BLOCKS = "blocks"
    FULFILLS = "fulfills"


class ActionType(str, Enum):
    FOLLOW_UP = "follow_up"
    RENEGOTIATE_DEADLINE = "renegotiate_deadline"
    DELEGATE = "delegate"
    ESCALATE = "escalate"


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DISMISSED = "dismissed"


class AgentRunStatus(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


# ─── Core Data Models ────────────────────────────────────────────────────────

class Person(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    normalized_name: str
    conversation_id: str


class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str = ""
    sender_name: str
    sender_person_id: Optional[str] = None
    text: str
    sent_at: datetime
    raw_index: int


class Commitment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str = ""
    owner_person_id: str = ""
    owner_name: str = ""
    recipient_person_id: str = ""
    recipient_name: str = ""
    action_text: str
    deliverable_text: str = ""
    deadline_raw: str = ""
    deadline_normalized: Optional[datetime] = None
    confidence: float = 0.0
    status: CommitmentStatus = CommitmentStatus.OPEN
    source_message_id: str = ""
    created_at: datetime = Field(default_factory=datetime.now)


class DependencyEdge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_commitment_id: str  # the commitment that depends on something
    to_commitment_id: str    # the commitment it depends on
    edge_type: EdgeType = EdgeType.DEPENDS_ON
    confidence: float = 0.0
    created_at: datetime = Field(default_factory=datetime.now)


class RiskFactor(BaseModel):
    name: str
    value: float
    weight: float
    description: str = ""


class RiskAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    commitment_id: str
    score: float
    level: RiskLevel
    factors: List[RiskFactor] = []
    computed_at: datetime = Field(default_factory=datetime.now)


class Evidence(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    risk_assessment_id: str
    description: str
    source_message_id: Optional[str] = None
    source_commitment_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)


class Recommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    risk_assessment_id: str
    action_type: ActionType
    description: str
    target_person_id: str = ""
    target_person_name: str = ""
    draft_message: str = ""
    created_at: datetime = Field(default_factory=datetime.now)


class Approval(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    recommendation_id: str
    user_id: str = "default_user"
    status: ApprovalStatus = ApprovalStatus.PENDING
    decided_at: Optional[datetime] = None


class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "default_user"
    source_type: str = "whatsapp"
    title: str = ""
    uploaded_at: datetime = Field(default_factory=datetime.now)


class AgentRun(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    agent_name: str
    input_summary: str = ""
    output_summary: str = ""
    status: AgentRunStatus = AgentRunStatus.RUNNING
    started_at: datetime = Field(default_factory=datetime.now)
    finished_at: Optional[datetime] = None


# ─── API Request / Response Models ───────────────────────────────────────────

class CreateConversationRequest(BaseModel):
    title: str = ""
    source_type: str = "whatsapp"


class IngestRequest(BaseModel):
    conversation_id: str
    raw_text: str


class IngestResponse(BaseModel):
    status: str
    conversation_id: str
    agent_run_id: str = ""


class WhatIfRequest(BaseModel):
    commitment_id: str
    scenario: str = "delayed"


class CascadeItem(BaseModel):
    commitment_id: str
    commitment_action: str = ""
    owner_name: str = ""
    original_risk_score: float = 0.0
    original_risk_level: RiskLevel = RiskLevel.LOW
    new_risk_score: float = 0.0
    new_risk_level: RiskLevel = RiskLevel.HIGH
    depth: int = 0


class WhatIfResponse(BaseModel):
    source_commitment_id: str
    cascade: List[CascadeItem] = []
    recommendation: Optional[Recommendation] = None


class ApproveRequest(BaseModel):
    user_id: str = "default_user"


class GraphNode(BaseModel):
    id: str
    type: str  # "person" or "commitment"
    label: str
    owner: str = ""
    recipient: str = ""
    deadline: str = ""
    risk_level: str = ""
    risk_score: float = 0.0
    status: str = ""
    confidence: float = 0.0


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    edge_type: str = ""
    label: str = ""
    animated: bool = False


class GraphResponse(BaseModel):
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []


class PipelineStatus(BaseModel):
    conversation_id: str
    status: str  # "processing", "completed", "failed"
    stage: str = ""  # current agent stage
    commitments_count: int = 0
    dependencies_count: int = 0
    risks_count: int = 0
    agent_runs: List[AgentRun] = []
