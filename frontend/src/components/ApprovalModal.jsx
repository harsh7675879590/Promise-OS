import React, { useState } from 'react';
import { X, ShieldAlert, Check, Copy, AlertCircle, Send } from 'lucide-react';
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
      setStatusMessage('Mitigation approved! The follow-up draft has been locked and copied to your clipboard.');
      navigator.clipboard.writeText(recommendation.draft_message);
      setCopied(true);
      if (onApproved) onApproved(recommendation.id);
      setTimeout(() => {
        setSubmitting(false);
        onClose();
      }, 1500);
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
      background: 'rgba(5, 7, 12, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="glass-panel-elevated" style={{
        width: '100%',
        maxWidth: '580px',
        padding: '28px',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={18} color="var(--risk-medium)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Human-in-the-Loop Review</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              PromiseOS Safety Gate: Autonomous agents never auto-dispatch external communications.
            </div>
          </div>
        </div>

        {/* Action Type & Description */}
        <div style={{
          marginTop: '16px',
          padding: '14px',
          borderRadius: '8px',
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Action Strategy
            </span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.12)',
              color: 'var(--accent-blue)',
              textTransform: 'uppercase'
            }}>
              {recommendation.action_type || 'FOLLOW_UP'}
            </span>
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 500 }}>
            {recommendation.description}
          </div>
        </div>

        {/* Draft Message */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Drafted Follow-up Message (Target: {recommendation.target_person_name || 'Stakeholder'})
            </label>
            <button
              onClick={handleCopy}
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? 'var(--risk-low)' : 'var(--accent-blue)',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div style={{
            padding: '14px',
            borderRadius: '8px',
            background: 'rgba(10, 15, 26, 0.95)',
            border: '1px solid #334155',
            color: '#e2e8f0',
            fontSize: '0.88rem',
            lineHeight: 1.5,
            fontFamily: 'system-ui',
            whiteSpace: 'pre-wrap'
          }}>
            {recommendation.draft_message}
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div style={{
          marginTop: '16px',
          padding: '10px 14px',
          borderRadius: '6px',
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: 'var(--accent-blue)'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            Clicking "Approve & Draft" saves the approval in the immutable audit log and copies the text. No message is sent to external chats.
          </span>
        </div>

        {statusMessage && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'var(--risk-low-bg)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: 'var(--risk-low)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Check size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button className="btn-secondary" onClick={handleDismiss} disabled={submitting}>
            Dismiss
          </button>
          <button className="btn-primary" onClick={handleApprove} disabled={submitting}>
            <Check size={16} />
            <span>Approve & Draft Follow-up</span>
          </button>
        </div>
      </div>
    </div>
  );
}
