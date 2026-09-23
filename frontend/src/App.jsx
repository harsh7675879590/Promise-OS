import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import IngestModal from './components/IngestModal';
import EvidenceDrawer from './components/EvidenceDrawer';
import ApprovalModal from './components/ApprovalModal';

import Dashboard from './pages/Dashboard';
import CommitmentsView from './pages/CommitmentsView';
import GraphView from './pages/GraphView';
import RiskCenter from './pages/RiskCenter';
import WhatIfSimulator from './pages/WhatIfSimulator';
import BenchmarkView from './pages/BenchmarkView';

import { api } from './api/client';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [backendOnline, setBackendOnline] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState('');
  
  const [commitments, setCommitments] = useState([]);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [risks, setRisks] = useState([]);

  // Modals & Drawers state
  const [isIngestOpen, setIsIngestOpen] = useState(false);
  const [selectedCommitmentId, setSelectedCommitmentId] = useState(null);
  const [evidenceCommitmentData, setEvidenceCommitmentData] = useState(null);
  const [activeRecommendation, setActiveRecommendation] = useState(null);
  const [whatIfTargetId, setWhatIfTargetId] = useState(null);

  // Poll backend health & load initial dataset
  useEffect(() => {
    checkHealthAndInit();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // When active conversation changes, reload its artifacts
  useEffect(() => {
    if (activeConversationId) {
      loadConversationData(activeConversationId);
    }
  }, [activeConversationId]);

  const checkHealth = async () => {
    try {
      await api.checkHealth();
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  };

  const checkHealthAndInit = async () => {
    try {
      await api.checkHealth();
      setBackendOnline(true);
      const convs = await api.listConversations();
      setConversations(convs);

      if (convs && convs.length > 0) {
        setActiveConversationId(convs[0].id);
      } else {
        // If brand new, open Ingest modal so user can load demo WhatsApp export with one click
        setIsIngestOpen(true);
      }
    } catch (err) {
      console.warn('Backend not yet reachable on http://localhost:8000', err);
      setBackendOnline(false);
    }
  };

  const loadConversationData = async (convId) => {
    try {
      const [comms, graph, riskList] = await Promise.all([
        api.listCommitments(convId),
        api.getGraph(convId),
        api.listRisks(convId)
      ]);
      setCommitments(comms || []);
      setGraphData(graph || { nodes: [], edges: [] });
      setRisks(riskList || []);
    } catch (err) {
      console.error('Failed to load conversation data:', err);
    }
  };

  const handleIngestSuccess = async (newConvId) => {
    const convs = await api.listConversations();
    setConversations(convs);
    setActiveConversationId(newConvId);
    await loadConversationData(newConvId);
    setCurrentTab('graph'); // Take user straight to the graph!
  };

  const handleOpenEvidence = async (commitmentId) => {
    try {
      const details = await api.getCommitment(commitmentId);
      setEvidenceCommitmentData(details);
      setSelectedCommitmentId(commitmentId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenWhatIf = (commitmentId) => {
    setWhatIfTargetId(commitmentId);
    setCurrentTab('whatif');
  };

  const handleOpenApproval = (recommendation) => {
    setActiveRecommendation(recommendation);
  };

  const handleApprovedSuccess = () => {
    if (activeConversationId) {
      loadConversationData(activeConversationId);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        backendOnline={backendOnline}
        onOpenIngest={() => setIsIngestOpen(true)}
        activeConversation={conversations.find(c => c.id === activeConversationId)}
      />

      {/* Main Content Viewport */}
      <main style={{ flex: 1, padding: '0 24px 32px 24px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        {currentTab === 'dashboard' && (
          <Dashboard
            commitments={commitments}
            risks={risks}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
            setCurrentTab={setCurrentTab}
            onOpenWhatIf={handleOpenWhatIf}
            onOpenEvidence={handleOpenEvidence}
            onOpenIngest={() => setIsIngestOpen(true)}
          />
        )}

        {currentTab === 'commitments' && (
          <CommitmentsView
            commitments={commitments}
            onOpenEvidence={handleOpenEvidence}
            onOpenWhatIf={handleOpenWhatIf}
          />
        )}

        {currentTab === 'graph' && (
          <GraphView
            graphData={graphData}
            onSelectCommitment={handleOpenEvidence}
          />
        )}

        {currentTab === 'risks' && (
          <RiskCenter
            risks={risks}
            onOpenEvidence={handleOpenEvidence}
            onOpenApproval={handleOpenApproval}
            onOpenWhatIf={handleOpenWhatIf}
          />
        )}

        {currentTab === 'whatif' && (
          <WhatIfSimulator
            commitments={commitments}
            selectedCommitmentId={whatIfTargetId}
            onOpenApproval={handleOpenApproval}
          />
        )}

        {currentTab === 'benchmark' && (
          <BenchmarkView />
        )}
      </main>

      {/* Drawers & Modals */}
      <IngestModal
        isOpen={isIngestOpen}
        onClose={() => setIsIngestOpen(false)}
        onIngestSuccess={handleIngestSuccess}
      />

      <EvidenceDrawer
        isOpen={Boolean(selectedCommitmentId && evidenceCommitmentData)}
        onClose={() => {
          setSelectedCommitmentId(null);
          setEvidenceCommitmentData(null);
        }}
        commitment={evidenceCommitmentData?.commitment}
        evidence={evidenceCommitmentData?.evidence}
        riskAssessment={evidenceCommitmentData?.risk_assessment}
        onOpenWhatIf={handleOpenWhatIf}
      />

      <ApprovalModal
        isOpen={Boolean(activeRecommendation)}
        onClose={() => setActiveRecommendation(null)}
        recommendation={activeRecommendation}
        onApproved={handleApprovedSuccess}
      />
    </div>
  );
}
