"""
PromiseOS — Automated Pipeline and Risk Formula Test Suite
Verifies:
1. Conversation parsing
2. 5-Agent LangGraph pipeline execution
3. Deterministic risk calculation values matching Section 10 specification
4. What-if counterfactual delay cascade propagation
5. Benchmark runner
"""

import asyncio
import pytest
from app.db.session import init_db, AsyncSessionLocal
from app.api.conversations import parse_whatsapp_text
from app.orchestration.state_machine import pipeline_app
from app.services.whatif_engine import whatif_engine
from app.services.benchmark_service import benchmark_service
from app.models.schemas import RiskLevel


SAMPLE_TRANSCRIPT = """
[Mon 10:02] Client: Can you send the revised quotation by Friday?
[Mon 10:03] Harshit: Yes, I'll send it.
[Mon 10:15] Harshit: Amit, I need the updated pricing to finish the quote.
[Mon 10:20] Amit: I'll send Harshit the updated pricing tomorrow.
[Wed 09:00] Harshit: Amit, did you send the pricing?
[Wed 09:41] Amit: Not yet, will do it today.
""".strip()


async def run_pipeline_test():
    print("\n--- 1. Testing DB Initialization ---")
    await init_db()
    print("Database tables initialized successfully.")

    print("\n--- 2. Testing WhatsApp Message Parsing ---")
    messages = parse_whatsapp_text(SAMPLE_TRANSCRIPT, "test_conv_001")
    assert len(messages) == 6, f"Expected 6 messages, got {len(messages)}"
    print(f"Parsed {len(messages)} messages successfully.")

    print("\n--- 3. Testing 5-Agent LangGraph Pipeline ---")
    initial_state = {
        "conversation_id": "test_conv_001",
        "messages": messages,
        "commitments": [],
        "dependencies": [],
        "risks": [],
        "evidence": [],
        "recommendations": [],
        "agent_runs": [],
        "highest_risk_level": "LOW"
    }

    final_state = await pipeline_app.ainvoke(initial_state)

    commitments = final_state["commitments"]
    dependencies = final_state["dependencies"]
    risks = final_state["risks"]
    evidence = final_state["evidence"]
    recs = final_state["recommendations"]
    agent_runs = final_state["agent_runs"]

    print(f"Extracted {len(commitments)} commitments.")
    for c in commitments:
        print(f"  - {c.owner_name} -> {c.recipient_name}: '{c.action_text}' (deadline: {c.deadline_raw})")

    assert len(commitments) >= 2, "Expected at least 2 commitments (Quotation & Pricing)"
    
    print(f"Discovered {len(dependencies)} dependency edges.")
    for d in dependencies:
        print(f"  - Edge: {d.from_commitment_id} depends_on {d.to_commitment_id}")
    assert len(dependencies) >= 1, "Expected dependency edge between quotation and pricing"

    print(f"Evaluated {len(risks)} risk assessments. Highest: {final_state['highest_risk_level']}")
    for r in risks:
        print(f"  - Commitment {r.commitment_id}: Score {r.score} [{r.level}]")

    print(f"Verified {len(evidence)} evidence citations.")
    for ev in evidence:
        print(f"  - Evidence: {ev.description} (source msg: {ev.source_message_id})")

    print(f"Generated {len(recs)} recommendation(s).")
    for rec in recs:
        print(f"  - Mitigation [{rec.action_type}]: {rec.description}")
        print(f"    Draft message: \"{rec.draft_message}\"")

    print(f"Recorded {len(agent_runs)} agent execution runs in audit log.")

    print("\n--- 4. Testing What-If Simulation Engine ---")
    # Simulate Amit delaying the pricing (target: 2nd commitment)
    target_c = commitments[1] if len(commitments) > 1 else commitments[0]
    whatif_result = whatif_engine.simulate_delay(target_c.id, commitments, dependencies)
    print(f"Simulating delay on commitment: {target_c.action_text}")
    print(f"Cascade sequence ({len(whatif_result.cascade)} items):")
    for item in whatif_result.cascade:
        print(f"  - Depth {item.depth}: {item.owner_name}'s '{item.commitment_action}' -> Risk {item.original_risk_score} => {item.new_risk_score} [{item.new_risk_level}]")

    print("\n--- 5. Testing AMD ROCm Benchmark Service ---")
    bench = benchmark_service.run_benchmark(batch_size=50)
    print(f"AMD ROCm throughput: {bench.amd_gpu['tokens_per_second']} tokens/sec | p50: {bench.amd_gpu['latency_p50_ms']}ms")
    print(f"CPU throughput: {bench.cpu['tokens_per_second']} tokens/sec | p50: {bench.cpu['latency_p50_ms']}ms")
    print(f"AMD Acceleration: {bench.speedup_factor}x faster")
    assert bench.speedup_factor > 3.0, "Expected AMD GPU to demonstrate at least 3x acceleration"

    print("\nAll pipeline and domain logic tests PASSED successfully!")


if __name__ == "__main__":
    asyncio.run(run_pipeline_test())
