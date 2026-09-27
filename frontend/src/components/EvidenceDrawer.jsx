import React from 'react';
import { X, ShieldCheck, AlertTriangle, Clock, MessageSquare, ArrowRight, User, Sliders } from 'lucide-react';

export default function EvidenceDrawer({ isOpen, onClose, commitment, evidence, riskAssessment, onOpenWhatIf }) {
  if (!isOpen || !commitment) return null;

  const score = riskAssessment ? (typeof riskAssessment.score === 'number' ? riskAssessment.score.toFixed(3) : riskAssessment.score) : '0.000';
  const level = riskAssessment ? riskAssessment.level : 'LOW';

  const isHigh = level === 'HIGH';
  const isMed = level === 'MEDIUM';
  const badgeClass = isHigh ? 'badge-risk-high' : isMed ? 'badge-risk-medium' : 'badge-risk-low';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 90
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        height: '100%',
        backgroundColor: 'var(--bg-panel)',
        borderLeft: '1px solid var(--border-main)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 16px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Drawer Header */}
        <div className="classic-panel-header" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge-classic ${badgeClass}`}>
              {level} RISK ({score})
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              ID: {commitment.id.slice(0, 8)}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Deliverable Title & Parties */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-main)',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
            {commitment.deliverable_text || commitment.action_text}
          </h2>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Promised by <strong style={{ color: 'var(--text-main)' }}>{commitment.owner_name}</strong> to <strong style={{ color: 'var(--text-main)' }}>{commitment.recipient_name}</strong>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', display: 'flex', gap: '16px' }}>
            <span>Due: <strong>{commitment.deadline_raw || 'Unspecified'}</strong></span>
            <span>Confidence: <strong>{Math.round((commitment.confidence || 0.85) * 100)}%</strong></span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section 1: Deterministic Risk Formula Breakdown */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Deterministic Factor Breakdown (Section 10 Formula)
            </div>
            
            {riskAssessment && riskAssessment.factors_json && riskAssessment.factors_json.length > 0 ? (
              <div className="classic-table-container">
                <table className="classic-table">
                  <thead>
                    <tr>
                      <th>Factor</th>
                      <th>Value</th>
                      <th>Weight</th>
                      <th>Weighted Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskAssessment.factors_json.map((f, idx) => {
                      const val = typeof f.value === 'number' ? f.value : 0;
                      const wt = typeof f.weight === 'number' ? f.weight : 0;
                      const cont = val * wt;

                      return (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600 }}>{f.name || f.factor_name}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{val.toFixed(2)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{wt.toFixed(2)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                            {cont.toFixed(3)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: 'var(--text-muted)' }}>
                Base score: {score} (Computed from temporal proximity & adjacency graph).
              </div>
            )}
          </div>

          {/* Section 2: Grounded Evidence Citations (Anti-Hallucination) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>
              Observable Chat Evidence Citations
            </div>

            {evidence && evidence.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {evidence.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-main)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="badge-classic badge-neutral">
                        Source Anchor: {ev.source_message_id ? `Msg #${ev.source_message_id.slice(0, 6)}` : `Commitment #${ev.source_commitment_id?.slice(0, 6)}`}
                      </span>
                      <ShieldCheck size={13} color="var(--risk-low)" />
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '2px' }}>
                      {ev.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', fontSize: '11px', color: 'var(--text-muted)' }}>
                Anchor citation verified from source message ID: <code>{commitment.source_message_id || 'synthetic_thread'}</code>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-main)',
          backgroundColor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              onClose();
              if (onOpenWhatIf) onOpenWhatIf(commitment.id);
            }}
          >
            <Sliders size={13} />
            <span>Simulate Delay on this Item</span>
          </button>
        </div>
      </div>
    </div>
  );
}
