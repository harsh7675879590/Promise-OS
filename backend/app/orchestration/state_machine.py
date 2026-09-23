"""
PromiseOS — LangGraph Orchestration State Machine
Implements Section 6: Conditional StateGraph executing:
Extract -> Resolve -> Risk -> (if HIGH/MEDIUM) -> Investigate -> Recommend -> END.
"""

from typing import Dict, Any, List, TypedDict, Optional
from langgraph.graph import StateGraph, END
from ..models.schemas import (
    Message, Commitment, DependencyEdge, RiskAssessment, Evidence, Recommendation, RiskLevel, AgentRun, AgentRunStatus
)
from ..agents.extraction_agent import extraction_agent
from ..agents.resolution_agent import resolution_agent
from ..agents.risk_agent import risk_agent
from ..agents.evidence_agent import evidence_agent
from ..agents.recommendation_agent import recommendation_agent
from datetime import datetime


class PipelineState(TypedDict):
    conversation_id: str
    messages: List[Message]
    commitments: List[Commitment]
    dependencies: List[DependencyEdge]
    risks: List[RiskAssessment]
    evidence: List[Evidence]
    recommendations: List[Recommendation]
    agent_runs: List[AgentRun]
    highest_risk_level: str


# Node 1: Extract Commitments
async def node_extract_commitments(state: PipelineState) -> Dict[str, Any]:
    run = AgentRun(
        conversation_id=state["conversation_id"],
        agent_name="ExtractionAgent",
        input_summary=f"Parsing {len(state['messages'])} conversation messages",
        started_at=datetime.utcnow()
    )
    commitments = await extraction_agent.run(state["messages"], state["conversation_id"])
    run.output_summary = f"Extracted {len(commitments)} structured commitments"
    run.status = AgentRunStatus.COMPLETED
    run.finished_at = datetime.utcnow()

    return {
        "commitments": commitments,
        "agent_runs": state["agent_runs"] + [run]
    }


# Node 2: Resolve Dependencies
async def node_resolve_dependencies(state: PipelineState) -> Dict[str, Any]:
    run = AgentRun(
        conversation_id=state["conversation_id"],
        agent_name="ResolutionAgent",
        input_summary=f"Evaluating cross-dependencies for {len(state['commitments'])} commitments",
        started_at=datetime.utcnow()
    )
    dependencies = await resolution_agent.run(state["commitments"], state["messages"])
    run.output_summary = f"Discovered {len(dependencies)} dependency edge(s)"
    run.status = AgentRunStatus.COMPLETED
    run.finished_at = datetime.utcnow()

    return {
        "dependencies": dependencies,
        "agent_runs": state["agent_runs"] + [run]
    }


# Node 3: Compute Risk (Deterministic)
async def node_compute_risk(state: PipelineState) -> Dict[str, Any]:
    run = AgentRun(
        conversation_id=state["conversation_id"],
        agent_name="RiskAgent",
        input_summary=f"Calculating deterministic risk scores across graph adjacency",
        started_at=datetime.utcnow()
    )
    risks = risk_agent.compute_all(state["commitments"], state["dependencies"])
    
    highest_level = "LOW"
    for r in risks:
        if r.level == RiskLevel.HIGH:
            highest_level = "HIGH"
            break
        elif r.level == RiskLevel.MEDIUM and highest_level != "HIGH":
            highest_level = "MEDIUM"

    run.output_summary = f"Evaluated {len(risks)} commitments; highest risk level: {highest_level}"
    run.status = AgentRunStatus.COMPLETED
    run.finished_at = datetime.utcnow()

    return {
        "risks": risks,
        "highest_risk_level": highest_level,
        "agent_runs": state["agent_runs"] + [run]
    }


# Conditional Edge routing
def route_after_risk(state: PipelineState) -> str:
    """Branches conditionally: only investigate & recommend if risk is elevated."""
    if state["highest_risk_level"] in ["HIGH", "MEDIUM"]:
        return "investigate_evidence"
    return END


# Node 4: Investigate Evidence
async def node_investigate_evidence(state: PipelineState) -> Dict[str, Any]:
    run = AgentRun(
        conversation_id=state["conversation_id"],
        agent_name="EvidenceAgent",
        input_summary=f"Gathering verifiable citations for at-risk commitments",
        started_at=datetime.utcnow()
    )
    all_commitments = {c.id: c for c in state["commitments"]}
    all_evidence: List[Evidence] = []

    for r in state["risks"]:
        if r.level in [RiskLevel.HIGH, RiskLevel.MEDIUM]:
            c = all_commitments.get(r.commitment_id)
            if c:
                items = await evidence_agent.run(
                    assessment=r,
                    commitment=c,
                    all_commitments=all_commitments,
                    messages=state["messages"],
                    dependencies=state["dependencies"]
                )
                all_evidence.extend(items)

    run.output_summary = f"Synthesized and verified {len(all_evidence)} evidence citation(s)"
    run.status = AgentRunStatus.COMPLETED
    run.finished_at = datetime.utcnow()

    return {
        "evidence": all_evidence,
        "agent_runs": state["agent_runs"] + [run]
    }


# Node 5: Generate Recommendation
async def node_generate_recommendation(state: PipelineState) -> Dict[str, Any]:
    run = AgentRun(
        conversation_id=state["conversation_id"],
        agent_name="RecommendationAgent",
        input_summary=f"Formulating human-approved mitigations for at-risk deliverables",
        started_at=datetime.utcnow()
    )
    all_commitments = {c.id: c for c in state["commitments"]}
    recommendations: List[Recommendation] = []

    for r in state["risks"]:
        if r.level in [RiskLevel.HIGH, RiskLevel.MEDIUM]:
            c = all_commitments.get(r.commitment_id)
            if c:
                rec = await recommendation_agent.run(
                    assessment=r,
                    commitment=c,
                    evidence=state["evidence"],
                    all_commitments=all_commitments
                )
                if rec:
                    recommendations.append(rec)

    run.output_summary = f"Prepared {len(recommendations)} mitigation draft(s) awaiting approval"
    run.status = AgentRunStatus.COMPLETED
    run.finished_at = datetime.utcnow()

    return {
        "recommendations": recommendations,
        "agent_runs": state["agent_runs"] + [run]
    }


# Compile LangGraph Workflow
def build_promiseos_pipeline():
    workflow = StateGraph(PipelineState)

    workflow.add_node("extract_commitments", node_extract_commitments)
    workflow.add_node("resolve_dependencies", node_resolve_dependencies)
    workflow.add_node("compute_risk", node_compute_risk)
    workflow.add_node("investigate_evidence", node_investigate_evidence)
    workflow.add_node("generate_recommendation", node_generate_recommendation)

    workflow.set_entry_point("extract_commitments")
    workflow.add_edge("extract_commitments", "resolve_dependencies")
    workflow.add_edge("resolve_dependencies", "compute_risk")

    # Conditional Branching
    workflow.add_conditional_edges(
        "compute_risk",
        route_after_risk,
        {
            "investigate_evidence": "investigate_evidence",
            END: END
        }
    )

    workflow.add_edge("investigate_evidence", "generate_recommendation")
    workflow.add_edge("generate_recommendation", END)

    return workflow.compile()


pipeline_app = build_promiseos_pipeline()
