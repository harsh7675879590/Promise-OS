import React, { useState } from 'react';
import { Search, Filter, Clock, User, ShieldAlert, ArrowRight, Sliders, ExternalLink, Inbox, RotateCcw } from 'lucide-react';

export default function CommitmentsView({ commitments = [], onOpenEvidence, onOpenWhatIf, loading = false }) {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const safeCommitments = commitments || [];
  const query = (search || '').toLowerCase();

  const filtered = safeCommitments.filter((c) => {
    if (!c) return false;
    const matchesSearch = 
      (c.action || '').toLowerCase().includes(query) ||
      (c.owner || '').toLowerCase().includes(query) ||
      (c.recipient || '').toLowerCase().includes(query) ||
      (c.deliverable || '').toLowerCase().includes(query);

    const matchesFilter = filterLevel === 'ALL' || (c.risk_level || 'LOW') === filterLevel;
    const matchesStatus = filterStatus === 'ALL' || (c.status || 'open').toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesFilter && matchesStatus;
  });

  const hasActiveFilters = search || filterLevel !== 'ALL' || filterStatus !== 'ALL';

  const resetFilters = () => {
    setSearch('');
    setFilterLevel('ALL');
    setFilterStatus('ALL');
  };

  return (
    <div className="page-container">
      {/* ── Header & Filter Controls Bar ── */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-header-title">Commitment Register</span>
          <span className="data-value" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Showing {filtered.length} of {safeCommitments.length} commitments
          </span>
        </div>
        
        <div className="panel-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="search"
                placeholder="Filter by deliverable, owner, recipient, or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '32px' }}
                aria-label="Filter commitments"
              />
              <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="label-caps" style={{ fontSize: '10px' }}>Risk:</span>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                style={{ width: 'auto', minWidth: '120px' }}
                aria-label="Filter by risk level"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="label-caps" style={{ fontSize: '10px' }}>Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: 'auto', minWidth: '110px' }}
                aria-label="Filter by status"
              >
                <option value="ALL">All Statuses</option>
                <option value="open">Open</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
                <option value="at_risk">At Risk</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                className="btn-ghost"
                onClick={resetFilters}
                style={{ fontSize: '11px', padding: '5px 8px' }}
                title="Reset all filters"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Inbox size={22} />
            </div>
            <div className="empty-state-title">No commitments found</div>
            <div className="empty-state-desc">
              {hasActiveFilters
                ? 'No commitments match the search and filter criteria. Try broadening your query.'
                : 'No commitments currently exist in this thread.'}
            </div>
            {hasActiveFilters && (
              <button className="btn-secondary" onClick={resetFilters} style={{ marginTop: '8px' }}>
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Deliverable &amp; Commitment</th>
                <th>Parties (Owner &rarr; Recipient)</th>
                <th>Deadline</th>
                <th>Confidence</th>
                <th>Risk Level</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const isHigh = c.risk_level === 'HIGH';
                const isMed = c.risk_level === 'MEDIUM';
                const badgeClass = isHigh ? 'badge-high' : isMed ? 'badge-medium' : 'badge-low';
                const confPercent = Math.round((c.confidence || 0.85) * 100);

                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {c.deliverable || c.action}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        ID: <span className="data-value">{c.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.owner}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>&rarr;</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{c.recipient}</span>
                      </div>
                    </td>
                    <td>
                      <span className="data-value" style={{ color: 'var(--text-secondary)' }}>
                        {c.deadline || 'Unspecified'}
                      </span>
                    </td>
                    <td>
                      <span className="data-value" style={{ color: confPercent >= 80 ? 'var(--text-primary)' : 'var(--risk-medium)' }}>
                        {confPercent}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${badgeClass}`}>
                        {c.risk_level || 'LOW'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => onOpenEvidence(c.id)}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                          title="Inspect evidence citations and deterministic risk breakdown"
                        >
                          Evidence
                        </button>
                        <button
                          className="btn-ghost"
                          onClick={() => onOpenWhatIf(c.id)}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                          title="Simulate delay in What-If engine"
                        >
                          <Sliders size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
