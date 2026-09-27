import React, { useState } from 'react';
import { X, ShieldAlert, Check, Copy, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

export default function ApprovalModal({ isOpen, onClose, recommendation, onApproved }) {
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="classic-panel" style={{
        width: '100%',
        maxWidth: '560px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Title Bar */}
        <div className="classic-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span>HUMAN-IN-THE-LOOP APPROVAL GATE</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="classic-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              Safety Gate: Autonomous dispatch is strictly prohibited
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              The system synthesizes mitigations, but requires explicit human approval before any action is confirmed or dispatched.
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
              <span style={{ color: 'var(--text-dim)' }}>ACTION TYPE: </span>
              <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>
                {recommendation.action_type || 'FOLLOW_UP'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>TARGET PERSON: </span>
              <strong style={{ color: 'var(--text-main)' }}>
                {recommendation.target_person || 'Participant'}
              </strong>
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Agent Rationale:
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-main)' }}>
              {recommendation.description}
            </div>
          </div>

          {/* Draft Message Preview */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Proposed Message:
              </span>
              <button
                className="btn-secondary"
                onClick={handleCopy}
                style={{ fontSize: '10px', padding: '1px 6px' }}
              >
                {copied ? <Check size={11} color="var(--risk-low)" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <div style={{
              padding: '10px 12px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-main)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap'
            }}>
              "{recommendation.draft_message}"
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: 'var(--risk-low-bg)',
              border: '1px solid var(--risk-low-border)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--risk-low)',
              fontSize: '11px'
            }}>
              {statusMessage}
            </div>
          )}

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              className="btn-danger"
              onClick={handleDismiss}
              disabled={submitting}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              Dismiss Recommendation
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
                <span>Approve & Copy Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
