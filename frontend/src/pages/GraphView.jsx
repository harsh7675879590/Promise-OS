import React from 'react';
import DependencyGraph from '../components/DependencyGraph';
import { Info, HelpCircle, Network, GitFork } from 'lucide-react';

export default function GraphView({ graphData, onSelectCommitment, loading = false }) {
  return (
    <div className="page-container">
      {/* ── Header & Interactive Legend ── */}
      <div className="panel">
        <div className="panel-header">
          <div className="flex-row-gap-2">
            <GitFork size={14} color="var(--accent)" />
            <span className="panel-header-title">Dependency Topology Map</span>
          </div>
          
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'var(--risk-high)', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>High Risk (&ge;0.65)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'var(--risk-medium)', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Medium (0.40 - 0.65)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'var(--risk-low)', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Low (&lt;0.40)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ borderBottom: '2px dashed var(--risk-high)', width: '16px', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Blocks / Prerequisite</span>
            </div>
          </div>
        </div>

        <div className="panel-body">
          <h1 className="heading-md">
            Commitment Dependency Directed Acyclic Graph (DAG)
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Topological relationship graph synthesized from conversation context. Click any commitment node to inspect citations, timestamps, and deterministic risk parameters.
          </p>
        </div>
      </div>

      {/* ── Main Interactive Graph Box ── */}
      <div className="panel" style={{ padding: '6px' }}>
        {loading ? (
          <div style={{ height: '540px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton" style={{ width: '90%', height: '80%' }} />
          </div>
        ) : (
          <DependencyGraph graphData={graphData} onSelectCommitment={onSelectCommitment} />
        )}
      </div>

      {/* ── Explanatory Callout ── */}
      <div className="alert-info" style={{ fontSize: '11.5px' }}>
        <Info size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Cascading Chain Logic:</strong> PromiseOS tracks multi-party commitments to detect cross-person dependencies where Person A cannot deliver until Person B completes their prerequisite commitment. Latent delivery bottlenecks are surfaced before deadlines pass.
        </div>
      </div>
    </div>
  );
}
