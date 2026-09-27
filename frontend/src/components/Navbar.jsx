import React from 'react';
import { 
  Network, 
  GitFork, 
  AlertTriangle, 
  Sliders, 
  Cpu, 
  Upload, 
  ListChecks, 
  LayoutDashboard,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  backendOnline, 
  onOpenIngest, 
  activeConversation 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'commitments', label: 'Commitments', icon: ListChecks },
    { id: 'graph', label: 'Dependency Graph', icon: Network },
    { id: 'risks', label: 'Risk Center', icon: AlertTriangle },
    { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
    { id: 'benchmark', label: 'AMD ROCm Benchmark', icon: Cpu, badge: 'AMD' },
  ];

  return (
    <header style={{
      width: '100%',
      backgroundColor: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border-main)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 50
    }}>
      {/* Top Utility Bar */}
      <div style={{
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {/* Brand & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            backgroundColor: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
            color: '#ffffff'
          }}>
            <GitFork size={16} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              PromiseOS
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', borderLeft: '1px solid var(--border-main)', paddingLeft: '8px' }}>
              Autonomous Commitment Graph & Risk Cascade Engine
            </span>
          </div>
        </div>

        {/* Right actions: Thread info + System status + Ingest Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeConversation && (
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-main)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)'
            }}>
              Thread: {activeConversation.title || activeConversation.id.slice(0, 8)}
            </span>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: backendOnline ? 'var(--risk-low)' : 'var(--risk-high)',
            backgroundColor: backendOnline ? 'var(--risk-low-bg)' : 'var(--risk-high-bg)',
            border: `1px solid ${backendOnline ? 'var(--risk-low-border)' : 'var(--risk-high-border)'}`,
            padding: '2px 8px',
            borderRadius: 'var(--radius-xs)'
          }}>
            {backendOnline ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
            <span>{backendOnline ? 'API Connected' : 'API Offline'}</span>
          </div>

          <button className="btn-primary" onClick={onOpenIngest}>
            <Upload size={13} />
            <span>Import Transcript</span>
          </button>
        </div>
      </div>

      {/* Classic Horizontal Tab Strip */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        backgroundColor: 'var(--bg-panel)',
        gap: '2px'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                border: 'none',
                borderRadius: '0',
                backgroundColor: 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '12px',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.15s ease'
              }}
            >
              <Icon size={14} color={isActive ? 'var(--primary-hover)' : 'var(--text-dim)'} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="badge-classic badge-rocm" style={{ fontSize: '9px', padding: '1px 4px' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
