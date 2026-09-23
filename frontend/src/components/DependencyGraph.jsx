import React, { useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Handle, 
  Position 
} from '@xyflow/react';
import { User, AlertCircle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

// Custom Node for Commitments
function CommitmentNode({ data }) {
  const isHigh = data.risk_level === 'HIGH';
  const isMed = data.risk_level === 'MEDIUM';

  const glowClass = isHigh ? 'glow-high pulse-alert' : isMed ? 'glow-medium' : 'glow-low';
  const badgeColor = isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)';
  const badgeBg = isHigh ? 'var(--risk-high-bg)' : isMed ? 'var(--risk-medium-bg)' : 'var(--risk-low-bg)';

  return (
    <div className={`glass-panel ${glowClass}`} style={{
      padding: '16px',
      width: '280px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderWidth: '2px'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#38bdf8', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: '#38bdf8', width: 8, height: 8 }} />

      {/* Top Header: Deliverable & Risk Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: 1.2 }}>
          {data.deliverable || data.label}
        </div>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          color: badgeColor,
          background: badgeBg,
          border: `1px solid ${badgeColor}`,
          whiteSpace: 'nowrap'
        }}>
          {data.risk_level} ({data.risk_score ? data.risk_score.toFixed(2) : '0.00'})
        </span>
      </div>

      {/* Owner -> Recipient */}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <User size={12} color="var(--accent-blue)" />
        <span><strong>{data.owner}</strong> &rarr; {data.recipient}</span>
      </div>

      {/* Deadline & Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        paddingTop: '6px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        color: 'var(--text-dim)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} />
          <span>Due: <strong>{data.deadline || 'Unspecified'}</strong></span>
        </div>
        <span style={{ color: 'var(--accent-cyan)' }}>
          {Math.round((data.confidence || 0.9) * 100)}% conf
        </span>
      </div>

      <div style={{
        marginTop: '8px',
        fontSize: '0.68rem',
        textAlign: 'center',
        color: 'var(--text-dim)',
        background: 'rgba(0,0,0,0.2)',
        padding: '3px',
        borderRadius: '4px'
      }}>
        Click node to inspect evidence
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#38bdf8', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: '#38bdf8', width: 8, height: 8 }} />
    </div>
  );
}

// Custom Node for People
function PersonNode({ data }) {
  const isClient = data.role && data.role.toLowerCase().includes('client');

  return (
    <div className="glass-panel" style={{
      padding: '12px 18px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      border: isClient ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-color)',
      background: isClient ? 'rgba(245, 158, 11, 0.08)' : 'rgba(15, 23, 42, 0.85)'
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#818cf8', width: 6, height: 6 }} />
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: isClient ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '0.8rem',
        color: '#ffffff'
      }}>
        {data.label.charAt(0)}
      </div>
      <div>
        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: '0.68rem', color: isClient ? 'var(--risk-medium)' : 'var(--text-dim)' }}>
          {data.role || 'Member'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#818cf8', width: 6, height: 6 }} />
    </div>
  );
}

export default function DependencyGraph({ graphData, onSelectCommitment }) {
  const nodeTypes = useMemo(() => ({
    commitmentNode: CommitmentNode,
    personNode: PersonNode
  }), []);

  const handleNodeClick = (event, node) => {
    if (node.type === 'commitmentNode') {
      onSelectCommitment(node.id);
    }
  };

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div style={{
        height: '540px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        gap: '12px'
      }}>
        <ShieldAlert size={36} color="var(--text-dim)" />
        <p style={{ fontSize: '0.9rem' }}>No graph data loaded. Upload a chat export to build the commitment graph.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '580px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <ReactFlow
        nodes={graphData.nodes}
        edges={graphData.edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background color="#1e293b" gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
