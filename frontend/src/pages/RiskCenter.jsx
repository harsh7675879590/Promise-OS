import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, User, Check, Clock, CheckCircle2, Sliders, ExternalLink, ShieldAlert, Inbox } from 'lucide-react';

export default function RiskCenter({ risks = [], onOpenEvidence, onOpenApproval, onOpenWhatIf, loading = false }) {
  const [filterLevel, setFilterLevel] = useState('ALL');

  const safeRisks = risks || [];
  const sorted = [...safeRisks].sort((a, b) => (b?.score || 0) - (a?.score || 0));

  const filtered = sorted.filter(r => {
    if (!r) return false;
    if (filterLevel === 'ALL') return true;
    return (r.level || 'LOW') === filterLevel;
  });

  return (
    <div className="page-container">
      {/* ── Header & Filter Bar ── */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex-row-gap-2">
            <ShieldAlert size={14} color="var(--risk-high)" />
            <span className="panel-header-title">Deterministic Risk Intelligence Register</span>
          </div>
          <div className="flex-row-gap-2">
            <span className="label-caps" style={{ fontSize: '10px' }}>Filter Severity:</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{ fontSize: '11px', padding: '3px 8px', width: 'auto' }}
              aria-label="Filter risk severity"
            >
              <option value="ALL">All Levels ({sorted.length})</option>
              <option value="HIGH">High Risk ({sorted.filter(r => r.level === 'HIGH').length})</option>
              <option value="MEDIUM">Medium Risk ({sorted.filter(r => r.level === 'MEDIUM').length})</option>
              <option value="LOW">Low Risk ({sorted.filter(r => r.level === 'LOW').length})</option>
            </select>
          </div>
        </div>
        <div className="panel-body">
          <h1 className="heading-md">Deterministic Risk Scoring &amp; Mitigation Dispatch</h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Risk scores calculated via Section 10 formula: <code>0.40 &times; Urgency + 0.35 &times; Impact + 0.15 &times; Historical Reliability + 0.10 &times; Load</code>.
            AI mitigations require explicit Human-in-the-Loop review before dispatch.
          </p>
        </div>
      </div>

      {/* ── Risk Cards List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="panel" style={{ height: '120px' }}>
              <div className="skeleton" style={{ height: '100%' }} />
            </div>
            <div className="panel" style={{ height: '120px' }}>
              <div className="skeleton" style={{ height: '100%' }} />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel">
            <div className="empty-state">
              <div className="empty-state-icon">
                <ShieldCheck size={24} color="var(--risk-low)" />
              </div>
              <div className="empty-state-title">No risk assessments matching filter</div>
              <div className="empty-state-desc">
                {filterLevel !== 'ALL'
                  ? `There are no deliverables currently rated at ${filterLevel} risk.`
                  : 'No active delivery bottlenecks or overdue promises found in this conversation.'}
              </div>
              {filterLevel !== 'ALL' && (
                <button className="btn-secondary" onClick={() => setFilterLevel('ALL')} style={{ marginTop: '8px' }}>
                  Show All Levels
                </button>
              )}
            </div>
          </div>
        ) : (
          filtered.map((r) => {
            const isHigh = r.level === 'HIGH';
            const isMed = r.level === 'MEDIUM';
            const badgeClass = isHigh ? 'badge-high' : isMed ? 'badge-medium' : 'badge-low';
            const stripeClass = isHigh ? 'risk-stripe-high' : isMed ? 'risk-stripe-medium' : 'risk-stripe-low';
            const numericScore = typeof r.score === 'number' ? r.score.toFixed(3) : r.score;

            return (
              <div key={r.id} className={`panel ${stripeClass}`}>
                {/* Header Row */}
                <div className="panel-header">
                  <div className="flex-row-gap-2">
                    <span className={`badge ${badgeClass}`}>
                      {r.level} RISK
                    </span>
                    <span className="data-value" style={{ color: 'var(--text-secondary)' }}>
                      Computed Score: <strong>{numericScore}</strong>
                    </span>
                    <span style={{ color: 'var(--border-main)' }}>|</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Deadline: <strong style={{ color: 'var(--text-primary)' }}>{r.deadline || 'Approaching'}</strong>
                    </span>
                  </div>

                  <div className="flex-row-gap-2">
                    <button
                      className="btn-secondary"
                      onClick={() => onOpenEvidence(r.commitment_id)}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      Evidence Citations
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => onOpenWhatIf(r.commitment_id)}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      <Sliders size={12} />
                      <span>Simulate Delay</span>
                    </button>
                  </div>
                </div>

                <div className="panel-body flex-col-gap-3">
                  {/* Title & Parties */}
                  <div>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.deliverable || r.commitment_action}
                    </h2>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Owner: <strong style={{ color: 'var(--text-primary)' }}>{r.owner || 'Assigned Owner'}</strong> &bull; Recipient: <strong style={{ color: 'var(--text-primary)' }}>{r.recipient || 'Recipient'}</strong>
                    </div>
                  </div>

                  {/* Root Cause & Bottleneck Banner */}
                  {r.primary_bottleneck && (
                    <div className="alert-warning" style={{ fontSize: '11.5px' }}>
                      <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Identified Bottleneck:</strong> {r.primary_bottleneck}
                      </div>
                    </div>
                  )}

                  {/* Factor Breakdown Chips */}
                  {r.factors && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                      {Object.entries(r.factors).map(([k, val]) => (
                        <div key={k} style={{
                          padding: '6px 10px',
                          backgroundColor: 'var(--bg-subtle)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)'
                        }}>
                          <div className="label-caps" style={{ fontSize: '9.5px' }}>{k.replace(/_/g, ' ')}</div>
                          <div className="data-value" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                            {typeof val === 'number' ? val.toFixed(2) : val}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommended Action / Mitigation Box */}
                  {r.recommended_action && (
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-main)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                        <ShieldCheck size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            Recommended Autonomous Mitigation:
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {r.recommended_action}
                          </div>
                        </div>
                      </div>

                      {onOpenApproval && (
                        <button
                          className="btn-primary"
                          onClick={() => onOpenApproval({
                            id: `rec-${r.id}`,
                            title: `Mitigate: ${r.deliverable || r.commitment_action}`,
                            action_type: 'send_nudge',
                            target_person: r.owner,
                            draft_message: `Hi ${r.owner}, following up on "${r.deliverable || r.commitment_action}". To prevent downstream deadline slippage, could you share the current status?`,
                            reasoning: `Risk score ${numericScore} indicates severe cascade probability.`
                          })}
                          style={{ fontSize: '11px', padding: '5px 12px', flexShrink: 0 }}
                        >
                          Review &amp; Approve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
