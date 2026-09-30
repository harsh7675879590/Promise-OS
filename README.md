<p align="center">
  <strong>PromiseOS</strong><br/>
  <em>The graph that knows whose promise is about to break yours.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Lablab.ai_%C3%97_AMD-AI_Academy_Challenge-ed1c24?style=flat-square" alt="AMD Challenge" />
  <img src="https://img.shields.io/badge/FastAPI-0.115.0-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/LangGraph-0.2+-4B275F?style=flat-square" alt="LangGraph" />
  <img src="https://img.shields.io/badge/ROCm-HIP%20%2F%20vLLM-ed1c24?style=flat-square" alt="ROCm" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [What Is PromiseOS?](#what-is-promiseos)
3. [Key Features](#key-features)
4. [Architecture Overview](#architecture-overview)
5. [Technology Stack](#technology-stack)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Usage Walkthrough](#usage-walkthrough)
9. [API Reference](#api-reference)
10. [Agent Pipeline (LangGraph)](#agent-pipeline-langgraph)
11. [AMD ROCm Acceleration](#amd-rocm-acceleration)
12. [Design Philosophy](#design-philosophy)
13. [Roadmap](#roadmap)
14. [Contributing](#contributing)
15. [License](#license)

---

## Problem Statement

Commitments get made in the flow of conversation — WhatsApp messages, emails, meeting threads — and **never become structured, trackable work**. Worse, commitments **chain across people**: Person A's promise silently depends on Person B's unfinished promise, and nobody sees the chain until a deadline is already missed.

**Current approaches fail because:**

| Approach | Why It Falls Short |
|---|---|
| Mental tracking | Doesn't scale past 3-4 open items; no visibility for the team. |
| Re-reading chat threads | Time-consuming; easy to miss implicit promises or dependencies. |
| Project management tools (Jira, Asana) | Require manual translation from conversation → ticket. That step is skipped. |
| Meeting-note AI (Otter, Fireflies) | Extract per-person action items but **stop there** — no cross-person dependency chains, no risk scoring, no cascade simulation. |

**Target users:** Small teams and client-facing professionals (agencies, consultants, freelancers, small business ops) who coordinate mostly through chat and email rather than formal PM tools.

---

## What Is PromiseOS?

PromiseOS is an **autonomous commitment graph and risk cascade engine** that:

1. **Ingests** raw conversation transcripts (WhatsApp, email, meeting notes).
2. **Extracts** structured commitments using a multi-agent LLM pipeline.
3. **Resolves** ambiguous entities, deadlines, and cross-person references.
4. **Builds a dependency graph** — who can't deliver until someone else finishes first.
5. **Scores risk deterministically** using a weighted formula (not LLM vibes).
6. **Simulates "What-If" cascades** — if Amit is 2 days late, what breaks downstream?
7. **Generates human-in-the-loop mitigations** — draft follow-up messages for human approval.
8. **Benchmarks AMD ROCm vs CPU** for LLM inference throughput.

> **Core principle:** The system _recommends_, but a human must _approve_ every action. No autonomous dispatch. No AI sending messages on your behalf.

---

## Key Features

### 🔗 Commitment Extraction & Resolution
- Multi-agent LangGraph pipeline: **Extraction → Resolution → Risk → Evidence → Recommendation**
- Handles implicit commitments ("I'll send it") and explicit ones ("By Friday")
- Entity coreference resolution across messages

### 🕸️ Dependency Graph
- Interactive directed graph (React Flow) mapping cross-person dependencies
- Visual risk coloring: High (red), Medium (amber), Low (green)
- Click-to-inspect nodes with full evidence citations

### ⚠️ Deterministic Risk Scoring
- **Formula:** `0.40 × Urgency + 0.35 × Impact + 0.15 × Historical Reliability + 0.10 × Load`
- Not an LLM opinion — a reproducible, auditable score
- Factor decomposition visible per-commitment

### 🔮 What-If Counterfactual Simulator
- Non-destructive cascade simulation across the dependency graph
- "If this commitment slips 2 days, what else breaks?"
- Downstream risk propagation with delta tracking

### 🛡️ Human-in-the-Loop Approval Gate
- Every AI-generated mitigation requires explicit human approval
- Draft messages can be reviewed, edited, and copied — never auto-sent
- Full audit trail of approvals and dismissals

### 🚀 AMD ROCm Benchmark
- Side-by-side comparison: AMD GPU (ROCm/HIP/vLLM) vs CPU inference
- Metrics: tokens/sec, p50 latency, p95 latency, batch elapsed time, memory
- Live benchmark execution with configurable batch sizes

### 🔍 Anti-Hallucination Evidence Layer
- Every extracted commitment is anchored to a source message ID
- Evidence citations link each claim back to the original conversation text
- Observable, verifiable — not fabricated

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PromiseOS                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   React 19 Frontend                      │   │
│  │  Dashboard │ Commitments │ Graph │ Risks │ What-If │ AMD │   │
│  │                    (Vite 8 / Lucide / React Flow)        │   │
│  └────────────────────────┬─────────────────────────────────┘   │
│                           │ REST API (JSON)                     │
│  ┌────────────────────────▼─────────────────────────────────┐   │
│  │                  FastAPI Backend                          │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │              LangGraph State Machine                │  │   │
│  │  │                                                     │  │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │  │   │
│  │  │  │Extraction│→│Resolution│→│   Risk   │         │  │   │
│  │  │  │  Agent   │  │  Agent   │  │  Agent   │         │  │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘         │  │   │
│  │  │       │                            │               │  │   │
│  │  │       ▼                            ▼               │  │   │
│  │  │  ┌──────────┐              ┌──────────────┐       │  │   │
│  │  │  │ Evidence │              │Recommendation│       │  │   │
│  │  │  │  Agent   │              │    Agent      │       │  │   │
│  │  │  └──────────┘              └──────────────┘       │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  ┌───────────────┐  ┌──────────────┐  ┌───────────────┐  │   │
│  │  │ SQLite (async) │  │ What-If Sim  │  │ ROCm Bench   │  │   │
│  │  │  aiosqlite     │  │  Engine      │  │  Harness     │  │   │
│  │  └───────────────┘  └──────────────┘  └───────────────┘  │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │           AMD ROCm Runtime (Optional GPU Layer)           │   │
│  │           vLLM + HIP for Llama 3.1 8B-Instruct           │   │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
| Component | Technology | Purpose |
|---|---|---|
| Web Framework | **FastAPI 0.115** | Async REST API with auto-generated OpenAPI docs |
| Orchestration | **LangGraph ≥0.2** | Multi-agent DAG state machine for pipeline control |
| LLM Framework | **LangChain Core ≥0.3** | Agent prompt engineering and chain composition |
| Database | **SQLAlchemy 2 + aiosqlite** | Async SQLite for zero-config persistence |
| Validation | **Pydantic 2.9** | Request/response schema enforcement |
| HTTP Client | **httpx 0.27** | Async HTTP for external LLM API calls |
| Server | **Uvicorn 0.30** | ASGI production server with hot reload |

### Frontend
| Component | Technology | Purpose |
|---|---|---|
| UI Framework | **React 19** | Component-based reactive UI |
| Build Tool | **Vite 8** | Sub-second HMR, ES module bundling |
| Graph Rendering | **@xyflow/react 12** | Interactive directed dependency graph |
| Icons | **Lucide React** | Consistent, tree-shakeable icon set |
| Styling | **Vanilla CSS** | Custom enterprise design system, zero framework bloat |

### AMD ROCm (Challenge Integration)
| Component | Technology | Purpose |
|---|---|---|
| GPU Runtime | **ROCm / HIP** | AMD GPU compute kernel execution |
| LLM Serving | **vLLM (ROCm fork)** | High-throughput batched LLM inference |
| Model | **Llama 3.1 8B-Instruct** | Commitment extraction and recommendation generation |

---

## Project Structure

```
Promise OS/
├── backend/
│   ├── app/
│   │   ├── agents/                    # LangGraph agent implementations
│   │   │   ├── extraction_agent.py    # Parses raw text → structured commitments
│   │   │   ├── resolution_agent.py    # Entity resolution & deadline normalization
│   │   │   ├── risk_agent.py          # Deterministic risk scoring (Section 10 formula)
│   │   │   ├── evidence_agent.py      # Anti-hallucination citation anchoring
│   │   │   └── recommendation_agent.py # Mitigation synthesis & draft messages
│   │   ├── api/                       # FastAPI route handlers
│   │   │   ├── conversations.py       # CRUD + ingest pipeline trigger
│   │   │   ├── commitments.py         # Commitment listing & detail retrieval
│   │   │   ├── graph.py               # Dependency graph generation
│   │   │   ├── risks.py               # Risk register queries
│   │   │   ├── whatif.py              # Counterfactual cascade simulation
│   │   │   ├── approvals.py           # Human approval gate endpoints
│   │   │   └── benchmark.py           # AMD ROCm vs CPU benchmark harness
│   │   ├── db/                        # Database session & schema
│   │   ├── models/                    # Pydantic & SQLAlchemy models
│   │   ├── orchestration/
│   │   │   └── state_machine.py       # LangGraph DAG wiring
│   │   ├── services/                  # Business logic services
│   │   └── main.py                    # FastAPI app entry point
│   ├── tests/                         # Backend test suite
│   └── requirements.txt               # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js              # API client (auto-resolves backend host)
│   │   ├── components/
│   │   │   ├── Navbar.jsx             # Top navigation with system status
│   │   │   ├── DependencyGraph.jsx    # React Flow graph with custom nodes
│   │   │   ├── IngestModal.jsx        # Transcript import dialog
│   │   │   ├── EvidenceDrawer.jsx     # Evidence citation side panel
│   │   │   └── ApprovalModal.jsx      # Human-in-the-loop approval dialog
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Overview: metrics, commitments, risks
│   │   │   ├── CommitmentsView.jsx    # Filterable commitment register
│   │   │   ├── GraphView.jsx          # Dependency topology visualization
│   │   │   ├── RiskCenter.jsx         # Risk intelligence with factor breakdown
│   │   │   ├── WhatIfSimulator.jsx    # Counterfactual cascade simulation
│   │   │   └── BenchmarkView.jsx      # AMD ROCm vs CPU performance suite
│   │   ├── App.jsx                    # Root component & state management
│   │   ├── main.jsx                   # Entry point with error boundary
│   │   ├── index.css                  # Enterprise design system
│   │   └── App.css                    # Legacy Vite scaffold styles
│   └── package.json                   # Node.js dependencies
├── docs/
│   └── demo_conversation.txt          # Sample WhatsApp transcript
├── start.bat                          # One-click launcher (Windows)
├── run_backend.py                     # Alternative backend launcher
└── README.md                          # ← You are here
```

---

## Getting Started

### Prerequisites

- **Python 3.10+** (tested with 3.11, 3.12)
- **Node.js 18+** (tested with 20, 22)
- **npm** (comes with Node.js)
- **(Optional)** AMD GPU with ROCm 6.x for hardware-accelerated inference

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/promise-os.git
cd promise-os
```

#### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

#### 4. Environment Configuration (Optional)

Create a `.env` file in the `backend/` directory if using an external LLM API:

```env
# LLM API Configuration
LLM_API_URL=http://localhost:11434/v1     # Ollama, vLLM, or compatible endpoint
LLM_MODEL_NAME=llama3.1:8b-instruct       # Model identifier

# ROCm GPU (auto-detected if available)
ROCM_DEVICE=0                              # GPU device index
```

### Running the Application

#### Option A: One-Click Launch (Windows)

```bash
# From the project root
start.bat
```

This launches both the backend (port 8000) and frontend (port 5173) in separate terminal windows.

#### Option B: Manual Launch

**Terminal 1 — Backend:**
```bash
cd backend
set PYTHONPATH=.       # Windows
# export PYTHONPATH=.  # macOS/Linux
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

#### 5. Open the Application

Navigate to **http://localhost:5173** in your browser.

The frontend auto-detects the backend URL based on the browser's hostname, so it works on `localhost`, `127.0.0.1`, and LAN IP addresses without configuration.

---

## Usage Walkthrough

### Step 1: Import a Conversation

1. Click **"Import Transcript"** in the top navigation bar.
2. The demo scenario is pre-loaded: a WhatsApp thread where a client requests a quotation, which depends on a pricing update from another team member.
3. Click **"Run Pipeline"** to trigger the 5-agent extraction pipeline.

### Step 2: Explore the Dependency Graph

After ingestion, you're taken to the **Dependency Graph** tab:
- Nodes represent commitments (structured cards with owner, recipient, deadline, risk level).
- Edges represent dependency relationships ("A can't deliver until B finishes").
- Click any node to open the **Evidence Drawer** with citation details.

### Step 3: Review the Risk Register

Switch to the **Risk Center** tab:
- Each risk is scored using the deterministic formula with full factor decomposition.
- High-risk items display the weighted contribution of each factor (Urgency, Impact, Reliability, Load).
- Each risk card includes a **"Simulate Delay"** button for What-If analysis.

### Step 4: Run a What-If Simulation

In the **What-If Simulator** tab:
1. Select a commitment as the "delay trigger."
2. Choose a hypothetical slippage duration (+1, +2, or +5 days).
3. Click **"Execute Simulation"** to see downstream cascade propagation.
4. The system shows each affected commitment with before/after risk scores and deltas.

### Step 5: Approve or Dismiss Mitigations

When the system generates a remediation recommendation:
1. Review the draft follow-up message.
2. Click **"Approve & Copy Draft"** to confirm and copy to clipboard.
3. Or click **"Dismiss Recommendation"** if the mitigation isn't needed.

> All approvals and dismissals are recorded in the audit trail.

### Step 6: Run AMD ROCm Benchmark

Switch to the **AMD ROCm Benchmark** tab:
- View baseline performance comparison between AMD GPU and CPU inference.
- Configure batch size (10, 50, 100, 200 prompts).
- Click **"Run Live Benchmark"** to execute a real-time performance test.

---

## API Reference

All endpoints are served from `http://localhost:8000`. Full interactive documentation is available at `/docs` (Swagger UI).

### Health & Status

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Returns `{"status": "healthy"}` |
| `GET` | `/` | App metadata and docs URL |

### Conversations

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/conversations` | List all imported conversation threads |
| `POST` | `/conversations` | Create a new conversation container |

### Ingestion Pipeline

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ingest` | Ingest raw text → triggers full 5-agent LangGraph pipeline |

**Request Body:**
```json
{
  "conversation_id": "uuid",
  "raw_text": "[Mon 10:02] Client: Can you send the revised quotation by Friday?..."
}
```

### Commitments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/commitments?conversation_id=<id>` | List commitments for a conversation |
| `GET` | `/commitments/<id>` | Get commitment detail with evidence and risk assessment |

### Dependency Graph

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/graph/<conversation_id>` | Get React Flow-compatible nodes and edges |

### Risk Intelligence

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/risks?conversation_id=<id>` | List risk assessments, sorted by score |

### What-If Simulation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/what-if` | Execute counterfactual cascade simulation |

**Request Body:**
```json
{
  "commitment_id": "uuid",
  "scenario": "delayed"
}
```

### Human Approval

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/recommendations/<id>/approve` | Approve a mitigation recommendation |
| `POST` | `/recommendations/<id>/dismiss` | Dismiss a mitigation recommendation |

### AMD ROCm Benchmark

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/benchmark` | Get baseline benchmark results |
| `POST` | `/benchmark/run?batch_size=50` | Execute live benchmark with configurable batch size |

---

## Agent Pipeline (LangGraph)

PromiseOS uses a **5-agent LangGraph DAG** (Directed Acyclic Graph) state machine to process each conversation:

```
                    ┌─────────────────┐
                    │  Raw Transcript  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ 1. EXTRACTION   │  Parse messages → structured commitments
                    │    Agent        │  (owner, recipient, action, deadline)
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ 2. RESOLUTION   │  Entity normalization, deadline parsing,
                    │    Agent        │  dependency edge detection
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ 3. RISK         │  Deterministic score: 0.40×U + 0.35×I
                    │    Agent        │  + 0.15×R + 0.10×L
                    └────────┬────────┘
                             │
               ┌─────────────┼─────────────┐
               │                           │
      ┌────────▼────────┐        ┌────────▼────────┐
      │ 4. EVIDENCE     │        │ 5. RECOMMEND    │
      │    Agent        │        │    Agent        │
      │ (Anti-halluc.)  │        │ (Mitigations)   │
      └─────────────────┘        └─────────────────┘
```

### Agent Details

| # | Agent | Input | Output | Key Logic |
|---|---|---|---|---|
| 1 | **Extraction** | Raw message text | Structured commitments (JSON) | LLM-powered NLP parsing with few-shot prompting |
| 2 | **Resolution** | Raw commitments | Resolved commitments + dependency edges | Entity coreference, temporal normalization |
| 3 | **Risk** | Resolved commitments | Risk scores per commitment | Deterministic weighted formula (no LLM) |
| 4 | **Evidence** | Commitments + source messages | Citation links | Maps each commitment back to source message IDs |
| 5 | **Recommendation** | High-risk commitments | Draft follow-up messages | LLM-generated mitigations requiring human approval |

---

## AMD ROCm Acceleration

### Challenge Context

PromiseOS is built for the **Lablab.ai × AMD AI Academy Challenge**, demonstrating how AMD ROCm hardware acceleration transforms LLM-powered commitment analysis from batch-only to real-time interactive.

### Where ROCm Matters

| Pipeline Stage | CPU Baseline | AMD GPU (ROCm) | Impact |
|---|---|---|---|
| Commitment Extraction | ~20 tok/s | ~115 tok/s | **5.6x** faster parsing |
| What-If Cascade Recomputation | ~640ms p50 | ~89ms p50 | **Real-time** interactive simulation |
| Recommendation Generation | Batch-only viable | Sub-100ms | **Interactive** mitigation drafting |
| Batch Processing (50 prompts) | ~27s | ~1.6s | **17x** batch speedup |

### Technical Integration

```
User Action                  Without ROCm             With ROCm
─────────────────────────────────────────────────────────────────
Paste transcript             Wait 30s+ for pipeline   ~2s total pipeline
Click "Simulate Delay"       Spinner for 5-10s        Instant cascade result
Review 50 commitments        Sequential, slow         Batched, parallel
Run live benchmark           CPU-only baseline        Side-by-side comparison
```

### ROCm Setup (Optional)

If you have an AMD GPU with ROCm support:

```bash
# Install vLLM with ROCm support
pip install vllm  # ROCm-compatible wheel

# Start vLLM server with ROCm backend
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Llama-3.1-8B-Instruct \
  --device rocm \
  --port 11434
```

PromiseOS will automatically use the ROCm-accelerated endpoint for all LLM operations.

---

## Design Philosophy

### Enterprise Engineering Aesthetic

The frontend deliberately avoids common "AI tool" design tropes:

- **No** indigo/purple gradient backgrounds
- **No** glassmorphism or blur effects
- **No** floating rounded cards with ambient glow
- **No** ungrounded dark mode (`#0f172a`)

Instead, PromiseOS uses a **classic enterprise engineering** design system:

| Principle | Implementation |
|---|---|
| **Structural panels** | Solid `#161b22` panels with `#30363d` borders |
| **High-contrast typography** | System font stack with 700-weight headers, 12px body |
| **Tabular data** | Monospace numbers, uppercase column headers, proper table structures |
| **Functional color** | Risk-mapped: Red (HIGH), Amber (MEDIUM), Green (LOW) — not decorative |
| **Dense layouts** | Information-rich screens for power users, not marketing pages |
| **Explicit focus states** | Border-color transitions on `:focus`, hover state changes |

---

## Roadmap

- [ ] **Multi-conversation comparison** — cross-thread dependency analysis
- [ ] **Slack / Teams integration** — real-time commitment monitoring from live channels
- [ ] **Email connector** — Gmail / Outlook API ingestion pipeline
- [ ] **Historical reliability scoring** — track per-person delivery history over time
- [ ] **Export to PM tools** — push commitments to Jira, Linear, or Asana
- [ ] **Multi-language support** — Hindi, Spanish, and other language transcripts
- [ ] **WebSocket live updates** — real-time risk score changes as new messages arrive
- [ ] **ROCm multi-GPU** — distributed inference across multiple AMD GPUs

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code:
- Passes existing tests
- Follows the established design system (no gradients, no glow effects)
- Includes error handling and null-safe data access

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <strong>PromiseOS</strong> — Built for the Lablab.ai × AMD AI Academy Challenge<br/>
  <em>"The graph that knows whose promise is about to break yours."</em>
</p>
