import React from 'react';
import DependencyGraph from '../components/DependencyGraph';
import { Info, HelpCircle, Network } from 'lucide-react';

export default function GraphView({ graphData, onSelectCommitment }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Legend */}
      <div className="classic-panel">
        <div className="classic-panel-header">
          <span>DEPENDENCY TOPOLOGY</span>
          {/* Classic Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'var(--risk-high)', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-muted)' }}>High Risk (&ge;0.65)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'var(--risk-medium)', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-muted)' }}>Medium (0.40 - 0.65)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '1px', backgroundColor: 'var(--risk-low)', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-muted)' }}>Low (&lt;0.40)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ borderBottom: '2px dashed var(--risk-high)', width: '16px', display: 'inline-block' }} />
              <span style={{ color: 'var(--text-muted)' }}>Blocks / Prerequisite</span>
            </div>
          </div>
        </div>

        <div className="classic-panel-body" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              Commitment Dependency Directed Graph
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Topological relationship map derived from natural language context • Click any commitment node to view evidence
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph Box */}
      <div className="classic-panel" style={{ padding: '6px' }}>
        <DependencyGraph graphData={graphData} onSelectCommitment={onSelectCommitment} />
      </div>

      {/* Explanatory callout for judges */}
      <div style={{
        padding: '10px 14px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-main)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        fontSize: '11px',
        color: 'var(--text-muted)'
      }}>
        <Info size={14} color="var(--info-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          <strong style={{ color: 'var(--text-main)' }}>Cascading Chain Logic:</strong> PromiseOS parses multi-party conversations and identifies cross-person dependencies where Person A cannot deliver until Person B finishes their prerequisite promise. This surfaces latent delivery bottlenecks before deadlines pass.
        </span>
      </div>
    </div>
  );
}
