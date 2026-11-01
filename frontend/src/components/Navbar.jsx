import React from 'react';
import {
  LayoutGrid,
  ListChecks,
  Network,
  ShieldAlert,
  SlidersHorizontal,
  Cpu,
  Upload,
  CheckCircle2,
  XCircle,
  ChevronDown
} from 'lucide-react';

// Custom human-designed PromiseOS Logo mark
function PromiseOSLogo() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        backgroundColor: '#111827',
        border: '1px solid #1f293d',
        borderRadius: '6px',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.5)'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 18C6 11.3726 18 12.6274 18 6" stroke="#475569" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6 18C6 13 14 14 15 9" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3"/>
        <circle cx="18" cy="6" r="3.5" fill="#3b82f6"/>
        <circle cx="18" cy="6" r="1.5" fill="#ffffff"/>
        <circle cx="6" cy="18" r="3.5" fill="#ef4444"/>
        <circle cx="6" cy="18" r="1.5" fill="#ffffff"/>
        <circle cx="12" cy="12" r="1" fill="#60a5fa"/>
      </svg>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',             icon: LayoutGrid },
  { id: 'commitments',  label: 'Commitments',           icon: ListChecks },
  { id: 'graph',        label: 'Dependency Graph',      icon: Network },
  { id: 'risks',        label: 'Risk Center',           icon: ShieldAlert },
  { id: 'whatif',       label: 'What-If Simulator',     icon: SlidersHorizontal },
  { id: 'benchmark',    label: 'Benchmark & RAG',       icon: Cpu, badge: 'AMD ROCm' },
];

export default function Navbar({
  currentTab,
  setCurrentTab,
  backendOnline,
  onOpenIngest,
  conversations = [],
  activeConversationId,
  onSelectConversation
}) {
  const safeConvs = conversations || [];
  const activeConv = safeConvs.find(c => c && c.id === activeConversationId);

  return (
    <header
      role="banner"
      style={{
        width: '100%',
        backgroundColor: '#0d1117',
        borderBottom: '1px solid #21262d',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* ── Top Brand & Utility Header ── */}
      <div
        style={{
          padding: '0 20px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #161b22',
        }}
      >
        {/* Brand Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <PromiseOSLogo />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#f0f6fc',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-sans)',
              }}
            >
              PromiseOS
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#8b949e',
                paddingLeft: '8px',
                borderLeft: '1px solid #30363d',
                letterSpacing: '0.01em',
              }}
            >
              Commitment Graph &amp; Risk Cascade Engine
            </span>
          </div>
        </div>

        {/* Right Controls Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Thread Selector (Single Source of Truth) */}
          {safeConvs.length > 0 && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                value={activeConversationId}
                onChange={(e) => onSelectConversation && onSelectConversation(e.target.value)}
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-sans)',
                  color: '#c9d1d9',
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '5px',
                  padding: '4px 24px 4px 10px',
                  maxWidth: '220px',
                  cursor: 'pointer',
                  appearance: 'none',
                  outline: 'none',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
                aria-label="Select active conversation thread"
              >
                {safeConvs.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.title || c.id.slice(0, 8)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                color="#8b949e"
                style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }}
              />
            </div>
          )}

          {/* Backend Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: backendOnline ? '#3fb950' : '#f85149',
              backgroundColor: backendOnline ? 'rgba(46, 160, 67, 0.1)' : 'rgba(248, 81, 73, 0.1)',
              border: `1px solid ${backendOnline ? 'rgba(46, 160, 67, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`,
              padding: '3px 8px',
              borderRadius: '4px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: backendOnline ? '#3fb950' : '#f85149',
                display: 'inline-block',
                boxShadow: backendOnline ? '0 0 6px #3fb950' : 'none'
              }}
            />
            <span>{backendOnline ? 'API Connected' : 'Backend Offline'}</span>
          </div>

          {/* Primary Action Button */}
          <button
            id="btn-import-transcript"
            className="btn-primary"
            onClick={onOpenIngest}
            style={{
              fontSize: '11.5px',
              padding: '5px 12px',
              fontWeight: 500,
              gap: '6px'
            }}
            aria-label="Import conversation transcript"
          >
            <Upload size={13} strokeWidth={2.2} />
            <span>Import Transcript</span>
          </button>
        </div>
      </div>

      {/* ── Polished Human-Designed Tab Navigation Bar ── */}
      <nav
        role="navigation"
        aria-label="Primary navigation"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          backgroundColor: '#0c1017',
          gap: '4px',
          overflowX: 'auto',
          height: '38px',
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
                gap: '7px',
                padding: '5px 11px',
                height: '28px',
                border: isActive ? '1px solid #30363d' : '1px solid transparent',
                borderRadius: '5px',
                backgroundColor: isActive ? '#1c2128' : 'transparent',
                color: isActive ? '#f0f6fc' : '#8b949e',
                fontWeight: isActive ? 600 : 450,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 120ms ease-in-out',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#161b22';
                  e.currentTarget.style.color = '#c9d1d9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#8b949e';
                }
              }}
            >
              <Icon
                size={13}
                strokeWidth={isActive ? 2.2 : 1.8}
                color={isActive ? '#58a6ff' : '#8b949e'}
              />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '9.5px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    backgroundColor: isActive ? 'rgba(88, 166, 255, 0.15)' : '#21262d',
                    color: isActive ? '#58a6ff' : '#8b949e',
                    border: '1px solid',
                    borderColor: isActive ? 'rgba(88, 166, 255, 0.3)' : '#30363d',
                  }}
                >
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
