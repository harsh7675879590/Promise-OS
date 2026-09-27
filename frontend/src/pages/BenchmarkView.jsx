import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, Clock, Layers, Play, CheckCircle, BarChart3, Loader2 } from 'lucide-react';
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
      <div className="classic-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
        Loading benchmark harness telemetry...
      </div>
    );
  }

  const amd = benchmark.amd_gpu;
  const cpu = benchmark.cpu;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Controls Panel */}
      <div className="classic-panel">
        <div className="classic-panel-header">
          <span>HARDWARE ACCELERATION BENCHMARK</span>
          <span className="badge-classic badge-rocm">
            Lablab.ai &times; AMD AI Academy Challenge
          </span>
        </div>

        <div className="classic-panel-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>
              AMD ROCm (HIP / vLLM) vs CPU Performance Suite
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Comparative execution harness evaluating Llama 3.1 8B-Instruct inference latency and batch throughput.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Batch Size:</label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                disabled={running}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                <option value={10}>10 Prompts</option>
                <option value={50}>50 Prompts (Standard)</option>
                <option value={100}>100 Prompts (Heavy)</option>
                <option value={200}>200 Prompts (Peak)</option>
              </select>
            </div>

            <button
              className="btn-primary"
              onClick={handleRunLiveBenchmark}
              disabled={running}
              style={{ fontSize: '11px', padding: '5px 12px' }}
            >
              {running ? <Loader2 size={13} className="spin" /> : <Play size={13} />}
              <span>{running ? 'Running Benchmark...' : 'Run Live Benchmark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Highlight Card */}
      <div className="classic-panel" style={{ borderLeft: '3px solid var(--rocm-accent)' }}>
        <div className="classic-panel-header">
          <span>BENCHMARK EXECUTIVE SUMMARY</span>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--rocm-accent)' }}>
            Throughput Advantage: {benchmark.speedup_factor}x
          </span>
        </div>
        <div className="classic-panel-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
              AMD ROCm delivers a {benchmark.speedup_factor}x throughput speedup over standard CPU inference.
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {benchmark.summary}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--rocm-accent)' }}>
              {benchmark.speedup_factor}x
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
              Total Throughput Multiple
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Datasheet Table */}
      <div className="classic-table-container">
        <table className="classic-table">
          <thead>
            <tr>
              <th>Evaluation Parameter</th>
              <th>AMD GPU (ROCm / HIP)</th>
              <th>Host x86-64 CPU</th>
              <th>Speedup / Variance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ fontWeight: 600 }}>Device Architecture & Backend</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Runtime execution driver</div>
              </td>
              <td>
                <span className="badge-classic badge-rocm">{amd.device_name}</span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>vLLM + ROCm HIP Runtime</div>
              </td>
              <td>
                <span className="badge-classic badge-neutral">{cpu.device_name}</span>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>PyTorch C++ CPU Engine</div>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--rocm-accent)' }}>
                Hardware Accelerated
              </td>
            </tr>

            <tr>
              <td>
                <div style={{ fontWeight: 600 }}>Throughput (Tokens / Sec)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Total sustained generation bandwidth</div>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--risk-low)' }}>
                {amd.tokens_per_second.toFixed(1)} tok/s
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {cpu.tokens_per_second.toFixed(1)} tok/s
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--risk-low)' }}>
                +{((amd.tokens_per_second / cpu.tokens_per_second) - 1).toFixed(1)}x faster
              </td>
            </tr>

            <tr>
              <td>
                <div style={{ fontWeight: 600 }}>Latency per Token (ms)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Time to decode individual token</div>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--risk-low)' }}>
                {amd.latency_per_token_ms.toFixed(1)} ms
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {cpu.latency_per_token_ms.toFixed(1)} ms
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--risk-low)' }}>
                -{(cpu.latency_per_token_ms - amd.latency_per_token_ms).toFixed(1)} ms reduction
              </td>
            </tr>

            <tr>
              <td>
                <div style={{ fontWeight: 600 }}>Time to First Token (TTFT)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Initial prompt processing overhead</div>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                {amd.time_to_first_token_ms.toFixed(0)} ms
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {cpu.time_to_first_token_ms.toFixed(0)} ms
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--risk-low)' }}>
                {(cpu.time_to_first_token_ms / amd.time_to_first_token_ms).toFixed(1)}x lower TTFT
              </td>
            </tr>

            <tr>
              <td>
                <div style={{ fontWeight: 600 }}>Batch Elapsed Time ({benchmark.batch_size} Prompts)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Full batch commitment graph parsing duration</div>
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                {amd.total_time_seconds.toFixed(2)}s
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {cpu.total_time_seconds.toFixed(2)}s
              </td>
              <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--risk-low)' }}>
                {benchmark.speedup_factor}x faster execution
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
