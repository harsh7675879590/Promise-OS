import React, { useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Handle, 
  Position 
} from '@xyflow/react';
import { User, AlertCircle, Clock, ShieldAlert, ArrowRight, Network } from 'lucide-react';

// Custom Enterprise Node for Commitments
function CommitmentNode({ data }) {
  const isHigh = data.risk_level === 'HIGH';
  const isMed = data.risk_level === 'MEDIUM';

  const badgeClass = isHigh ? 'badge-high' : isMed ? 'badge-medium' : 'badge-low';
  const borderColor = isHigh ? 'var(--risk-high-border)' : isMed ? 'var(--risk-medium-border)' : 'var(--border-main)';

  return (
    <div style={{
      width: '270px',
      backgroundColor: 'var(--bg-panel)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'border-color var(--transition-fast), transform var(--transition-fast)'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: 'var(--accent)', width: 6, height: 6, borderRadius: 2 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: 'var(--accent)', width: 6, height: 6, borderRadius: 2 }} />

      {/* Node Header */}
      <div style={{
        padding: '7px 10px',
        backgroundColor: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {data.deliverable || data.label}
        </div>
        <span className={`badge ${badgeClass}`} style={{ flexShrink: 0 }}>
          {data.risk_level || 'LOW'}
        </span>
      </div>

      {/* Node Body */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>{data.owner}</strong> &rarr; {data.recipient}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-tertiary)', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
          <span>Due: <strong style={{ color: 'var(--text-secondary)' }}>{data.deadline || 'Unspecified'}</strong></span>
          <span className="data-value" style={{ fontSize: '10px' }}>{Math.round((data.confidence || 0.85) * 100)}% conf</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: 'var(--accent)', width: 6, height: 6, borderRadius: 2 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: 'var(--accent)', width: 6, height: 6, borderRadius: 2 }} />
    </div>
  );
}

// Custom Node for People
function PersonNode({ data }) {
  const isClient = data.role && data.role.toLowerCase().includes('client');

  return (
    <div style={{
      padding: '7px 12px',
      backgroundColor: 'var(--bg-subtle)',
      border: `1px solid ${isClient ? 'var(--risk-medium-border)' : 'var(--border-main)'}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <Handle type="target" position={Position.Left} style={{ background: 'var(--text-tertiary)', width: 6, height: 6, borderRadius: 2 }} />
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: 'var(--radius-xs)',
        backgroundColor: isClient ? 'var(--risk-medium-bg)' : 'var(--bg-hover)',
        border: `1px solid ${isClient ? 'var(--risk-medium-border)' : 'var(--border-subtle)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '11px',
        color: isClient ? 'var(--risk-medium)' : 'var(--text-primary)'
      }}>
        {data.label ? data.label.charAt(0) : 'P'}
      </div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
          {data.role || 'Participant'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: 'var(--text-tertiary)', width: 6, height: 6, borderRadius: 2 }} />
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
      <div className="empty-state" style={{ height: '480px' }}>
        <div className="empty-state-icon">
          <Network size={22} />
        </div>
        <div className="empty-state-title">No graph data available</div>
        <div className="empty-state-desc">
          Upload or select a conversation thread to construct and visualize the commitment dependency graph.
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '540px', backgroundColor: 'var(--bg-canvas)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      <ReactFlow
        nodes={graphData.nodes}
        edges={graphData.edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background color="#1c222d" gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
