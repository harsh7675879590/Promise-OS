import React from 'react';
import DependencyGraph from '../components/DependencyGraph';
import { Info, HelpCircle, Network } from 'lucide-react';

export default function GraphView({ graphData, onSelectCommitment }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Legend */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={20} color="var(--accent-blue)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Commitment Dependency Graph</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Derived automatically from conversational context • Directed cross-person dependency mapping
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--risk-high)', boxShadow: '0 0 8px var(--risk-high)' }} />
            <span>High Risk (&ge;0.65)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--risk-medium)' }} />
            <span>Medium (0.40 - 0.65)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--risk-low)' }} />
            <span>Low (&lt;0.40)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ borderBottom: '2px dashed #f43f5e', width: '20px', display: 'inline-block' }} />
            <span>Requires Prerequisite</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Graph */}
      <div className="glass-panel" style={{ padding: '8px' }}>
        <DependencyGraph graphData={graphData} onSelectCommitment={onSelectCommitment} />
      </div>

      {/* Explanatory callout for judges */}
      <div style={{
        padding: '12px 18px',
        borderRadius: '8px',
        background: 'rgba(56, 189, 248, 0.05)',
        border: '1px solid rgba(56, 189, 248, 0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.78rem',
        color: 'var(--text-muted)'
      }}>
        <Info size={16} color="var(--accent-blue)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Why this graph is unique:</strong> Traditional task managers only track isolated cards. PromiseOS automatically infers that Harshit's quotation promise to Client cannot be satisfied until Amit's pricing promise to Harshit is fulfilled, mathematically surfacing cascading risk before deadlines are breached.
        </span>
      </div>
    </div>
  );
}
