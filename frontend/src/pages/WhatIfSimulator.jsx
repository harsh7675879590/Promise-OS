import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ArrowRight, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  RotateCcw,
  Loader2,
  Clock,
  User,
  ShieldCheck,
  Check,
  Cpu,
  Inbox
} from 'lucide-react';
import { api } from '../api/client';

export default function WhatIfSimulator({ commitments = [], selectedCommitmentId, onOpenApproval }) {
  const safeCommitments = commitments || [];
  const [targetId, setTargetId] = useState(selectedCommitmentId || (safeCommitments[1]?.id || safeCommitments[0]?.id || ''));
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [scenarioDays, setScenarioDays] = useState(2);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedCommitmentId) {
      setTargetId(selectedCommitmentId);
    } else if (safeCommitments.length > 0 && !targetId) {
      const amitCommitment = safeCommitments.find(c => c && c.owner && c.owner.toLowerCase().includes('amit'));
      setTargetId(amitCommitment ? amitCommitment.id : safeCommitments[0].id);
    }
  }, [selectedCommitmentId, commitments]);

  const handleRunSimulation = async () => {
    if (!targetId) return;
    setSimulating(true);
    setSimulationResult(null);
    setError(null);

    try {
      const res = await api.simulateWhatIf(targetId, 'delayed');
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
      setError('Simulation failed to execute against the graph engine.');
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = () => {
    setSimulationResult(null);
    setError(null);
  };

  return (
    <div className="page-container">
      {/* ── Simulation Console Header & Form ── */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex-row-gap-2">
            <Sliders size={14} color="var(--accent)" />
            <span className="panel-header-title">What-If Counterfactual Simulator</span>
          </div>
          <span className="badge badge-rocm">
            <Cpu size={12} />
            <span>AMD ROCm In-Memory Engine</span>
          </span>
        </div>

        <div className="panel-body flex-col-gap-3">
          <div>
            <h1 className="heading-md">
              Non-Destructive Graph Cascade Simulation
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Simulates downstream risk propagation across cross-person dependencies without modifying the persistent database.
            </p>
          </div>

          {/* Form Controls Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(240px, 2fr) minmax(160px, 1fr) auto',
            gap: '12px',
            alignItems: 'flex-end',
            padding: '12px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div>
              <span className="field-label">Target Commitment (Delay Trigger):</span>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                disabled={simulating || safeCommitments.length === 0}
                aria-label="Target commitment"
              >
                {safeCommitments.length === 0 ? (
                  <option value="">No commitments available</option>
                ) : (
                  safeCommitments.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.owner}: {c.deliverable || c.action} (Due: {c.deadline || 'N/A'})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <span className="field-label">Hypothetical Slippage:</span>
              <select
                value={scenarioDays}
                onChange={(e) => setScenarioDays(Number(e.target.value))}
                disabled={simulating}
                aria-label="Hypothetical slippage days"
              >
                <option value={1}>+1 Day Delay</option>
                <option value={2}>+2 Days Delay (Critical)</option>
                <option value={5}>+5 Days Delay (Breach)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-primary"
                onClick={handleRunSimulation}
                disabled={simulating || !targetId}
                style={{ height: '32px' }}
              >
                {simulating ? <Loader2 size={13} className="spin" /> : <Sliders size={13} />}
                <span>{simulating ? 'Computing...' : 'Run Simulation'}</span>
              </button>

              {simulationResult && (
                <button
                  className="btn-secondary"
                  onClick={handleReset}
                  style={{ height: '32px' }}
                  title="Reset simulation"
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="error-inline">
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Empty State before simulation ── */}
      {!simulationResult && !simulating && (
        <div className="panel">
          <div className="empty-state">
            <div className="empty-state-icon">
              <Sliders size={22} color="var(--accent)" />
            </div>
            <div className="empty-state-title">Ready for counterfactual simulation</div>
            <div className="empty-state-desc">
              Select a prerequisite deliverable above and click "Run Simulation" to model how delays cascade through downstream promises.
            </div>
          </div>
        </div>
      )}

      {/* ── Simulation Results Display ── */}
      {simulationResult && (
        <div className="flex-col-gap-4">
          {/* Cascade Table */}
          <div className="panel">
            <div className="panel-header">
              <div className="flex-row-gap-2">
                <ShieldAlert size={14} color="var(--risk-high)" />
                <span className="panel-header-title">Downstream Cascade Propagation</span>
              </div>
              <span className="data-value" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {simulationResult.cascade.length} commitment(s) impacted in the chain
              </span>
            </div>

            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cascade Depth</th>
                    <th>Affected Deliverable</th>
                    <th>Owner</th>
                    <th>Original Risk</th>
                    <th>Simulated Risk</th>
                    <th>Risk Delta</th>
                    <th>Impact Status</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResult.cascade.map((item) => {
                    const origLevel = item.original_risk_level || 'LOW';
                    const newLevel = item.new_risk_level || 'HIGH';
                    const delta = (item.new_risk_score || 0) - (item.original_risk_score || 0);

                    const origClass = origLevel === 'HIGH' ? 'badge-high' : origLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low';
                    const newClass = newLevel === 'HIGH' ? 'badge-high' : newLevel === 'MEDIUM' ? 'badge-medium' : 'badge-low';

                    return (
                      <tr key={item.commitment_id}>
                        <td className="data-value" style={{ color: 'var(--text-tertiary)' }}>
                          {item.depth === 0 ? 'Trigger (Root)' : `Step +${item.depth}`}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.commitment_action}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.owner_name}</span>
                        </td>
                        <td>
                          <span className={`badge ${origClass}`}>
                            {origLevel} ({item.original_risk_score.toFixed(2)})
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${newClass}`}>
                            {newLevel} ({item.new_risk_score.toFixed(2)})
                          </span>
                        </td>
                        <td className="data-value" style={{ fontWeight: 600, color: delta > 0 ? 'var(--risk-high)' : 'var(--text-tertiary)' }}>
                          +{delta.toFixed(2)}
                        </td>
                        <td>
                          <span className={`badge ${newClass}`}>
                            {item.depth === 0 ? 'Delayed Source' : 'Cascading Risk'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Recommended Mitigation Action */}
          {simulationResult.recommendation && (
            <div className="panel risk-stripe-accent">
              <div className="panel-header">
                <div className="flex-row-gap-2">
                  <ShieldCheck size={14} color="var(--accent)" />
                  <span className="panel-header-title">Synthesized Mitigation Plan</span>
                </div>
                <span className="data-value" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Target: <strong style={{ color: 'var(--text-primary)' }}>{simulationResult.recommendation.target_person}</strong>
                </span>
              </div>

              <div className="panel-body flex-col-gap-3">
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {simulationResult.recommendation.description}
                </div>

                {simulationResult.recommendation.draft_message && (
                  <div>
                    <span className="label-caps" style={{ display: 'block', marginBottom: '6px' }}>
                      Proposed Preemptive Message (Requires Human Approval):
                    </span>
                    <div style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-canvas)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11.5px',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap'
                    }}>
                      "{simulationResult.recommendation.draft_message}"
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                  <button
                    className="btn-primary"
                    onClick={() => onOpenApproval(simulationResult.recommendation)}
                  >
                    <Check size={13} />
                    <span>Approve &amp; Dispatch Draft Message</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
