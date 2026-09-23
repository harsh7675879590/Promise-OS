import React from 'react';
import { 
  Network, 
  GitFork, 
  AlertTriangle, 
  Sliders, 
  Cpu, 
  CheckCircle, 
  UploadCloud, 
  ListChecks, 
  Layers 
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  backendOnline, 
  onOpenIngest, 
  activeConversation 
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'commitments', label: 'Commitments', icon: ListChecks },
    { id: 'graph', label: 'Dependency Graph', icon: Network },
    { id: 'risks', label: 'Risk Center', icon: AlertTriangle },
    { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
    { id: 'benchmark', label: 'AMD ROCm Benchmark', icon: Cpu, badge: 'AMD' },
  ];

  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50 }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
        }}>
          <GitFork size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              PromiseOS
            </h1>
            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(217, 70, 239, 0.15)', color: '#d946ef', border: '1px solid rgba(217, 70, 239, 0.3)', fontWeight: 600 }}>
              AMD ROCm Edition
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            The graph that knows whose promise is about to break yours
          </p>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-muted)',
                fontWeight: isActive ? '600' : '400',
                fontSize: '0.85rem',
                borderBottom: isActive ? '2px solid var(--accent-blue)' : '2px solid transparent',
                position: 'relative'
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.6rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #d946ef, #8b5cf6)',
                  color: 'white',
                  fontWeight: 700
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: backendOnline ? 'var(--risk-low)' : 'var(--risk-high)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: backendOnline ? 'var(--risk-low)' : 'var(--risk-high)',
            boxShadow: backendOnline ? '0 0 8px var(--risk-low)' : '0 0 8px var(--risk-high)'
          }} />
          <span>{backendOnline ? 'vLLM ROCm Online' : 'Connecting...'}</span>
        </div>

        {/* Load / Ingest Button */}
        <button className="btn-primary" onClick={onOpenIngest}>
          <UploadCloud size={16} />
          <span>Upload / Ingest</span>
        </button>
      </div>
    </header>
  );
}
