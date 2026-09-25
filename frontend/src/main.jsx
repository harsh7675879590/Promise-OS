import React, { Component } from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PromiseOS UI Caught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#07090e',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '540px',
            background: '#131a29',
            border: '1px solid #f43f5e',
            borderRadius: '12px',
            padding: '28px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#f43f5e', marginBottom: '12px', fontSize: '1.25rem' }}>
              PromiseOS Rendering Safeguard
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
              The application encountered an unexpected render issue. Click below to reload the session.
            </p>
            <div style={{
              background: '#0a0f1a',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: '#fb7185',
              fontFamily: 'monospace',
              textAlign: 'left',
              marginBottom: '20px',
              overflowX: 'auto'
            }}>
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reload PromiseOS
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
