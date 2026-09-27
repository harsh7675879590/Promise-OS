import React, { useState } from 'react';
import { X, FileText, ArrowRight, Loader2, Check, Upload } from 'lucide-react';
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
      const conv = await api.createConversation(title, 'whatsapp');
      setStage('Running LangGraph: Extraction & Resolution Agents...');

      const res = await api.ingest(conv.conversation_id, rawText);
      setStage('Graph constructed, risk evaluated, mitigations synthesized!');

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
        maxWidth: '600px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Modal Window Header */}
        <div className="classic-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Upload size={14} color="var(--primary)" />
            <span>IMPORT CONVERSATION TRANSCRIPT</span>
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

        {/* Modal Body */}
        <div className="classic-panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              Autonomous 5-Agent Pipeline Ingestion
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Paste WhatsApp or Email transcripts. The engine parses commitments, cross-person dependencies, and computes deterministic cascading risk.
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
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
                Demo Benchmark Scenario
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Client &harr; Harshit quotation blocked by Amit's pricing delay
              </div>
            </div>
            <button className="btn-secondary" onClick={handleLoadDemo} style={{ fontSize: '11px', padding: '2px 8px' }}>
              Load Demo Thread
            </button>
          </div>

          {/* Form Fields */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              CONVERSATION TITLE:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%' }}
              disabled={loading}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              RAW TRANSCRIPT MESSAGES:
            </label>
            <textarea
              rows={7}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="[Mon 10:02] Client: Can you send the revised quotation by Friday?..."
              style={{
                width: '100%',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                resize: 'vertical'
              }}
              disabled={loading}
            />
          </div>

          {/* Error Notice */}
          {error && (
            <div style={{
              padding: '8px 12px',
              backgroundColor: 'var(--risk-high-bg)',
              border: '1px solid var(--risk-high-border)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--risk-high)',
              fontSize: '11px'
            }}>
              {error}
            </div>
          )}

          {/* Status & Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '6px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--rocm-accent)', fontFamily: 'var(--font-mono)' }}>
              {loading ? stage : 'AMD ROCm Accelerated'}
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
