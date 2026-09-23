"""
PromiseOS — SQLAlchemy ORM Models
Corresponds to Section 7 (Data Model) of the specification.
"""

from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from .session import Base


def generate_uuid():
    return str(uuid.uuid4())


class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, default="Demo User")
    email = Column(String(255), nullable=False, default="user@promiseos.local")
    created_at = Column(DateTime, default=datetime.utcnow)


class ConversationModel(Base):
    __tablename__ = "conversations"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    user_id = Column(String(64), default="default_user")
    source_type = Column(String(50), default="whatsapp")
    title = Column(String(255), default="Untitled Conversation")
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship("MessageModel", back_populates="conversation", cascade="all, delete-orphan")
    commitments = relationship("CommitmentModel", back_populates="conversation", cascade="all, delete-orphan")
    people = relationship("PersonModel", back_populates="conversation", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRunModel", back_populates="conversation", cascade="all, delete-orphan")


class PersonModel(Base):
    __tablename__ = "people"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False)
    conversation_id = Column(String(64), ForeignKey("conversations.id"), nullable=False)

    conversation = relationship("ConversationModel", back_populates="people")


class MessageModel(Base):
    __tablename__ = "messages"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(64), ForeignKey("conversations.id"), nullable=False)
    sender_name = Column(String(255), nullable=False)
    sender_person_id = Column(String(64), nullable=True)
    text = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    raw_index = Column(Integer, default=0)

    conversation = relationship("ConversationModel", back_populates="messages")


class CommitmentModel(Base):
    __tablename__ = "commitments"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(64), ForeignKey("conversations.id"), nullable=False)
    owner_person_id = Column(String(64), nullable=True)
    owner_name = Column(String(255), default="")
    recipient_person_id = Column(String(64), nullable=True)
    recipient_name = Column(String(255), default="")
    action_text = Column(Text, nullable=False)
    deliverable_text = Column(Text, default="")
    deadline_raw = Column(String(255), default="")
    deadline_normalized = Column(DateTime, nullable=True)
    confidence = Column(Float, default=0.0)
    status = Column(String(50), default="open")  # open, completed, overdue, at_risk
    source_message_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("ConversationModel", back_populates="commitments")
    risk_assessment = relationship("RiskAssessmentModel", back_populates="commitment", uselist=False, cascade="all, delete-orphan")


class DependencyModel(Base):
    __tablename__ = "dependencies"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    from_commitment_id = Column(String(64), ForeignKey("commitments.id"), nullable=False)
    to_commitment_id = Column(String(64), ForeignKey("commitments.id"), nullable=False)
    edge_type = Column(String(50), default="depends_on")  # depends_on, blocks, fulfills
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class RiskAssessmentModel(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    commitment_id = Column(String(64), ForeignKey("commitments.id"), nullable=False)
    score = Column(Float, default=0.0)
    level = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH
    factors_json = Column(JSON, default=list)
    computed_at = Column(DateTime, default=datetime.utcnow)

    commitment = relationship("CommitmentModel", back_populates="risk_assessment")
    evidence_items = relationship("EvidenceModel", back_populates="risk_assessment", cascade="all, delete-orphan")
    recommendation = relationship("RecommendationModel", back_populates="risk_assessment", uselist=False, cascade="all, delete-orphan")


class EvidenceModel(Base):
    __tablename__ = "evidence"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    risk_assessment_id = Column(String(64), ForeignKey("risk_assessments.id"), nullable=False)
    description = Column(Text, nullable=False)
    source_message_id = Column(String(64), nullable=True)
    source_commitment_id = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    risk_assessment = relationship("RiskAssessmentModel", back_populates="evidence_items")


class RecommendationModel(Base):
    __tablename__ = "recommendations"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    risk_assessment_id = Column(String(64), ForeignKey("risk_assessments.id"), nullable=False)
    action_type = Column(String(50), default="follow_up")
    description = Column(Text, nullable=False)
    target_person_id = Column(String(64), nullable=True)
    target_person_name = Column(String(255), default="")
    draft_message = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    risk_assessment = relationship("RiskAssessmentModel", back_populates="recommendation")
    approvals = relationship("ApprovalModel", back_populates="recommendation", cascade="all, delete-orphan")


class ApprovalModel(Base):
    __tablename__ = "approvals"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    recommendation_id = Column(String(64), ForeignKey("recommendations.id"), nullable=False)
    user_id = Column(String(64), default="default_user")
    status = Column(String(50), default="pending")  # pending, approved, dismissed
    decided_at = Column(DateTime, nullable=True)

    recommendation = relationship("RecommendationModel", back_populates="approvals")


class AgentRunModel(Base):
    __tablename__ = "agent_runs"

    id = Column(String(64), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(64), ForeignKey("conversations.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    input_json = Column(JSON, default=dict)
    output_json = Column(JSON, default=dict)
    status = Column(String(50), default="completed")  # running, completed, failed
    started_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("ConversationModel", back_populates="agent_runs")
