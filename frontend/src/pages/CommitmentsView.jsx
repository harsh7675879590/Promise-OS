import React, { useState } from 'react';
import { Search, Filter, Clock, User, ShieldAlert, ArrowRight, Sliders } from 'lucide-react';

export default function CommitmentsView({ commitments, onOpenEvidence, onOpenWhatIf }) {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');

  const filtered = commitments.filter((c) => {
    const matchesSearch = 
      c.action.toLowerCase().includes(search.toLowerCase()) ||
      c.owner.toLowerCase().includes(search.toLowerCase()) ||
      c.recipient.toLowerCase().includes(search.toLowerCase()) ||
      (c.deliverable && c.deliverable.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter = filterLevel === 'ALL' || c.risk_level === filterLevel;

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Structured Commitments</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Extracted autonomously from raw chat streams with confidence scores & deadlines.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="Search deliverables or owners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none',
                width: '240px'
              }}
            />
          </div>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="HIGH">High Risk Only</option>
            <option value="MEDIUM">Medium Risk Only</option>
            <option value="LOW">Low Risk Only</option>
          </select>
        </div>
      </div>

      {/* Commitments Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-dim)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Deliverable / Action</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Owner &rarr; Recipient</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Deadline</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Confidence</th>
              <th style={{ padding: '14px 20px', fontWeight: 600 }}>Deterministic Risk</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((c) => {
                const isHigh = c.risk_level === 'HIGH';
                const isMed = c.risk_level === 'MEDIUM';
                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {c.deliverable || c.action}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        "{c.action}"
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                        {c.owner}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        to {c.recipient}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                        <Clock size={14} />
                        <span>{c.deadline || 'Unspecified'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {Math.round((c.confidence || 0.85) * 100)}%
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        color: isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)',
                        background: isHigh ? 'var(--risk-high-bg)' : isMed ? 'var(--risk-medium-bg)' : 'var(--risk-low-bg)',
                        border: `1px solid ${isHigh ? 'var(--risk-high)' : isMed ? 'var(--risk-medium)' : 'var(--risk-low)'}`
                      }}>
                        {c.risk_level} ({c.risk_score?.toFixed(2) || '0.00'})
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => onOpenEvidence(c.id)}
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          Evidence
                        </button>
                        <button
                          className="btn-rocm"
                          onClick={() => onOpenWhatIf(c.id)}
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        >
                          <Sliders size={13} />
                          <span>Simulate</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No commitments match current search filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
