import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  GitFork, 
  Cpu, 
  ArrowRight, 
  Clock, 
  User, 
  Sliders, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function Dashboard({ 
  commitments = [], 
  risks = [], 
  conversations = [], 
  activeConversationId, 
  onSelectConversation, 
  setCurrentTab, 
  onOpenWhatIf,
  onOpenEvidence,
  onOpenIngest
}) {
  const safeConvs = conversations || [];
  const safeRisks = risks || [];
  const safeCommitments = commitments || [];

  const activeConv = safeConvs.find(c => c && c.id === activeConversationId);
  const highRiskCount = safeRisks.filter(r => r && r.level === 'HIGH').length;
  const mediumRiskCount = safeRisks.filter(r => r && r.level === 'MEDIUM').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Welcome & Thread Switcher */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Autonomous Pipeline
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {activeConv ? activeConv.title : 'Client-Harshit-Amit Quotation Thread'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Extracted from WhatsApp export • 5-Agent LangGraph State Machine • Deterministic Risk Engine
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={onOpenIngest}>
            <Sparkles size={16} color="var(--accent-blue)" />
            <span>Load New Transcript</span>
          </button>
          <button className="btn-rocm" onClick={() => setCurrentTab('whatif')}>
            <Sliders size={16} />
            <span>Launch What-If</span>
          </button>
        </div>
      </div>

      {/* Top 4 Telemetry Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {/* Card 1: Total Commitments */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Extracted Commitments</span>
            <CheckCircle2 size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {safeCommitments.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
            Across 3 active participants
          </div>
        </div>

        {/* Card 2: High Risk Alert */}
        <div className={`glass-panel ${highRiskCount > 0 ? 'glow-high' : ''}`} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>At-Risk Deliverables</span>
            <AlertTriangle size={18} color="var(--risk-high)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: highRiskCount > 0 ? 'var(--risk-high)' : 'var(--text-main)', lineHeight: 1 }}>
            {highRiskCount} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-dim)' }}>HIGH</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
            {mediumRiskCount} medium risk items flagged
          </div>
        </div>

        {/* Card 3: Dependency Depth */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Dependency Chains</span>
            <GitFork size={18} color="var(--accent-violet)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            Multi-Hop
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
            Client &larr; Harshit &larr; Amit
          </div>
        </div>

        {/* Card 4: AMD Acceleration */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Inference Engine</span>
            <Cpu size={18} color="var(--accent-rocm)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-rocm)', lineHeight: 1 }}>
            5.6x
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '8px' }}>
            AMD ROCm GPU vs CPU throughput
          </div>
        </div>
      </div>

      {/* Main Grid: At-Risk Deliverable Highlight & Recent Commitments */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Left: Cascading Risk Banner */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'var(--risk-high-bg)',
                color: 'var(--risk-high)',
                border: '1px solid var(--risk-high)'
              }}>
                PRIMARY AT-RISK CHAIN
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Deterministic Score: 0.695 (HIGH)
              </span>
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
              Harshit's Quotation for Client
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              This commitment is currently blocked because Amit's promised <em>updated pricing</em> deliverable is delayed past its Tuesday deadline, threatening the Friday client delivery window.
            </p>

            {/* Evidence summary pill */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
              fontSize: '0.8rem',
              color: 'var(--text-main)'
            }}>
              <div style={{ color: 'var(--accent-blue)', fontWeight: 600, marginBottom: '4px' }}>
                Cited Observational Evidence:
              </div>
              <ul style={{ paddingLeft: '18px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <li>[Mon 10:15] Harshit: <em>"Amit, I need the updated pricing to finish the quote."</em></li>
                <li>[Wed 09:41] Amit: <em>"Not yet, will do it today."</em> (Delivery signal overdue)</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" onClick={() => setCurrentTab('risks')}>
              <span>Open Risk Center</span>
              <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={() => setCurrentTab('graph')}>
              <span>View in Graph</span>
            </button>
          </div>
        </div>

        {/* Right: Extracted Commitments Snapshot */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Commitments Stream</h3>
            <button
              onClick={() => setCurrentTab('commitments')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontSize: '0.8rem' }}
            >
              View all ({safeCommitments.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {safeCommitments.slice(0, 4).map((c) => {
              const isHigh = c.risk_level === 'HIGH';
              const isMed = c.risk_level === 'MEDIUM';
              return (
                <div
                  key={c.id}
                  onClick={() => onOpenEvidence(c.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {c.deliverable || c.action}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {c.owner} &rarr; {c.recipient} • Due: {c.deadline || 'Soon'}
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)',
                    background: isHigh ? 'var(--risk-high-bg)' : isMed ? 'var(--risk-medium-bg)' : 'var(--risk-low-bg)',
                    border: `1px solid ${isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)'}`
                  }}>
                    {c.risk_level} ({c.risk_score?.toFixed(2) || '0.00'})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
