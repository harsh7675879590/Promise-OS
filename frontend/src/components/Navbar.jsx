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
  XCircle,
  Radio
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',         icon: LayoutDashboard },
  { id: 'commitments',  label: 'Commitments',        icon: ListChecks },
  { id: 'graph',        label: 'Dependency Graph',   icon: Network },
  { id: 'risks',        label: 'Risk Center',        icon: AlertTriangle },
  { id: 'whatif',       label: 'What-If Simulator',  icon: Sliders },
  { id: 'benchmark',    label: 'AMD ROCm Benchmark', icon: Cpu, badge: 'AMD' },
];

export default function Navbar({ currentTab, setCurrentTab, backendOnline, onOpenIngest, activeConversation }) {
  return (
    <header
      role="banner"
      style={{
        width: '100%',
        backgroundColor: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border-main)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* ── Top utility bar ── */}
      <div style={{
        padding: '0 20px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '26px',
            height: '26px',
            backgroundColor: 'var(--accent)',
            borderRadius: 'var(--radius-sm)',
            color: '#fff',
            flexShrink: 0,
          }}>
            <GitFork size={14} strokeWidth={2.2} />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              PromiseOS
            </span>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              paddingLeft: '8px',
              borderLeft: '1px solid var(--border-subtle)',
            }}>
              Commitment Graph &amp; Risk Cascade Engine
            </span>
          </div>
        </div>

        {/* Right cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Active thread chip */}
          {activeConversation && (
            <span style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-tertiary)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-main)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-xs)',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
              title={activeConversation.title}
            >
              {activeConversation.title || activeConversation.id.slice(0, 8)}
            </span>
          )}

          {/* System status indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: backendOnline ? 'var(--risk-low)' : 'var(--risk-high)',
            backgroundColor: backendOnline ? 'var(--risk-low-bg)' : 'var(--risk-high-bg)',
            border: `1px solid ${backendOnline ? 'var(--risk-low-border)' : 'var(--risk-high-border)'}`,
            padding: '3px 9px',
            borderRadius: 'var(--radius-xs)',
          }}>
            {backendOnline
              ? <CheckCircle2 size={11} strokeWidth={2.5} />
              : <XCircle size={11} strokeWidth={2.5} />
            }
            <span>{backendOnline ? 'API Online' : 'API Offline'}</span>
          </div>

          {/* Import CTA */}
          <button
            id="btn-import-transcript"
            className="btn-primary"
            onClick={onOpenIngest}
            aria-label="Import conversation transcript"
          >
            <Upload size={12} strokeWidth={2.5} />
            <span>Import Transcript</span>
          </button>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <nav
        role="navigation"
        aria-label="Primary navigation"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          padding: '0 12px',
          backgroundColor: 'var(--bg-panel)',
          gap: '0',
          overflowX: 'auto',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0 12px',
                height: '38px',
                border: 'none',
                borderRadius: 0,
                backgroundColor: 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '12px',
                borderBottom: isActive
                  ? '2px solid var(--accent)'
                  : '2px solid transparent',
                marginBottom: '-1px',
                cursor: 'pointer',
                transition: 'color var(--transition-fast), border-color var(--transition-fast)',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <Icon
                size={13}
                strokeWidth={isActive ? 2.2 : 1.8}
                color={isActive ? 'var(--accent-hover)' : 'currentColor'}
              />
              <span>{item.label}</span>
              {item.badge && (
                <span className="badge badge-rocm" style={{ fontSize: '9px', padding: '1px 4px' }}>
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
