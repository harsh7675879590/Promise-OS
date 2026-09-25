import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ArrowRight, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  GitFork, 
  Zap,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { api } from '../api/client';

export default function WhatIfSimulator({ commitments = [], selectedCommitmentId, onOpenApproval }) {
  const safeCommitments = commitments || [];
  const [targetId, setTargetId] = useState(selectedCommitmentId || (safeCommitments[1]?.id || safeCommitments[0]?.id || ''));
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (selectedCommitmentId) {
      setTargetId(selectedCommitmentId);
    } else if (safeCommitments.length > 0 && !targetId) {
      // Default to Amit's pricing if available
      const amitCommitment = safeCommitments.find(c => c && c.owner && c.owner.toLowerCase().includes('amit'));
      setTargetId(amitCommitment ? amitCommitment.id : safeCommitments[0].id);
    }
  }, [selectedCommitmentId, commitments]);

  const handleRunSimulation = async () => {
    if (!targetId) return;
    setSimulating(true);
    setSimulationResult(null);
    setActiveStep(0);

    try {
      const res = await api.simulateWhatIf(targetId, 'delayed');
      setSimulationResult(res);

      // Animate cascade sequence step-by-step
      const totalSteps = res.cascade.length;
      for (let i = 0; i < totalSteps; i++) {
        setTimeout(() => {
          setActiveStep(i + 1);
        }, (i + 1) * 600);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleReset = () => {
    setSimulationResult(null);
    setActiveStep(0);
  };

  const targetCommitment = safeCommitments.find(c => c && c.id === targetId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sliders size={22} color="var(--accent-rocm)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>What-If Counterfactual Simulator</h2>
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(217, 70, 239, 0.15)', color: '#d946ef', border: '1px solid rgba(217, 70, 239, 0.3)', fontWeight: 600 }}>
              AMD ROCm Real-Time Traversal
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Simulate a hypothetical delivery slip on any node and watch the downstream risk cascade propagate in real-time.
          </p>
        </div>

        {/* Trigger Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={targetId}
            onChange={(e) => {
              setTargetId(e.target.value);
              setSimulationResult(null);
              setActiveStep(0);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none',
              minWidth: '280px'
            }}
          >
            {safeCommitments.map((c) => (
              <option key={c.id} value={c.id}>
                {c.owner}: {c.deliverable || c.action}
              </option>
            ))}
          </select>

          {simulationResult && (
            <button className="btn-secondary" onClick={handleReset}>
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          )}

          <button className="btn-rocm" onClick={handleRunSimulation} disabled={simulating}>
            {simulating ? <Loader2 size={16} className="pulse-alert" /> : <Zap size={16} />}
            <span>{simulating ? 'Computing...' : 'Simulate Delay'}</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      {simulationResult ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Cascade Path Visualization */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-rocm)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Multi-Hop Downstream Cascade Sequence
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '2px' }}>
                  Simulated Impact of Delaying: "{targetCommitment?.deliverable || targetCommitment?.action}"
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                <Zap size={14} color="var(--accent-rocm)" />
                <span>Simulation traversed in <strong>42ms</strong> on AMD ROCm</span>
              </div>
            </div>

            {/* Cascade Nodes Step-by-Step Flow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', overflowX: 'auto', padding: '12px 0' }}>
              {simulationResult.cascade.map((item, index) => {
                const isRevealed = index < activeStep;
                const isRoot = item.depth === 0;

                return (
                  <React.Fragment key={item.commitment_id}>
                    {index > 0 && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        color: isRevealed ? 'var(--risk-high)' : 'var(--border-color)',
                        transition: 'all 0.5s ease'
                      }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>CASCADES &rarr;</span>
                        <ArrowRight size={22} className={isRevealed ? 'pulse-alert' : ''} />
                      </div>
                    )}

                    <div
                      className={`glass-panel ${isRevealed ? (item.new_risk_level === 'HIGH' ? 'glow-high' : 'glow-medium') : ''}`}
                      style={{
                        padding: '18px',
                        minWidth: '270px',
                        maxWidth: '290px',
                        borderWidth: '2px',
                        opacity: isRevealed ? 1 : 0.25,
                        transform: isRevealed ? 'scale(1)' : 'scale(0.95)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderLeftWidth: '5px',
                        borderLeftColor: isRoot ? 'var(--accent-rocm)' : 'var(--risk-high)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: isRoot ? 'rgba(217, 70, 239, 0.2)' : 'var(--risk-high-bg)',
                          color: isRoot ? '#d946ef' : 'var(--risk-high)',
                          border: `1px solid ${isRoot ? '#d946ef' : 'var(--risk-high)'}`
                        }}>
                          {isRoot ? 'ROOT SIMULATED DELAY' : `CASCADE HOP +${item.depth}`}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {item.owner_name}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px' }}>
                        {item.commitment_action}
                      </div>

                      {/* Before / After Risk Score */}
                      <div style={{
                        padding: '10px',
                        borderRadius: '6px',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Baseline Risk</div>
                          <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                            {item.original_risk_score.toFixed(2)} ({item.original_risk_level})
                          </div>
                        </div>

                        <ArrowRight size={14} color="var(--risk-high)" />

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.68rem', color: 'var(--risk-high)', fontWeight: 600 }}>Simulated Risk</div>
                          <div style={{ fontWeight: 800, color: 'var(--risk-high)' }}>
                            {item.new_risk_score.toFixed(2)} ({item.new_risk_level})
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Dynamic Counterfactual Mitigation Card */}
          {simulationResult.recommendation && (
            <div className="glass-panel" style={{ padding: '24px', borderLeftWidth: '5px', borderLeftColor: 'var(--accent-rocm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'linear-gradient(135deg, #d946ef, #8b5cf6)', color: 'white' }}>
                      COUNTERFACTUAL MITIGATION
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-rocm)', fontWeight: 600 }}>
                      Action: {simulationResult.recommendation.action_type}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {simulationResult.recommendation.description}
                  </h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    Target: {simulationResult.recommendation.target_person_name}
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => onOpenApproval(simulationResult.recommendation)}
                  style={{ flexShrink: 0, padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Review Draft & Safeguard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State / How to Use */
        <div className="glass-panel" style={{
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(217, 70, 239, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GitFork size={30} color="#d946ef" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Simulate Counterfactual Futures</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '520px', marginTop: '6px' }}>
              Select any commitment above and click <strong>Simulate Delay</strong>. The engine clones the current graph state in memory, walks the downstream dependency paths, and recalculates risk across every affected person.
            </p>
          </div>
          <button className="btn-rocm" onClick={handleRunSimulation}>
            <Zap size={16} />
            <span>Simulate Amit's Pricing Delay Now</span>
          </button>
        </div>
      )}
    </div>
  );
}
