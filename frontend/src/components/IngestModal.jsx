import React, { useState, useEffect } from 'react';
import { X, FileText, ArrowRight, Loader2, Check, Upload, Sparkles, Cpu } from 'lucide-react';
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

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
      const conv = await api.createConversation(title, 'whatsapp');
      setStage('Running Extraction & Entity Resolution Agents...');

      const res = await api.ingest(conv.conversation_id, rawText);
      setStage('Constructing graph & evaluating cascade risks...');

      setTimeout(() => {
        setLoading(false);
        onIngestSuccess(conv.conversation_id);
        onClose();
      }, 400);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Ingestion failed. Please check backend connection.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !loading) onClose(); }}>
      <div className="modal-window" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Modal Window Header */}
        <div className="panel-header">
          <div className="flex-row-gap-2">
            <Upload size={14} color="var(--accent)" />
            <span id="modal-title" className="panel-header-title">Import Conversation Transcript</span>
          </div>
          <button
            className="btn-icon"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="panel-body flex-col-gap-3">
          <div>
            <h2 className="heading-sm">
              Autonomous 5-Agent Pipeline Ingestion
            </h2>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Paste WhatsApp or Email transcripts. The multi-agent engine parses commitments, cross-person dependencies, and computes deterministic cascading risk.
            </p>
          </div>

          {/* Quick Demo Template Box */}
          <div style={{
            padding: '8px 12px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-main)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Sample Benchmark Scenario
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                Client &harr; Harshit quotation blocked by Amit's pricing delay
              </div>
            </div>
            <button className="btn-secondary" onClick={handleLoadDemo} style={{ fontSize: '11px', padding: '3px 8px' }}>
              Load Sample
            </button>
          </div>

          {/* Form Fields */}
          <div>
            <label className="field-label" htmlFor="thread-title">Conversation Title:</label>
            <input
              id="thread-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="raw-transcript">Raw Transcript Messages:</label>
            <textarea
              id="raw-transcript"
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="[Mon 10:02] Client: Can you send the revised quotation by Friday?..."
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                resize: 'vertical'
              }}
              disabled={loading}
            />
          </div>

          {/* Error Notice */}
          {error && (
            <div className="error-inline">
              <span>{error}</span>
            </div>
          )}

          {/* Status & Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '4px'
          }}>
            <div className="data-value" style={{ fontSize: '11px', color: loading ? 'var(--accent)' : 'var(--rocm)' }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Loader2 size={12} className="spin" />
                  <span>{stage}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Cpu size={12} />
                  <span>AMD ROCm Accelerated</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-secondary" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleIngest} disabled={loading}>
                {loading ? <Loader2 size={13} className="spin" /> : <ArrowRight size={13} />}
                <span>{loading ? 'Processing...' : 'Run Pipeline'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
