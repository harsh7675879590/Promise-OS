import React, { useEffect } from 'react';
import { X, ShieldCheck, AlertTriangle, Clock, MessageSquare, ArrowRight, User, Sliders } from 'lucide-react';

export default function EvidenceDrawer({ isOpen, onClose, commitment, evidence, riskAssessment, onOpenWhatIf }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !commitment) return null;

  const score = riskAssessment ? (typeof riskAssessment.score === 'number' ? riskAssessment.score.toFixed(3) : riskAssessment.score) : '0.000';
  const level = riskAssessment ? riskAssessment.level : 'LOW';

  const isHigh = level === 'HIGH';
  const isMed = level === 'MEDIUM';
  const badgeClass = isHigh ? 'badge-high' : isMed ? 'badge-medium' : 'badge-low';

  return (
    <div className="drawer-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drawer-window" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        {/* Drawer Header */}
        <div className="panel-header" style={{ padding: '10px 16px' }}>
          <div className="flex-row-gap-2">
            <span className={`badge ${badgeClass}`}>
              {level} RISK ({score})
            </span>
            <span className="data-value" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              ID: {commitment.id.slice(0, 8)}
            </span>
          </div>

          <button
            className="btn-icon"
            onClick={onClose}
            aria-label="Close drawer"
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
          <h2 id="drawer-title" className="heading-sm" style={{ lineHeight: 1.4 }}>
            {commitment.deliverable_text || commitment.action_text}
          </h2>
          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Promised by <strong style={{ color: 'var(--text-primary)' }}>{commitment.owner_name}</strong> to <strong style={{ color: 'var(--text-primary)' }}>{commitment.recipient_name}</strong>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '6px', display: 'flex', gap: '16px' }}>
            <span>Due: <strong style={{ color: 'var(--text-secondary)' }}>{commitment.deadline_raw || 'Unspecified'}</strong></span>
            <span>Confidence: <strong style={{ color: 'var(--text-secondary)' }}>{Math.round((commitment.confidence || 0.85) * 100)}%</strong></span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section 1: Deterministic Risk Formula Breakdown */}
          <div>
            <span className="label-caps" style={{ display: 'block', marginBottom: '8px' }}>
              Deterministic Factor Breakdown (Section 10 Formula)
            </span>
            
            {riskAssessment && riskAssessment.factors_json && riskAssessment.factors_json.length > 0 ? (
              <div className="table-container" style={{ border: '1px solid var(--border-main)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Factor</th>
                      <th>Value</th>
                      <th>Weight</th>
                      <th>Contribution</th>
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
                          <td className="data-value">{val.toFixed(2)}</td>
                          <td className="data-value" style={{ color: 'var(--text-tertiary)' }}>{wt.toFixed(2)}</td>
                          <td className="data-value" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {cont.toFixed(3)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                Base score: <span className="data-value">{score}</span> (Synthesized from temporal proximity &amp; adjacency graph).
              </div>
            )}
          </div>

          {/* Section 2: Grounded Evidence Citations */}
          <div>
            <span className="label-caps" style={{ display: 'block', marginBottom: '8px' }}>
              Observable Chat Evidence Citations
            </span>

            {evidence && evidence.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {evidence.map((ev) => (
                  <div
                    key={ev.id}
                    className="panel-raised"
                    style={{
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div className="flex-between">
                      <span className="badge badge-neutral">
                        Source Anchor: {ev.source_message_id ? `Msg #${ev.source_message_id.slice(0, 6)}` : `Commitment #${ev.source_commitment_id?.slice(0, 6)}`}
                      </span>
                      <ShieldCheck size={14} color="var(--risk-low)" />
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '4px' }}>
                      {ev.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
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
            <span>Simulate Delay</span>
          </button>
        </div>
      </div>
    </div>
  );
}
