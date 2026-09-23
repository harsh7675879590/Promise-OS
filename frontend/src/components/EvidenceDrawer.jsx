import React from 'react';
import { X, ShieldCheck, AlertTriangle, Clock, MessageSquare, ArrowRight, User } from 'lucide-react';

export default function EvidenceDrawer({ isOpen, onClose, commitment, evidence, riskAssessment, onOpenWhatIf }) {
  if (!isOpen || !commitment) return null;

  const score = riskAssessment ? riskAssessment.score : 0;
  const level = riskAssessment ? riskAssessment.level : 'LOW';

  const getRiskColor = (lvl) => {
    if (lvl === 'HIGH') return 'var(--risk-high)';
    if (lvl === 'MEDIUM') return 'var(--risk-medium)';
    return 'var(--risk-low)';
  };

  const getRiskBg = (lvl) => {
    if (lvl === 'HIGH') return 'var(--risk-high-bg)';
    if (lvl === 'MEDIUM') return 'var(--risk-medium-bg)';
    return 'var(--risk-low-bg)';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 7, 12, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 90
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        height: '100%',
        borderLeft: '1px solid var(--border-color)',
        borderTop: 'none',
        borderBottom: 'none',
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.7)',
        animation: 'slideIn 0.25s ease-out'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                color: getRiskColor(level),
                background: getRiskBg(level),
                border: `1px solid ${getRiskColor(level)}`
              }}>
                {level} RISK ({score})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Commitment ID: {commitment.id.slice(0, 8)}...
              </span>
            </div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
              {commitment.deliverable_text || commitment.action_text}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Promised by <strong style={{ color: 'var(--text-main)' }}>{commitment.owner_name}</strong> to <strong style={{ color: 'var(--text-main)' }}>{commitment.recipient_name}</strong>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: Deterministic Risk Formula Breakdown */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', marginBottom: '12px' }}>
              Deterministic Factor Decomposition (Section 10)
            </h3>
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: '8px',
              padding: '14px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {riskAssessment && riskAssessment.factors && riskAssessment.factors.map((factor, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 500, textTransform: 'capitalize' }}>
                      {factor.name.replace('_', ' ')} (Weight: {Math.round(factor.weight * 100)}%)
                    </span>
                    <span style={{ color: factor.value > 0.6 ? 'var(--risk-high)' : factor.value > 0.3 ? 'var(--risk-medium)' : 'var(--risk-low)', fontWeight: 600 }}>
                      {factor.value.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${factor.value * 100}%`,
                      height: '100%',
                      background: factor.value > 0.6 ? 'var(--risk-high)' : factor.value > 0.3 ? 'var(--risk-medium)' : 'var(--risk-low)'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '3px' }}>
                    {factor.description}
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: '6px',
                paddingTop: '10px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontFamily: 'monospace'
              }}>
                Formula: 0.40(Urgency) + 0.35(Upstream) + 0.15(History) + 0.10(Load) = <strong>{score}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Traceable Evidence Chain */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
                Verified Evidence Chain (Anti-Hallucination)
              </h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--risk-low)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> 100% Sourced
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {evidence && evidence.length > 0 ? (
                evidence.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.83rem',
                    lineHeight: 1.4
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)', marginBottom: '4px', fontSize: '0.72rem' }}>
                      <MessageSquare size={13} />
                      <span>
                        {item.source_message_id ? `Source Message: ${item.source_message_id.slice(0, 8)}` : `Upstream Dependency: ${item.source_commitment_id?.slice(0, 8)}`}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-main)' }}>
                      {item.description}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                  No high-risk evidence flags discovered for this commitment.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '12px'
        }}>
          <button
            className="btn-rocm"
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={() => {
              onClose();
              if (onOpenWhatIf) onOpenWhatIf(commitment.id);
            }}
          >
            <span>Simulate Delay Cascade</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
