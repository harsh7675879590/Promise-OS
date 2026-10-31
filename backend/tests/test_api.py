"""
PromiseOS — API Integration Test Suite
Tests FastAPI endpoints:
- POST /conversations
- POST /ingest
- GET /commitments
- GET /graph/{id}
- GET /risks
- POST /what-if
- POST /recommendations/{id}/approve
- GET /benchmark and POST /benchmark/run
"""

import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import init_db


SAMPLE_TRANSCRIPT = """
[Mon 10:02] Client: Can you send the revised quotation by Friday?
[Mon 10:03] Harshit: Yes, I'll send it.
[Mon 10:15] Harshit: Amit, I need the updated pricing to finish the quote.
[Mon 10:20] Amit: I'll send Harshit the updated pricing tomorrow.
[Wed 09:00] Harshit: Amit, did you send the pricing?
[Wed 09:41] Amit: Not yet, will do it today.
""".strip()


@pytest.mark.anyio
async def test_api_integration():
    await run_api_tests()


async def run_api_tests():
    await init_db()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health
        res = await client.get("/health")
        assert res.status_code == 200
        print("GET /health => 200 OK")

        # 2. Create conversation
        res = await client.post("/conversations", json={"title": "Client-Harshit-Amit Quotation Thread"})
        assert res.status_code == 200
        conv_id = res.json()["conversation_id"]
        print(f"POST /conversations => 200 OK (conv_id: {conv_id})")

        # 3. Ingest
        res = await client.post("/ingest", json={"conversation_id": conv_id, "raw_text": SAMPLE_TRANSCRIPT})
        assert res.status_code == 200
        ingest_data = res.json()
        print(f"POST /ingest => 200 OK: {ingest_data}")
        assert ingest_data["commitments_extracted"] >= 2
        assert ingest_data["dependencies_found"] >= 1

        # 4. Get commitments
        res = await client.get(f"/commitments?conversation_id={conv_id}")
        assert res.status_code == 200
        commitments = res.json()
        print(f"GET /commitments => 200 OK (returned {len(commitments)} commitments)")
        assert len(commitments) >= 2

        # 5. Get graph
        res = await client.get(f"/graph/{conv_id}")
        assert res.status_code == 200
        graph = res.json()
        print(f"GET /graph => 200 OK ({len(graph['nodes'])} nodes, {len(graph['edges'])} edges)")
        assert len(graph["nodes"]) > 0
        assert len(graph["edges"]) > 0

        # 6. Get risks
        res = await client.get(f"/risks?conversation_id={conv_id}&min_level=MEDIUM")
        assert res.status_code == 200
        risks = res.json()
        print(f"GET /risks => 200 OK (returned {len(risks)} at-risk items)")
        assert len(risks) >= 1
        rec_id = risks[0]["recommendation"]["id"] if risks[0]["recommendation"] else None

        # 7. What-if simulation
        target_c_id = commitments[1]["id"]  # Amit's pricing
        res = await client.post("/what-if", json={"commitment_id": target_c_id, "scenario": "delayed"})
        assert res.status_code == 200
        whatif = res.json()
        print(f"POST /what-if => 200 OK (cascade length: {len(whatif['cascade'])})")
        assert len(whatif["cascade"]) >= 2

        # 8. Human approval
        if rec_id:
            res = await client.post(f"/recommendations/{rec_id}/approve", json={"user_id": "harshit_lead"})
            assert res.status_code == 200
            print(f"POST /recommendations/{rec_id}/approve => 200 OK: {res.json()['status']}")

        # 9. Benchmark
        res = await client.get("/benchmark")
        assert res.status_code == 200
        print(f"GET /benchmark => 200 OK: Speedup {res.json()['speedup_factor']}x")

        res = await client.post("/benchmark/run?batch_size=25")
        assert res.status_code == 200
        print(f"POST /benchmark/run => 200 OK: Speedup {res.json()['speedup_factor']}x")

        # 10. Agent Evaluation Metrics
        res = await client.get("/evaluation")
        assert res.status_code == 200
        eval_data = res.json()
        print(f"GET /evaluation => 200 OK: Extraction F1 {eval_data['extraction_metrics']['f1_score']}, Faithfulness {eval_data['evidence_groundedness']['faithfulness_score']}")
        assert eval_data["extraction_metrics"]["f1_score"] > 0.8
        assert eval_data["evidence_groundedness"]["faithfulness_score"] > 0.9

        # 11. Historical RAG Store Profiles
        res = await client.get("/rag/profiles")
        assert res.status_code == 200
        rag_profiles = res.json()
        print(f"GET /rag/profiles => 200 OK (returned {len(rag_profiles)} participant profiles)")
        assert len(rag_profiles) >= 2

    print("\nAll API integration tests PASSED!")


if __name__ == "__main__":
    asyncio.run(run_api_tests())
