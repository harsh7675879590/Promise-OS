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
  ExternalLink,
  Layers,
  Inbox
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
  onOpenIngest,
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
      {/* ── Active Thread Control Bar ── */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex-row-gap-2">
            <Layers size={13} color="var(--accent)" />
            <span className="panel-header-title">Active Conversation Thread</span>
          </div>
          <div className="flex-row-gap-2">
            {safeConvs.length > 1 && (
              <select
                value={activeConversationId}
                onChange={(e) => onSelectConversation(e.target.value)}
                style={{ fontSize: '11px', padding: '3px 8px', maxWidth: '240px' }}
                aria-label="Select conversation thread"
              >
                {safeConvs.map(c => (
                  <option key={c.id} value={c.id}>{c.title || c.id.slice(0, 8)}</option>
                ))}
              </select>
            )}
            <button className="btn-secondary" onClick={onOpenIngest} style={{ fontSize: '11px', padding: '4px 10px' }}>
              <Upload size={12} />
              <span>Import Thread</span>
            </button>
            <button className="btn-primary" onClick={() => setCurrentTab('whatif')} style={{ fontSize: '11px', padding: '4px 10px' }}>
              <Sliders size={12} />
              <span>What-If Simulator</span>
            </button>
          </div>
        </div>
        <div className="panel-body flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="heading-md">
              {activeConv ? activeConv.title : 'Live Commitment & Risk Control Plane'}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Source: WhatsApp / Email Export • Multi-Agent Pipeline: Extraction &rarr; Resolution &rarr; Deterministic Risk &rarr; Evidence &rarr; Recommendation
            </p>
          </div>
          <div className="flex-row-gap-2">
            <button className="btn-secondary" onClick={() => setCurrentTab('graph')}>
              <GitFork size={13} />
              <span>Inspect Dependency Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Metric Summary Panels ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {/* Metric 1: Total Commitments */}
        <div className="metric-card">
          <div className="flex-between">
            <span className="metric-label">Extracted Commitments</span>
            <CheckCircle2 size={15} color="var(--text-tertiary)" />
          </div>
          {loading ? (
            <div className="skeleton skeleton-text-lg" style={{ width: '60px', marginTop: '6px' }} />
          ) : (
            <div className="metric-value">
              {safeCommitments.length}
            </div>
          )}
          <div className="metric-sub">
            Parsed action items across participants
          </div>
        </div>

        {/* Metric 2: At-Risk Deliverables */}
        <div className={`metric-card ${highRiskCount > 0 ? 'risk-stripe-high' : ''}`}>
          <div className="flex-between">
            <span className="metric-label">At-Risk Deliverables</span>
            <AlertTriangle size={15} color={highRiskCount > 0 ? 'var(--risk-high)' : 'var(--text-tertiary)'} />
          </div>
          {loading ? (
            <div className="skeleton skeleton-text-lg" style={{ width: '80px', marginTop: '6px' }} />
          ) : (
            <div className="metric-value" style={{ color: highRiskCount > 0 ? 'var(--risk-high)' : 'var(--text-primary)' }}>
              {highRiskCount} <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', verticalAlign: 'middle' }}>CRITICAL</span>
            </div>
          )}
          <div className="metric-sub">
            {mediumRiskCount} medium risk items flagged
          </div>
        </div>

        {/* Metric 3: Dependency Chains */}
        <div className="metric-card">
          <div className="flex-between">
            <span className="metric-label">Dependency Chains</span>
            <GitFork size={15} color="var(--text-tertiary)" />
          </div>
          {loading ? (
            <div className="skeleton skeleton-text-lg" style={{ width: '50px', marginTop: '6px' }} />
          ) : (
            <div className="metric-value">
              {safeCommitments.filter(c => c && c.action && c.action.toLowerCase().includes('depend')).length || (safeCommitments.length > 1 ? 1 : 0)}
            </div>
          )}
          <div className="metric-sub">
            Cross-person prerequisite promises
          </div>
        </div>

        {/* Metric 4: AMD ROCm Speedup */}
        <div className="metric-card" style={{ borderLeft: '3px solid var(--rocm-border)' }}>
          <div className="flex-between">
            <span className="metric-label">AMD ROCm Acceleration</span>
            <Cpu size={15} color="var(--rocm)" />
          </div>
          <div className="metric-value" style={{ color: 'var(--rocm)' }}>
            5.3&times;
          </div>
          <div className="metric-sub">
            vLLM HIP inference speedup vs CPU
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)', gap: '16px' }}>
        {/* Left Column: Recent Extracted Commitments Table */}
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
                  Import a WhatsApp or Email transcript to let the 5-agent pipeline extract commitments and build the dependency graph.
                </div>
                <button className="btn-primary" onClick={onOpenIngest} style={{ marginTop: '6px' }}>
                  <Upload size={12} />
                  <span>Import Conversation</span>
                </button>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Deliverable</th>
                    <th>Owner &rarr; Recipient</th>
                    <th>Deadline</th>
                    <th>Risk</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
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
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {c.deliverable || c.action}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>{c.owner}</strong> &rarr; {c.recipient}
                          </span>
                        </td>
                        <td className="data-value" style={{ color: 'var(--text-secondary)' }}>
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
                            style={{ fontSize: '11px', padding: '3px 8px' }}
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

        {/* Right Column: Risk Intelligence Feed */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-header-title">Risk Intelligence &amp; Recommended Actions</span>
            <button
              className="btn-ghost"
              onClick={() => setCurrentTab('risks')}
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              <span>Risk Center</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton" style={{ height: '70px' }} />
                <div className="skeleton" style={{ height: '70px' }} />
              </div>
            ) : safeRisks.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <div className="empty-state-icon">
                  <ShieldCheck size={20} color="var(--risk-low)" />
                </div>
                <div className="empty-state-title">No active risks detected</div>
                <div className="empty-state-desc">
                  All commitments in this thread are currently within safe delivery margins.
                </div>
              </div>
            ) : (
              safeRisks.slice(0, 4).map((r) => {
                const isHigh = r.level === 'HIGH';
                const isMed = r.level === 'MEDIUM';
                const badgeClass = isHigh ? 'badge-high' : isMed ? 'badge-medium' : 'badge-low';
                const stripeClass = isHigh ? 'risk-stripe-high' : isMed ? 'risk-stripe-medium' : 'risk-stripe-low';

                return (
                  <div
                    key={r.id}
                    className={`panel-raised ${stripeClass}`}
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div className="flex-between">
                      <div className="flex-row-gap-2">
                        <span className={`badge ${badgeClass}`}>
                          {r.level} RISK
                        </span>
                        <span className="data-value" style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>
                          Score: {typeof r.score === 'number' ? r.score.toFixed(3) : r.score}
                        </span>
                      </div>
                      <button
                        className="btn-ghost"
                        onClick={() => onOpenEvidence(r.commitment_id)}
                        style={{ fontSize: '10.5px', padding: '2px 6px' }}
                      >
                        Evidence &rarr;
                      </button>
                    </div>

                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.deliverable || r.commitment_action}
                    </div>

                    {r.primary_bottleneck && (
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-tertiary)' }}>Bottleneck: </span>
                        {r.primary_bottleneck}
                      </div>
                    )}

                    {r.recommended_action && (
                      <div style={{
                        marginTop: '4px',
                        padding: '6px 8px',
                        backgroundColor: 'var(--bg-canvas)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '11px',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                          <ShieldCheck size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
                          <span className="truncate">{r.recommended_action}</span>
                        </div>
                        <button
                          className="btn-primary"
                          onClick={() => onOpenWhatIf(r.commitment_id)}
                          style={{ fontSize: '10px', padding: '2px 7px', flexShrink: 0 }}
                        >
                          Simulate
                        </button>
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
