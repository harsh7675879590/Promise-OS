import React from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, User, Check, Clock, CheckCircle2 } from 'lucide-react';

export default function RiskCenter({ risks, onOpenEvidence, onOpenApproval, onOpenWhatIf }) {
  // Sort HIGH first
  const sorted = [...risks].sort((a, b) => b.score - a.score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--risk-high)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Risk Intelligence Center</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Deterministic risk scoring computed from observable delivery signals & graph adjacency.
          </p>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
          {sorted.filter(r => r.level === 'HIGH').length} High Priority Alert(s)
        </div>
      </div>

      {/* Cards list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sorted.map((r) => {
          const isHigh = r.level === 'HIGH';
          const isMed = r.level === 'MEDIUM';

          return (
            <div
              key={r.id}
              className={`glass-panel ${isHigh ? 'glow-high' : isMed ? 'glow-medium' : ''}`}
              style={{
                padding: '24px',
                borderLeftWidth: '4px',
                borderLeftColor: isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)'
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)',
                      background: isHigh ? 'var(--risk-high-bg)' : isMed ? 'var(--risk-medium-bg)' : 'var(--risk-low-bg)',
                      border: `1px solid ${isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)'}`
                    }}>
                      {r.level} RISK ({r.score.toFixed(3)})
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                      Deadline: {r.deadline || 'Approaching'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {r.deliverable || r.commitment_action}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Promised by <strong style={{ color: 'var(--text-main)' }}>{r.owner}</strong> to <strong style={{ color: 'var(--text-main)' }}>{r.recipient}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => onOpenEvidence(r.commitment_id)}
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    View Citations ({r.evidence?.length || 0})
                  </button>
                  <button
                    className="btn-rocm"
                    onClick={() => onOpenWhatIf(r.commitment_id)}
                    style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                  >
                    Simulate Delay
                  </button>
                </div>
              </div>

              {/* Factors Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                marginBottom: '16px'
              }}>
                {r.factors && r.factors.map((f, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                      {f.name.replace('_', ' ')}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: f.value > 0.6 ? 'var(--risk-high)' : f.value > 0.3 ? 'var(--risk-medium)' : 'var(--risk-low)'
                    }}>
                      {f.value.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Weight: {Math.round(f.weight * 100)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Proposed Recommendation Mitigation Card */}
              {r.recommendation && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.06)',
                  border: '1px solid rgba(56, 189, 248, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--accent-blue)', color: '#000' }}>
                        AI MITIGATION PROPOSAL
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                        {r.recommendation.action_type}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                      {r.recommendation.description}
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    onClick={() => onOpenApproval(r.recommendation)}
                    style={{ flexShrink: 0, padding: '8px 14px', fontSize: '0.8rem' }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Review & Approve Draft</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
