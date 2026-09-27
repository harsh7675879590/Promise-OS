import React, { useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Handle, 
  Position 
} from '@xyflow/react';
import { User, AlertCircle, Clock, ShieldAlert, ArrowRight } from 'lucide-react';

// Custom Classic Node for Commitments (Structured like a classic workflow/database entity)
function CommitmentNode({ data }) {
  const isHigh = data.risk_level === 'HIGH';
  const isMed = data.risk_level === 'MEDIUM';

  const badgeClass = isHigh ? 'badge-risk-high' : isMed ? 'badge-risk-medium' : 'badge-risk-low';
  const borderColor = isHigh ? 'var(--risk-high-border)' : isMed ? 'var(--risk-medium-border)' : 'var(--border-main)';

  return (
    <div style={{
      width: '260px',
      backgroundColor: 'var(--bg-panel)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      cursor: 'pointer'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#58a6ff', width: 6, height: 6, borderRadius: 2 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: '#58a6ff', width: 6, height: 6, borderRadius: 2 }} />

      {/* Node Header */}
      <div style={{
        padding: '6px 10px',
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
          color: 'var(--text-main)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {data.deliverable || data.label}
        </div>
        <span className={`badge-classic ${badgeClass}`} style={{ flexShrink: 0 }}>
          {data.risk_level || 'LOW'}
        </span>
      </div>

      {/* Node Body */}
      <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-main)' }}>{data.owner}</strong> &rarr; {data.recipient}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-dim)', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
          <span>Due: <strong>{data.deadline || 'Unspecified'}</strong></span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{Math.round((data.confidence || 0.85) * 100)}% conf</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ background: '#58a6ff', width: 6, height: 6, borderRadius: 2 }} />
      <Handle type="source" position={Position.Right} id="right" style={{ background: '#58a6ff', width: 6, height: 6, borderRadius: 2 }} />
    </div>
  );
}

// Custom Classic Node for People
function PersonNode({ data }) {
  const isClient = data.role && data.role.toLowerCase().includes('client');

  return (
    <div style={{
      padding: '6px 12px',
      backgroundColor: 'var(--bg-subtle)',
      border: `1px solid ${isClient ? 'var(--risk-medium-border)' : 'var(--border-main)'}`,
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#8b949e', width: 6, height: 6, borderRadius: 2 }} />
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: 'var(--radius-xs)',
        backgroundColor: isClient ? 'var(--risk-medium-bg)' : 'var(--bg-hover)',
        border: `1px solid ${isClient ? 'var(--risk-medium-border)' : 'var(--border-main)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '10px',
        color: isClient ? 'var(--risk-medium)' : 'var(--text-main)'
      }}>
        {data.label.charAt(0)}
      </div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
          {data.label}
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
          {data.role || 'Participant'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#8b949e', width: 6, height: 6, borderRadius: 2 }} />
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
        height: '520px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        gap: '10px'
      }}>
        <ShieldAlert size={32} color="var(--text-dim)" />
        <p style={{ fontSize: '12px' }}>No graph data loaded. Upload a chat export to construct the commitment graph.</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '540px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
      <ReactFlow
        nodes={graphData.nodes}
        edges={graphData.edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
      >
        <Background color="#21262d" gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
