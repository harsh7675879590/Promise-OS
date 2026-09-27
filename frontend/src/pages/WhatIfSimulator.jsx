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
  Check
} from 'lucide-react';
import { api } from '../api/client';

export default function WhatIfSimulator({ commitments = [], selectedCommitmentId, onOpenApproval }) {
  const safeCommitments = commitments || [];
  const [targetId, setTargetId] = useState(selectedCommitmentId || (safeCommitments[1]?.id || safeCommitments[0]?.id || ''));
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [scenarioDays, setScenarioDays] = useState(2);

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

    try {
      const res = await api.simulateWhatIf(targetId, 'delayed');
      setSimulationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = () => {
    setSimulationResult(null);
  };

  const targetCommitment = safeCommitments.find(c => c && c.id === targetId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Simulation Console Header & Form */}
      <div className="classic-panel">
        <div className="classic-panel-header">
          <span>WHAT-IF COUNTERFACTUAL SIMULATOR</span>
          <span className="badge-classic badge-rocm">
            AMD ROCm In-Memory Engine
          </span>
        </div>

        <div className="classic-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              Non-Destructive Graph Cascade Simulation
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Simulates downstream risk propagation across cross-person dependencies without modifying the persistent database.
            </p>
          </div>

          {/* Form Controls Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr auto',
            gap: '12px',
            alignItems: 'flex-end',
            padding: '12px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                TARGET COMMITMENT (DELAY TRIGGER):
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                style={{ width: '100%' }}
                disabled={simulating}
              >
                {safeCommitments.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.owner}: {c.deliverable || c.action} (Due: {c.deadline || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                HYPOTHETICAL SLIPPAGE:
              </label>
              <select
                value={scenarioDays}
                onChange={(e) => setScenarioDays(Number(e.target.value))}
                style={{ width: '100%' }}
                disabled={simulating}
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
                style={{ height: '30px' }}
              >
                {simulating ? <Loader2 size={13} className="spin" /> : <Sliders size={13} />}
                <span>{simulating ? 'Computing Cascade...' : 'Execute Simulation'}</span>
              </button>

              {simulationResult && (
                <button
                  className="btn-secondary"
                  onClick={handleReset}
                  style={{ height: '30px' }}
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Results Display */}
      {simulationResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Cascade Table */}
          <div className="classic-panel">
            <div className="classic-panel-header">
              <span>DOWNSTREAM CASCADE PROPAGATION</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {simulationResult.cascade.length} commitment(s) impacted in the chain
              </span>
            </div>

            <div className="classic-table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="classic-table">
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
                  {simulationResult.cascade.map((item, idx) => {
                    const origLevel = item.original_risk_level || 'LOW';
                    const newLevel = item.new_risk_level || 'HIGH';
                    const delta = (item.new_risk_score || 0) - (item.original_risk_score || 0);

                    const origClass = origLevel === 'HIGH' ? 'badge-risk-high' : origLevel === 'MEDIUM' ? 'badge-risk-medium' : 'badge-risk-low';
                    const newClass = newLevel === 'HIGH' ? 'badge-risk-high' : newLevel === 'MEDIUM' ? 'badge-risk-medium' : 'badge-risk-low';

                    return (
                      <tr key={item.commitment_id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                          {item.depth === 0 ? 'Trigger (Root)' : `Step +${item.depth}`}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {item.commitment_action}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-muted)' }}>{item.owner_name}</span>
                        </td>
                        <td>
                          <span className={`badge-classic ${origClass}`}>
                            {origLevel} ({item.original_risk_score.toFixed(2)})
                          </span>
                        </td>
                        <td>
                          <span className={`badge-classic ${newClass}`}>
                            {newLevel} ({item.new_risk_score.toFixed(2)})
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: delta > 0 ? 'var(--risk-high)' : 'var(--text-muted)' }}>
                          +{delta.toFixed(2)}
                        </td>
                        <td>
                          <span className={`badge-classic ${newClass}`}>
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
            <div className="classic-panel" style={{ borderLeft: '3px solid var(--primary)' }}>
              <div className="classic-panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="var(--primary)" />
                  <span>SIMULATED REMEDIATION RECOMMENDATION</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Target: <strong>{simulationResult.recommendation.target_person}</strong>
                </span>
              </div>

              <div className="classic-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {simulationResult.recommendation.description}
                </div>

                {simulationResult.recommendation.draft_message && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Proposed Preemptive Message (Requires Human Approval):
                    </div>
                    <div style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border-main)',
                      borderRadius: 'var(--radius-xs)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text-main)',
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
                    <Check size={12} />
                    <span>Approve & Copy Draft Message</span>
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
