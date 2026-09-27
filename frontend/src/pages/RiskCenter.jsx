import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ArrowRight, User, Check, Clock, CheckCircle2, Sliders, ExternalLink } from 'lucide-react';

export default function RiskCenter({ risks = [], onOpenEvidence, onOpenApproval, onOpenWhatIf }) {
  const [filterLevel, setFilterLevel] = useState('ALL');

  const safeRisks = risks || [];
  const sorted = [...safeRisks].sort((a, b) => (b?.score || 0) - (a?.score || 0));

  const filtered = sorted.filter(r => {
    if (!r) return false;
    if (filterLevel === 'ALL') return true;
    return (r.level || 'LOW') === filterLevel;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Controls Bar */}
      <div className="classic-panel">
        <div className="classic-panel-header">
          <span>RISK INTELLIGENCE REGISTER</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Filter Level:</span>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              style={{ fontSize: '11px', padding: '2px 6px' }}
            >
              <option value="ALL">All Levels ({sorted.length})</option>
              <option value="HIGH">High Risk ({sorted.filter(r => r.level === 'HIGH').length})</option>
              <option value="MEDIUM">Medium Risk ({sorted.filter(r => r.level === 'MEDIUM').length})</option>
              <option value="LOW">Low Risk ({sorted.filter(r => r.level === 'LOW').length})</option>
            </select>
          </div>
        </div>
        <div className="classic-panel-body" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
            Deterministic Risk Scoring Engine
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Risk scores computed via Section 10 formula: 0.40 &times; Urgency + 0.35 &times; Impact + 0.15 &times; Historical Reliability + 0.10 &times; Load
          </p>
        </div>
      </div>

      {/* Risk Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div className="classic-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
            No risk assessments match the selected filter.
          </div>
        ) : (
          filtered.map((r) => {
            const isHigh = r.level === 'HIGH';
            const isMed = r.level === 'MEDIUM';
            const badgeClass = isHigh ? 'badge-risk-high' : isMed ? 'badge-risk-medium' : 'badge-risk-low';
            const borderColor = isHigh ? 'var(--risk-high-border)' : isMed ? 'var(--risk-medium-border)' : 'var(--border-main)';

            return (
              <div
                key={r.id}
                className="classic-panel"
                style={{ borderLeft: `3px solid ${isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)'}` }}
              >
                {/* Header Row */}
                <div className="classic-panel-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge-classic ${badgeClass}`}>
                      {r.level} RISK (Score: {r.score.toFixed(3)})
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      Deadline: <strong>{r.deadline || 'Approaching'}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => onOpenEvidence(r.commitment_id)}
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                    >
                      Evidence Citations
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => onOpenWhatIf(r.commitment_id)}
                      style={{ fontSize: '11px', padding: '2px 8px' }}
                    >
                      <Sliders size={11} />
                      <span>Simulate Delay</span>
                    </button>
                  </div>
                </div>

                <div className="classic-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Title & Parties */}
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {r.deliverable || r.commitment_action}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Promised by <strong style={{ color: 'var(--text-main)' }}>{r.owner}</strong> to <strong style={{ color: 'var(--text-main)' }}>{r.recipient}</strong>
                    </div>
                  </div>

                  {/* Mathematical Factor Decomposition */}
                  {r.factors && r.factors.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>
                        Factor Decomposition
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(r.factors.length, 4)}, 1fr)`,
                        gap: '8px'
                      }}>
                        {r.factors.map((f, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '6px 8px',
                              backgroundColor: 'var(--bg-subtle)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '11px'
                            }}
                          >
                            <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>{f.name || f.factor_name}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '2px' }}>
                              <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                                {typeof f.value === 'number' ? f.value.toFixed(2) : f.value}
                              </span>
                              <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                                wt: {typeof f.weight === 'number' ? f.weight.toFixed(2) : f.weight}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation Box & Human Approval Gate */}
                  {r.recommendation && (
                    <div style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-main)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <ShieldCheck size={14} color="var(--primary-hover)" />
                          <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-main)' }}>
                            Human-in-the-Loop Recommendation
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                          Target: {r.recommendation.target_person}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {r.recommendation.description}
                      </div>

                      {r.recommendation.draft_message && (
                        <div style={{
                          padding: '8px 10px',
                          backgroundColor: 'var(--bg-panel)',
                          border: '1px solid var(--border-main)',
                          borderRadius: 'var(--radius-xs)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: 'var(--text-main)',
                          whiteSpace: 'pre-wrap'
                        }}>
                          "{r.recommendation.draft_message}"
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                        <button
                          className="btn-primary"
                          onClick={() => onOpenApproval(r.recommendation)}
                          style={{ fontSize: '11px', padding: '4px 10px' }}
                        >
                          <Check size={12} />
                          <span>Review & Approve Draft</span>
                        </button>
                      </div>
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
