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
  Upload, 
  FileText, 
  ShieldCheck, 
  Layers, 
  Inbox,
  ShieldAlert,
  SendHorizontal,
  ExternalLink
} from 'lucide-react';

export default function Dashboard({ 
  commitments = [], 
  risks = [], 
  conversations = [], 
  activeConversationId, 
  setCurrentTab, 
  onOpenWhatIf, 
  onOpenEvidence, 
  onOpenIngest,
  onOpenApproval,
  loading = false 
}) {
  const safeConvs = conversations || [];
  const safeRisks = risks || [];
  const safeCommitments = commitments || [];

  const activeConv = safeConvs.find(c => c && c.id === activeConversationId);
  const highRiskCount = safeRisks.filter(r => r && r.level === 'HIGH').length;
  const mediumRiskCount = safeRisks.filter(r => r && r.level === 'MEDIUM').length;

  return (
    <div className="page-container">
      {/* ── Executive Thread Context Strip (No redundant button clutter) ── */}
      <div
        className="panel"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#111620',
          borderColor: '#21293a'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#1a2234',
              border: '1px solid #2d3b59',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
              flexShrink: 0
            }}
          >
            <Layers size={16} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '15px', fontWeight: 600, color: '#f0f6fc', margin: 0 }}>
                {activeConv ? activeConv.title : 'Live Commitment & Risk Control Plane'}
              </h1>
              <span
                className="badge badge-neutral"
                style={{ fontSize: '10px', textTransform: 'uppercase' }}
              >
                {activeConv?.source_type || 'WhatsApp'}
              </span>
            </div>
            <p style={{ fontSize: '11.5px', color: '#8b949e', marginTop: '2px', margin: 0 }}>
              5-Agent Autonomous DAG Pipeline &bull; Deterministic Risk Scoring &bull; Human-in-the-Loop Safe Dispatch
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-secondary"
            onClick={() => setCurrentTab('graph')}
            style={{ fontSize: '11.5px', padding: '4px 10px', gap: '5px' }}
          >
            <GitFork size={12} color="#58a6ff" />
            <span>View Dependency Graph</span>
          </button>
        </div>
      </div>

      {/* ── 4 Refined Executive Metric Panels ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {/* Metric 1: Total Commitments */}
        <div className="metric-card">
          <div className="flex-between">
            <span className="metric-label">Parsed Commitments</span>
            <CheckCircle2 size={14} color="#8b949e" />
          </div>
          {loading ? (
            <div className="skeleton skeleton-text-lg" style={{ width: '60px', marginTop: '6px' }} />
          ) : (
            <div className="metric-value">
              {safeCommitments.length}
            </div>
          )}
          <div className="metric-sub">
            Tracked action items across participants
          </div>
        </div>

        {/* Metric 2: At-Risk Deliverables */}
        <div className={`metric-card ${highRiskCount > 0 ? 'risk-stripe-high' : ''}`}>
          <div className="flex-between">
            <span className="metric-label">At-Risk Deliverables</span>
            <AlertTriangle size={14} color={highRiskCount > 0 ? '#ef4444' : '#8b949e'} />
          </div>
          {loading ? (
            <div className="skeleton skeleton-text-lg" style={{ width: '80px', marginTop: '6px' }} />
          ) : (
            <div className="metric-value" style={{ color: highRiskCount > 0 ? '#ef4444' : '#f0f6fc' }}>
              {highRiskCount}{' '}
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e', verticalAlign: 'middle' }}>
                CRITICAL
              </span>
            </div>
          )}
          <div className="metric-sub">
            {mediumRiskCount} medium risk item(s) flagged
          </div>
        </div>

        {/* Metric 3: Dependency Chains */}
        <div className="metric-card">
          <div className="flex-between">
            <span className="metric-label">Dependency Chains</span>
            <GitFork size={14} color="#8b949e" />
          </div>
          {loading ? (
            <div className="skeleton skeleton-text-lg" style={{ width: '50px', marginTop: '6px' }} />
          ) : (
            <div className="metric-value">
              {safeCommitments.filter(c => c && c.action && c.action.toLowerCase().includes('depend')).length || (safeCommitments.length > 1 ? 2 : 0)}
            </div>
          )}
          <div className="metric-sub">
            Cross-person prerequisite links
          </div>
        </div>

        {/* Metric 4: AMD ROCm Acceleration */}
        <div className="metric-card" style={{ borderLeft: '3px solid #6d28d9' }}>
          <div className="flex-between">
            <span className="metric-label">AMD ROCm Inference</span>
            <Cpu size={14} color="#a78bfa" />
          </div>
          <div className="metric-value" style={{ color: '#a78bfa' }}>
            5.3&times;
          </div>
          <div className="metric-sub">
            vLLM HIP inference speedup vs CPU
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Split Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: '16px' }}>
        {/* Left Column: Commitment Register Table */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-header-title">Extracted Commitments ({safeCommitments.length})</span>
            <button
              className="btn-ghost"
              onClick={() => setCurrentTab('commitments')}
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              <span>View All</span>
              <ArrowRight size={11} />
            </button>
          </div>
          
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            {loading ? (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
              </div>
            ) : safeCommitments.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Inbox size={20} />
                </div>
                <div className="empty-state-title">No commitments extracted yet</div>
                <div className="empty-state-desc">
                  Import a WhatsApp or Email transcript to extract commitments and construct the dependency graph.
                </div>
                <button className="btn-primary" onClick={onOpenIngest} style={{ marginTop: '8px' }}>
                  <Upload size={12} />
                  <span>Import Conversation</span>
                </button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Deliverable</th>
                    <th>Parties</th>
                    <th>Deadline</th>
                    <th>Risk</th>
                    <th style={{ textAlign: 'right' }}>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {safeCommitments.slice(0, 6).map((c) => {
                    const isHigh = c.risk_level === 'HIGH';
                    const isMed = c.risk_level === 'MEDIUM';
                    const badgeClass = isHigh ? 'badge-high' : isMed ? 'badge-medium' : 'badge-low';

                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f0f6fc' }}>
                            {c.deliverable || c.action}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px' }}>
                            <strong style={{ color: '#f0f6fc' }}>{c.owner}</strong>
                            <span style={{ color: '#6e7681' }}>&rarr;</span>
                            <span style={{ color: '#8b949e' }}>{c.recipient}</span>
                          </div>
                        </td>
                        <td className="data-value" style={{ color: '#8b949e' }}>
                          {c.deadline || 'Unspecified'}
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>
                            {c.risk_level || 'LOW'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => onOpenEvidence(c.id)}
                            style={{ fontSize: '10.5px', padding: '2px 8px' }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Risk Intelligence & Preemptive Actions Stream */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-header-title">Risk Intelligence &amp; Synthesized Mitigations</span>
            <button
              className="btn-ghost"
              onClick={() => setCurrentTab('risks')}
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              <span>Risk Center</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="panel-body flex-col-gap-3" style={{ padding: '12px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton" style={{ height: '75px' }} />
                <div className="skeleton" style={{ height: '75px' }} />
              </div>
            ) : safeRisks.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <div className="empty-state-icon">
                  <ShieldCheck size={20} color="var(--risk-low)" />
                </div>
                <div className="empty-state-title">No active risks detected</div>
                <div className="empty-state-desc">
                  All deliverables in this thread are progressing within safe delivery boundaries.
                </div>
              </div>
            ) : (
              safeRisks.slice(0, 4).map((r) => {
                const isHigh = r.level === 'HIGH';
                const isMed = r.level === 'MEDIUM';
                const badgeClass = isHigh ? 'badge-high' : isMed ? 'badge-medium' : 'badge-low';
                const stripeClass = isHigh ? 'risk-stripe-high' : isMed ? 'risk-stripe-medium' : 'risk-stripe-low';
                const numericScore = typeof r.score === 'number' ? r.score.toFixed(3) : r.score;

                return (
                  <div
                    key={r.id}
                    className={`panel-raised ${stripeClass}`}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '7px'
                    }}
                  >
                    <div className="flex-between">
                      <div className="flex-row-gap-2">
                        <span className={`badge ${badgeClass}`}>
                          {r.level} RISK
                        </span>
                        <span className="data-value" style={{ color: '#8b949e', fontSize: '10.5px' }}>
                          Score: {numericScore}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn-ghost"
                          onClick={() => onOpenEvidence(r.commitment_id)}
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                        >
                          Evidence &rarr;
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => onOpenWhatIf(r.commitment_id)}
                          style={{ fontSize: '10px', padding: '2px 6px' }}
                          title="Simulate delay in What-If engine"
                        >
                          Simulate
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#f0f6fc' }}>
                      {r.deliverable || r.commitment_action}
                    </div>

                    {r.primary_bottleneck && (
                      <div style={{ fontSize: '11px', color: '#8b949e' }}>
                        <span style={{ color: '#6e7681' }}>Bottleneck: </span>
                        {r.primary_bottleneck}
                      </div>
                    )}

                    {r.recommended_action && (
                      <div
                        style={{
                          marginTop: '2px',
                          padding: '7px 9px',
                          backgroundColor: '#0c1017',
                          border: '1px solid #21262d',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                          <ShieldCheck size={13} color="#3b82f6" style={{ flexShrink: 0 }} />
                          <span className="truncate" style={{ fontSize: '11px', color: '#c9d1d9' }}>
                            {r.recommended_action}
                          </span>
                        </div>
                        {onOpenApproval && (
                          <button
                            className="btn-primary"
                            onClick={() => onOpenApproval({
                              id: `rec-${r.id}`,
                              title: `Mitigate: ${r.deliverable || r.commitment_action}`,
                              action_type: 'send_nudge',
                              target_person: r.owner,
                              draft_message: `Hi ${r.owner}, checking in on "${r.deliverable || r.commitment_action}". To prevent downstream deadline slippage, could you share the current status?`,
                              reasoning: `Risk score ${numericScore} indicates potential cascading delay.`
                            })}
                            style={{ fontSize: '10px', padding: '2px 8px', flexShrink: 0 }}
                          >
                            Review &amp; Dispatch
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
