import React, { useState } from 'react';
import { X, Sparkles, FileText, ArrowRight, Loader2, Check } from 'lucide-react';
import { api } from '../api/client';

const DEMO_TRANSCRIPT = `[Mon 10:02] Client: Can you send the revised quotation by Friday?
[Mon 10:03] Harshit: Yes, I'll send it.
[Mon 10:15] Harshit: Amit, I need the updated pricing to finish the quote.
[Mon 10:20] Amit: I'll send Harshit the updated pricing tomorrow.
[Wed 09:00] Harshit: Amit, did you send the pricing?
[Wed 09:41] Amit: Not yet, will do it today.`;

export default function IngestModal({ isOpen, onClose, onIngestSuccess }) {
  const [title, setTitle] = useState('Client Quotation & Pricing Dependency Thread');
  const [rawText, setRawText] = useState(DEMO_TRANSCRIPT);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleLoadDemo = () => {
    setTitle('Client Quotation & Pricing Dependency Thread');
    setRawText(DEMO_TRANSCRIPT);
    setError(null);
  };

  const handleIngest = async () => {
    if (!rawText.trim()) {
      setError('Please provide conversation text to parse.');
      return;
    }

    setLoading(true);
    setError(null);
    setStage('Initializing conversation container...');

    try {
      // 1. Create conversation record
      const conv = await api.createConversation(title, 'whatsapp');
      setStage('Running LangGraph: Extraction Agent parsing commitments...');

      // 2. Run LangGraph pipeline
      const res = await api.ingest(conv.conversation_id, rawText);
      setStage('Graph constructed, risk evaluated, mitigations synthesized!');

      setTimeout(() => {
        setLoading(false);
        onIngestSuccess(conv.conversation_id);
        onClose();
      }, 500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ingestion failed. Please check backend connection.');
      setLoading(false);
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
        maxWidth: '640px',
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

        {/* Modal Title */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={20} color="var(--accent-blue)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Ingest Conversation Transcript</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Upload raw WhatsApp or email export. The 5-Agent pipeline extracts commitments, builds the dependency graph, and deterministically computes cascading risk.
          </p>
        </div>

        {/* Quick Demo Button */}
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-blue)' }}>
              Lablab.ai × AMD Demo Scenario
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Harshit ↔ Client quotation chain blocked by Amit's pricing slip
            </div>
          </div>
          <button className="btn-secondary" onClick={handleLoadDemo} style={{ fontSize: '0.78rem', padding: '6px 12px' }}>
            Fill Demo Data
          </button>
        </div>

        {/* Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
              Conversation Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
              Raw Messages (WhatsApp / Email format)
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="[Mon 10:02] Client: Can you send the revised quotation by Friday?..."
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div style={{
            marginTop: '14px',
            padding: '10px 14px',
            borderRadius: '6px',
            background: 'var(--risk-high-bg)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            color: '#fb7185',
            fontSize: '0.82rem'
          }}>
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{
          marginTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-rocm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {loading ? (
              <>
                <Loader2 size={16} className="pulse-alert" />
                <span>{stage}</span>
              </>
            ) : (
              <span>⚡ AMD ROCm acceleration ready</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn-primary" onClick={handleIngest} disabled={loading}>
              {loading ? <Loader2 size={16} className="pulse-alert" /> : <ArrowRight size={16} />}
              <span>{loading ? 'Processing...' : 'Run Pipeline'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
