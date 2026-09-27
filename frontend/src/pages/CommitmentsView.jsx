import React, { useState } from 'react';
import { Search, Filter, Clock, User, ShieldAlert, ArrowRight, Sliders, ExternalLink } from 'lucide-react';

export default function CommitmentsView({ commitments = [], onOpenEvidence, onOpenWhatIf }) {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Controls Bar */}
      <div className="classic-panel">
        <div className="classic-panel-header">
          <span>COMMITMENT REGISTER</span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {safeCommitments.length} commitments
          </span>
        </div>
        
        <div className="classic-panel-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
            <Search size={14} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by deliverable, owner, recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={12} />
              <span>Risk:</span>
            </label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>

            <label style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="open">Open</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="at_risk">At Risk</option>
            </select>

            {(search || filterLevel !== 'ALL' || filterStatus !== 'ALL') && (
              <button
                className="btn-secondary"
                onClick={() => { setSearch(''); setFilterLevel('ALL'); setFilterStatus('ALL'); }}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Classic Enterprise Table */}
      <div className="classic-table-container">
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
            No commitments match the selected criteria.
          </div>
        ) : (
          <table className="classic-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>ID</th>
                <th>Deliverable & Action</th>
                <th>Owner</th>
                <th>Recipient</th>
                <th>Deadline</th>
                <th>Confidence</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => {
                const isHigh = c.risk_level === 'HIGH';
                const isMed = c.risk_level === 'MEDIUM';
                const badgeClass = isHigh ? 'badge-risk-high' : isMed ? 'badge-risk-medium' : 'badge-risk-low';

                return (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                      #{idx + 1}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>
                        {c.deliverable || c.action}
                      </div>
                      {c.action && c.deliverable && c.action !== c.deliverable && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          "{c.action}"
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.owner}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>{c.recipient}</span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {c.deadline || 'Unspecified'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {Math.round((c.confidence || 0.85) * 100)}%
                    </td>
                    <td>
                      <span className={`badge-classic ${badgeClass}`}>
                        {c.risk_level || 'LOW'}
                      </span>
                    </td>
                    <td>
                      <span className="badge-classic badge-neutral" style={{ textTransform: 'capitalize' }}>
                        {c.status || 'open'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-secondary"
                          onClick={() => onOpenEvidence(c.id)}
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                          title="Inspect supporting chat evidence & anti-hallucination citations"
                        >
                          Evidence
                        </button>
                        <button
                          className="btn-primary"
                          onClick={() => onOpenWhatIf(c.id)}
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                          title="Simulate delay impact on dependent commitments"
                        >
                          Simulate
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
