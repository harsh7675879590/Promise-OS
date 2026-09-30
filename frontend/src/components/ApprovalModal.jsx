import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Check, Copy, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

export default function ApprovalModal({ isOpen, onClose, recommendation, onApproved }) {
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen || !recommendation) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(recommendation.draft_message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await api.approveRecommendation(recommendation.id, 'lead_user');
      setStatusMessage('Mitigation approved! The follow-up draft has been confirmed and copied to clipboard.');
      navigator.clipboard.writeText(recommendation.draft_message);
      setCopied(true);
      if (onApproved) onApproved(recommendation.id);
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setStatusMessage('Approval failed to record on server.');
      setSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    setSubmitting(true);
    try {
      await api.dismissRecommendation(recommendation.id, 'lead_user');
      if (onApproved) onApproved(recommendation.id);
      setSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}>
      <div className="modal-window" role="dialog" aria-modal="true" aria-labelledby="approval-title">
        {/* Title Bar */}
        <div className="panel-header">
          <div className="flex-row-gap-2">
            <ShieldCheck size={14} color="var(--accent)" />
            <span id="approval-title" className="panel-header-title">Human-in-the-Loop Safety Gate</span>
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="panel-body flex-col-gap-3">
          <div>
            <h2 className="heading-sm">
              Safety Verification &amp; Dispatch Authority
            </h2>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              PromiseOS policy enforces that autonomous recommendations are never dispatched without explicit human sign-off.
            </p>
          </div>

          {/* Target & Action Metadata */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '11px'
          }}>
            <div>
              <span className="label-caps" style={{ fontSize: '9.5px', display: 'block' }}>Action Type:</span>
              <strong style={{ color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                {recommendation.action_type || 'FOLLOW_UP'}
              </strong>
            </div>
            <div>
              <span className="label-caps" style={{ fontSize: '9.5px', display: 'block' }}>Target Recipient:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {recommendation.target_person || 'Participant'}
              </strong>
            </div>
          </div>

          {/* Description */}
          {recommendation.description && (
            <div>
              <span className="label-caps" style={{ display: 'block', marginBottom: '4px' }}>Agent Rationale:</span>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {recommendation.description}
              </div>
            </div>
          )}

          {/* Draft Message Preview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span className="label-caps">Proposed Message:</span>
              <button
                className="btn-ghost"
                onClick={handleCopy}
                style={{ fontSize: '10.5px', padding: '2px 6px' }}
              >
                {copied ? <Check size={11} color="var(--risk-low)" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <div style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap'
            }}>
              "{recommendation.draft_message}"
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="success-inline">
              <Check size={14} style={{ flexShrink: 0 }} />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '4px'
          }}>
            <button
              className="btn-danger"
              onClick={handleDismiss}
              disabled={submitting}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Dismiss
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleApprove}
                disabled={submitting}
              >
                <Check size={13} />
                <span>Approve &amp; Copy Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
