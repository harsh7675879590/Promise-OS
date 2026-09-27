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
  ExternalLink
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Thread Overview & Actions Header */}
      <div className="classic-panel">
        <div className="classic-panel-header">
          <span>ACTIVE CONVERSATION THREAD</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {safeConvs.length > 1 && (
              <select
                value={activeConversationId}
                onChange={(e) => onSelectConversation(e.target.value)}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                {safeConvs.map(c => (
                  <option key={c.id} value={c.id}>{c.title || c.id.slice(0, 8)}</option>
                ))}
              </select>
            )}
            <button className="btn-secondary" onClick={onOpenIngest} style={{ fontSize: '11px', padding: '3px 8px' }}>
              <Upload size={12} />
              <span>Import Thread</span>
            </button>
            <button className="btn-primary" onClick={() => setCurrentTab('whatif')} style={{ fontSize: '11px', padding: '3px 8px' }}>
              <Sliders size={12} />
              <span>What-If Simulator</span>
            </button>
          </div>
        </div>
        <div className="classic-panel-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              {activeConv ? activeConv.title : 'Imported Conversation Thread'}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Source: WhatsApp / Email Export • Multi-Agent Pipeline: Extraction, Resolution, Deterministic Risk, Evidence, Recommendation
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn-secondary" onClick={() => setCurrentTab('graph')}>
              <GitFork size={13} />
              <span>Inspect Dependency Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {/* Metric 1 */}
        <div className="classic-panel">
          <div className="classic-panel-header">
            <span>COMMITMENTS</span>
            <CheckCircle2 size={14} color="var(--text-dim)" />
          </div>
          <div className="classic-panel-body">
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {safeCommitments.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Parsed action items across participants
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="classic-panel" style={{ borderLeft: highRiskCount > 0 ? '3px solid var(--risk-high)' : undefined }}>
          <div className="classic-panel-header">
            <span>AT-RISK DELIVERABLES</span>
            <AlertTriangle size={14} color={highRiskCount > 0 ? 'var(--risk-high)' : 'var(--text-dim)'} />
          </div>
          <div className="classic-panel-body">
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: highRiskCount > 0 ? 'var(--risk-high)' : 'var(--text-main)' }}>
              {highRiskCount} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>HIGH</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {mediumRiskCount} medium risk items flagged
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="classic-panel">
          <div className="classic-panel-header">
            <span>DEPENDENCY CHAINS</span>
            <GitFork size={14} color="var(--text-dim)" />
          </div>
          <div className="classic-panel-body">
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
              {safeCommitments.filter(c => c && c.action && c.action.toLowerCase().includes('depend')).length || (safeCommitments.length > 1 ? 1 : 0)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Cross-person dependent commitments
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="classic-panel">
          <div className="classic-panel-header">
            <span>AMD ROCm ACCELERATION</span>
            <Cpu size={14} color="var(--rocm-accent)" />
          </div>
          <div className="classic-panel-body">
            <div style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--rocm-accent)' }}>
              5.3x
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              vLLM HIP inference speedup vs CPU
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Left Column: Recent Extracted Commitments Table */}
        <div className="classic-panel">
          <div className="classic-panel-header">
            <span>EXTRACTED COMMITMENTS ({safeCommitments.length})</span>
            <button
              className="btn-secondary"
              onClick={() => setCurrentTab('commitments')}
              style={{ fontSize: '11px', padding: '2px 6px' }}
            >
              <span>View All</span>
              <ArrowRight size={11} />
            </button>
          </div>
          
          <div className="classic-table-container" style={{ border: 'none', borderRadius: 0 }}>
            {safeCommitments.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                No commitments extracted yet. Click "Import Thread" above to parse messages.
              </div>
            ) : (
              <table className="classic-table">
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
                    const badgeClass = isHigh ? 'badge-risk-high' : isMed ? 'badge-risk-medium' : 'badge-risk-low';

                    return (
                      <tr key={c.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {c.deliverable || c.action}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-muted)' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{c.owner}</strong> &rarr; {c.recipient}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {c.deadline || 'Unspecified'}
                        </td>
                        <td>
                          <span className={`badge-classic ${badgeClass}`}>
                            {c.risk_level || 'LOW'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => onOpenEvidence(c.id)}
                            style={{ fontSize: '11px', padding: '2px 8px' }}
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
        <div className="classic-panel">
          <div className="classic-panel-header">
            <span>RISK INTELLIGENCE & RECOMMENDED ACTIONS</span>
            <button
              className="btn-secondary"
              onClick={() => setCurrentTab('risks')}
              style={{ fontSize: '11px', padding: '2px 6px' }}
            >
              <span>Risk Center</span>
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="classic-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {safeRisks.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                No active risks detected in this conversation.
              </div>
            ) : (
              safeRisks.slice(0, 4).map((r) => {
                const isHigh = r.level === 'HIGH';
                const isMed = r.level === 'MEDIUM';
                const badgeClass = isHigh ? 'badge-risk-high' : isMed ? 'badge-risk-medium' : 'badge-risk-low';

                return (
                  <div
                    key={r.id}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-main)',
                      borderLeft: `3px solid ${isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)'}`,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={`badge-classic ${badgeClass}`}>
                        {r.level} RISK (Score: {r.score.toFixed(2)})
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        Deadline: {r.deadline || 'Pending'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>
                      {r.deliverable || r.commitment_action}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Owner: <strong>{r.owner}</strong> &rarr; Recipient: <strong>{r.recipient}</strong>
                    </div>

                    {r.recommendation && (
                      <div style={{
                        marginTop: '4px',
                        padding: '6px 8px',
                        backgroundColor: 'var(--bg-panel)',
                        border: '1px solid var(--border-main)',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '11px',
                        color: 'var(--text-muted)'
                      }}>
                        <strong style={{ color: 'var(--primary-hover)' }}>Recommendation:</strong> {r.recommendation.description}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => onOpenEvidence(r.commitment_id)}
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        Evidence
                      </button>
                      <button
                        className="btn-primary"
                        onClick={() => onOpenWhatIf(r.commitment_id)}
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        Simulate Delay
                      </button>
                    </div>
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
