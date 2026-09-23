import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Clock, Layers, Play, CheckCircle, BarChart3 } from 'lucide-react';
import { api } from '../api/client';

export default function BenchmarkView() {
  const [benchmark, setBenchmark] = useState(null);
  const [running, setRunning] = useState(false);
  const [batchSize, setBatchSize] = useState(50);

  useEffect(() => {
    loadBaseline();
  }, []);

  const loadBaseline = async () => {
    try {
      const data = await api.getBenchmark();
      setBenchmark(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunLiveBenchmark = async () => {
    setRunning(true);
    try {
      const data = await api.runBenchmark(batchSize);
      setBenchmark(data);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  if (!benchmark) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
        Loading AMD ROCm benchmark metrics...
      </div>
    );
  }

  const amd = benchmark.amd_gpu;
  const cpu = benchmark.cpu;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Live Benchmark Runner */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Cpu size={22} color="var(--accent-rocm)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>AMD ROCm vs CPU Benchmark Suite</h2>
            <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(217, 70, 239, 0.15)', color: '#d946ef', border: '1px solid rgba(217, 70, 239, 0.3)', fontWeight: 600 }}>
              vLLM HIP Acceleration
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Comparing Llama 3.1 8B-Instruct inference performance on AMD GPU (ROCm) vs High-End x86-64 CPU.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Batch Size:</label>
            <select
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            >
              <option value={25}>25 Prompts</option>
              <option value={50}>50 Prompts</option>
              <option value={100}>100 Prompts</option>
            </select>
          </div>

          <button className="btn-rocm" onClick={handleRunLiveBenchmark} disabled={running}>
            {running ? <Activity size={16} className="pulse-alert" /> : <Play size={16} />}
            <span>{running ? 'Benchmarking...' : 'Run Live Benchmark'}</span>
          </button>
        </div>
      </div>

      {/* Top Hero Speedup Gauge */}
      <div className="glass-panel glow-rocm" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-rocm)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Benchmark Verdict
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
            AMD ROCm delivers a {benchmark.speedup_factor}x throughput speedup
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {benchmark.summary}
          </p>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '16px 28px',
          borderRadius: '12px',
          background: 'rgba(217, 70, 239, 0.1)',
          border: '1px solid rgba(217, 70, 239, 0.3)'
        }}>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#d946ef', lineHeight: 1 }}>
            {benchmark.speedup_factor}x
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Acceleration Factor
          </div>
        </div>
      </div>

      {/* Side-by-side Comparative Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* AMD ROCm Card */}
        <div className="glass-panel glow-rocm" style={{ padding: '24px', borderLeftWidth: '4px', borderLeftColor: '#d946ef' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#d946ef', textTransform: 'uppercase' }}>
                PRIMARY INFERENCE PATH
              </span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>AMD GPU (ROCm vLLM)</h4>
            </div>
            <Zap size={22} color="#d946ef" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Throughput</span>
                <span style={{ fontWeight: 700, color: '#d946ef' }}>{amd.tokens_per_second} tokens/sec</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #d946ef, #8b5cf6)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Latency (p50 / median)</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{amd.latency_p50_ms} ms</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(amd.latency_p50_ms / cpu.latency_p50_ms) * 100}%`, height: '100%', background: '#10b981' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Latency (p95 / tail)</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{amd.latency_p95_ms} ms</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(amd.latency_p95_ms / cpu.latency_p95_ms) * 100}%`, height: '100%', background: '#10b981' }} />
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.8rem',
              color: 'var(--text-dim)'
            }}>
              <span>Batch ({benchmark.batch_size} prompts) Total:</span>
              <strong style={{ color: 'var(--text-main)' }}>{amd.batch_total_time_s}s</strong>
            </div>
          </div>
        </div>

        {/* CPU Benchmark Card */}
        <div className="glass-panel" style={{ padding: '24px', borderLeftWidth: '4px', borderLeftColor: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                BASELINE COMPARISON PATH
              </span>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>x86-64 CPU (16 Cores)</h4>
            </div>
            <Clock size={22} color="#64748b" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Throughput</span>
                <span style={{ fontWeight: 700, color: 'var(--text-dim)' }}>{cpu.tokens_per_second} tokens/sec</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(cpu.tokens_per_second / amd.tokens_per_second) * 100}%`, height: '100%', background: '#64748b' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Latency (p50 / median)</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cpu.latency_p50_ms} ms</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'rgba(244, 63, 94, 0.4)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Latency (p95 / tail)</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{cpu.latency_p95_ms} ms</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'rgba(244, 63, 94, 0.4)' }} />
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.8rem',
              color: 'var(--text-dim)'
            }}>
              <span>Batch ({benchmark.batch_size} prompts) Total:</span>
              <strong style={{ color: 'var(--text-main)' }}>{cpu.batch_total_time_s}s</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
