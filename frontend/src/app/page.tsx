"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import { AppHeader } from "@/components/AppHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { ResultStrip } from "@/components/ResultStrip";
import { TopologyCanvas } from "@/components/TopologyCanvas";
import { NodeInspector } from "@/components/NodeInspector";
import { MathTelemetryPanel } from "@/components/MathTelemetryPanel";
import { CommandDock } from "@/components/CommandDock";
import { RepairModal } from "@/components/RepairModal";
import { SAMPLE_TOPOLOGIES, TopologyPreset } from "@/lib/sample-topologies";
import {
  Topology,
  TopologyNode,
  TopologyEdge,
  AnalyzeTopologyResponse,
  SuggestRepairsResponse,
  RepairCandidate,
} from "@/lib/types";
import { analyzeTopology, suggestRepairs, ApiError } from "@/lib/api";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function WorkspacePage() {
  // Initial default topology
  const defaultPreset = SAMPLE_TOPOLOGIES[0];

  const [sourceNodeId, setSourceNodeId] = useState<string>(
    defaultPreset.topology.source_node_id
  );
  const [sinkNodeId, setSinkNodeId] = useState<string>(
    defaultPreset.topology.sink_node_id
  );

  // Failure parameters
  const [failureK, setFailureK] = useState<number>(1);
  const [failureMode, setFailureMode] = useState<"at_most" | "exact">("at_most");

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Selection
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);

  // Analysis & Repair state
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTopologyResponse | null>(null);
  const [repairResult, setRepairResult] = useState<SuggestRepairsResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Session history
  const [history, setHistory] = useState<
    Array<{ timestamp: string; k: number; result: AnalyzeTopologyResponse }>
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load a preset topology into React Flow nodes and edges
  const loadPreset = useCallback((preset: TopologyPreset) => {
    const top = preset.topology;
    setSourceNodeId(top.source_node_id);
    setSinkNodeId(top.sink_node_id);
    setAnalysisResult(null);
    setRepairResult(null);
    setSelectedNode(null);

    // Calculate nice grid/dag layout positions
    const newNodes: Node[] = top.nodes.map((n, idx) => {
      let x = 100 + (idx % 3) * 220;
      let y = 100 + Math.floor(idx / 3) * 160;

      if (n.id === top.source_node_id) {
        x = 50;
        y = 200;
      } else if (n.id === top.sink_node_id) {
        x = 650;
        y = 200;
      }

      return {
        id: n.id,
        type: "customNode",
        position: { x, y },
        data: {
          id: n.id,
          label: n.label || n.id,
          tier: n.tier,
          capacity: n.capacity,
          failure_prob: n.failure_prob,
        },
      };
    });

    const newEdges: Edge[] = top.edges.map((e, idx) => ({
      id: e.id || `e-${idx}`,
      source: e.source,
      target: e.target,
      data: {
        capacity: e.capacity,
        spectral_weight: e.spectral_weight,
      },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
    setSuccessToast(`Loaded preset: ${preset.name}`);
  }, [setNodes, setEdges]);

  // Initial load
  useEffect(() => {
    loadPreset(defaultPreset);
  }, [loadPreset, defaultPreset]);

  // Construct current Topology model from canvas state
  const getCurrentTopology = useCallback((): Topology => {
    const topNodes: TopologyNode[] = nodes.map((n) => {
      const d = n.data as any;
      return {
        id: n.id,
        label: d.label,
        tier: d.tier,
        capacity: d.capacity,
        failure_prob: d.failure_prob ?? 0.01,
      };
    });

    const topEdges: TopologyEdge[] = edges.map((e) => {
      const d = (e.data as any) || {};
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        capacity: d.capacity ?? 10.0,
        spectral_weight: d.spectral_weight ?? 1.0,
      };
    });

    return {
      nodes: topNodes,
      edges: topEdges,
      source_node_id: sourceNodeId,
      sink_node_id: sinkNodeId,
    };
  }, [nodes, edges, sourceNodeId, sinkNodeId]);

  // Run SMT Analysis against FastAPI backend
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    try {
      const top = getCurrentTopology();
      const res = await analyzeTopology(top, {
        failure_k: failureK,
        failure_mode: failureMode,
      });
      setAnalysisResult(res);
      setHistory((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          k: failureK,
          result: res,
        },
        ...prev.slice(0, 9),
      ]);
      setSuccessToast(
        res.verification.status === "UNSAT"
          ? `Verified! System resilient to ${failureK} node failure(s).`
          : `Counterexample found: ${res.verification.counterexample_nodes.join(", ") || "cut partition"}`
      );
    } catch (err: any) {
      setErrorMessage(err.detail || err.message || "Failed to execute analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run Proof-to-Repair synthesis against FastAPI backend
  const handleSuggestRepairs = async () => {
    setIsRepairing(true);
    setErrorMessage(null);
    try {
      const top = getCurrentTopology();
      const res = await suggestRepairs(top, failureK);
      setRepairResult(res);
      setIsRepairModalOpen(true);
    } catch (err: any) {
      setErrorMessage(err.detail || err.message || "Failed to synthesize repairs.");
    } finally {
      setIsRepairing(false);
    }
  };

  // Connect new edge
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (connection.source === connection.target) {
        setErrorMessage("Self-loops are disallowed in topological routing.");
        return;
      }
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `e-${connection.source}->${connection.target}`,
            data: { capacity: 20.0, spectral_weight: 1.5 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Add new node to canvas
  const handleAddNode = useCallback(
    (id: string, label: string) => {
      if (nodes.some((n) => n.id === id)) {
        setErrorMessage(`Node with ID '${id}' already exists.`);
        return;
      }
      const newNode: Node = {
        id,
        type: "customNode",
        position: { x: 300 + Math.random() * 50, y: 200 + Math.random() * 50 },
        data: {
          id,
          label,
          capacity: 25.0,
          failure_prob: 0.01,
        },
      };
      setNodes((nds) => [...nds, newNode]);
      setSuccessToast(`Node '${id}' created.`);
    },
    [nodes, setNodes]
  );

  // Click node to inspect
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const d = node.data as any;
      setSelectedNode({
        id: node.id,
        label: d.label,
        tier: d.tier,
        capacity: d.capacity,
        failure_prob: d.failure_prob,
      });
    },
    []
  );

  // Update node in canvas
  const handleUpdateNode = useCallback(
    (updated: TopologyNode) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === updated.id) {
            return {
              ...n,
              data: {
                ...n.data,
                label: updated.label,
                capacity: updated.capacity,
                failure_prob: updated.failure_prob,
              },
            };
          }
          return n;
        })
      );
      setSelectedNode(updated);
    },
    [setNodes]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (id: string) => {
      if (id === sourceNodeId || id === sinkNodeId) {
        setErrorMessage("Cannot delete active Source or Sink node.");
        return;
      }
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNode(null);
      setSuccessToast(`Deleted node '${id}'.`);
    },
    [sourceNodeId, sinkNodeId, setNodes, setEdges]
  );

  // Apply synthesized repair to canvas
  const handleApplyRepair = useCallback(
    (candidate: RepairCandidate) => {
      for (const added of candidate.added_edges) {
        const edgeId = added.id || `repair-${added.source}->${added.target}`;
        setEdges((eds) => [
          ...eds.filter((e) => e.id !== edgeId),
          {
            id: edgeId,
            source: added.source,
            target: added.target,
            data: {
              capacity: added.capacity,
              spectral_weight: added.spectral_weight,
            },
          },
        ]);
      }
      setSuccessToast(
        `Applied verified repair '${candidate.candidate_id}'. Ready for re-analysis!`
      );
    },
    [setEdges]
  );

  // Export JSON
  const handleExportJSON = () => {
    const top = getCurrentTopology();
    const dataStr =
      "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(top, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "katalyst-topology.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string) as Topology;
          if (!parsed.nodes || !parsed.source_node_id || !parsed.sink_node_id) {
            throw new Error("Invalid topology schema: missing nodes or terminals.");
          }
          loadPreset({
            id: "custom-import",
            name: "Imported Topology",
            description: "Imported from local JSON definition",
            difficulty: "Resilient (k=1)",
            topology: parsed,
          });
        } catch (err: any) {
          setErrorMessage(`JSON import failed: ${err.message}`);
        }
      };
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-black text-white overflow-hidden select-none">
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJSON}
        accept=".json"
        className="hidden"
      />

      {/* Header */}
      <AppHeader
        nodeCount={nodes.length}
        edgeCount={edges.length}
        onExport={handleExportJSON}
        onImportClick={() => fileInputRef.current?.click()}
        onReset={() => loadPreset(defaultPreset)}
      />

      {/* Toasts & Error Banners */}
      {errorMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-red-950/90 border border-red-500/50 text-red-200 font-mono text-xs flex items-center space-x-2 shadow-2xl animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 font-mono text-xs flex items-center space-x-2 shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
          <button
            onClick={() => setSuccessToast(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Body Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <AppSidebar
          onLoadPreset={loadPreset}
          onAddNode={handleAddNode}
          history={history}
          onSelectHistory={(res) => setAnalysisResult(res)}
        />

        {/* Central Canvas */}
        <main className="flex-1 flex flex-col relative h-full overflow-hidden">
          <ResultStrip
            nodeCount={nodes.length}
            edgeCount={edges.length}
            data={analysisResult}
            isLoading={isAnalyzing}
            failureK={failureK}
          />

          <div className="flex-1 relative w-full h-full">
            <TopologyCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              criticalCutEdges={analysisResult?.flow.critical_cut_edges || []}
              vulnerableNodeIds={analysisResult?.verification.counterexample_nodes || []}
              sourceNodeId={sourceNodeId}
              sinkNodeId={sinkNodeId}
            />

            {/* Node Properties Drawer */}
            <NodeInspector
              node={selectedNode}
              isSource={selectedNode?.id === sourceNodeId}
              isSink={selectedNode?.id === sinkNodeId}
              onClose={() => setSelectedNode(null)}
              onUpdate={handleUpdateNode}
              onSetSource={(id) => {
                setSourceNodeId(id);
                setSuccessToast(`Source set to '${id}'`);
              }}
              onSetSink={(id) => {
                setSinkNodeId(id);
                setSuccessToast(`Sink set to '${id}'`);
              }}
              onDelete={handleDeleteNode}
            />

            {/* Bottom Command Dock */}
            <CommandDock
              failureK={failureK}
              onFailureKChange={setFailureK}
              failureMode={failureMode}
              onFailureModeChange={setFailureMode}
              onAnalyze={handleAnalyze}
              onSuggestRepairs={handleSuggestRepairs}
              isAnalyzing={isAnalyzing}
              isRepairing={isRepairing}
              hasVulnerability={analysisResult?.verification.status === "SAT"}
            />
          </div>
        </main>

        {/* Right Math Telemetry Panel */}
        <MathTelemetryPanel
          data={analysisResult}
          isLoading={isAnalyzing}
          onOpenRepair={handleSuggestRepairs}
        />
      </div>

      {/* Proof-to-Repair Modal */}
      <RepairModal
        isOpen={isRepairModalOpen}
        onClose={() => setIsRepairModalOpen(false)}
        data={repairResult}
        onApplyRepair={handleApplyRepair}
      />
    </div>
  );
}
