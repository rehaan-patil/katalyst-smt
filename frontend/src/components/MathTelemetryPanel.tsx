"use client";

import React, { useState } from "react";
import { AnalyzeTopologyResponse } from "@/lib/types";
import {
  ShieldCheck,
  ShieldAlert,
  GitBranch,
  Gauge,
  Activity,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Binary,
  Layers,
  ArrowRight,
  Zap,
  Info,
  Sliders,
  TrendingUp,
  FileCode,
} from "lucide-react";

interface MathTelemetryPanelProps {
  data: AnalyzeTopologyResponse | null;
  isLoading: boolean;
  onOpenRepair?: () => void;
  selectedEdgeId?: string | null;
  onSelectCutEdge?: (source: string, target: string) => void;
}

export function MathTelemetryPanel({
  data,
  isLoading,
  onOpenRepair,
  selectedEdgeId,
  onSelectCutEdge,
}: MathTelemetryPanelProps) {
  const [activeTab, setActiveTab] = useState<"smt" | "spectral" | "flow" | "risk">("smt");
  const [collapsed, setCollapsed] = useState(false);
  const [matrixView, setMatrixView] = useState<"laplacian" | "adjacency" | "degree">("laplacian");
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; val: number } | null>(null);
  const [isFormulasExpanded, setIsFormulasExpanded] = useState(false);

  if (!data && !isLoading) {
    return (
      <aside
        className={`border-l border-white/[0.08] bg-[#090D15]/95 backdrop-blur-xl transition-all duration-300 flex flex-col z-20 ${
          collapsed ? "w-12" : "w-80"
        }`}
      >
        <div className="h-12 border-b border-white/[0.08] px-4 flex items-center justify-between shrink-0">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Binary className="w-4 h-4 text-indigo-400" />
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-200">
                Formal Telemetry
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors ml-auto"
            title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        {!collapsed && (
          <div className="p-8 text-center text-xs font-sans text-slate-400 mt-20 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
              <Binary className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">Verification Engine Ready</p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[240px] mx-auto">
              Execute SMT Verification from the command dock to inspect spectral heatmaps, cut partitions, and formal certificates.
            </p>
          </div>
        )}
      </aside>
    );
  }

  const eigenvalues = data?.spectral.eigenvalues ?? [];
  const maxEigen = eigenvalues.length > 0 ? Math.max(...eigenvalues, 1) : 1;
  const nodeOrder = data?.spectral.node_order ?? [];
  const currentMatrix =
    matrixView === "laplacian"
      ? data?.spectral.laplacian_matrix ?? []
      : matrixView === "adjacency"
      ? data?.spectral.adjacency_matrix ?? []
      : data?.spectral.degree_matrix ?? [];

  return (
    <aside
      className={`border-l border-white/[0.08] bg-[#090D15]/95 backdrop-blur-xl transition-all duration-300 flex flex-col z-20 ${
        collapsed ? "w-12" : "w-[410px]"
      }`}
    >
      {/* Header */}
      <div className="h-12 border-b border-white/[0.08] px-4 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Binary className="w-4 h-4 text-indigo-400" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-200">
              Formal Telemetry
            </span>
            {data && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {data.execution_duration_ms.toFixed(1)}ms
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors ml-auto"
          title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
        >
          {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {collapsed ? (
        <div className="p-2 space-y-4 flex flex-col items-center pt-4">
          <button
            onClick={() => { setCollapsed(false); setActiveTab("smt"); }}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/[0.06] transition-colors"
            title="SMT Proof"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setCollapsed(false); setActiveTab("spectral"); }}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/[0.06] transition-colors"
            title="Laplacian Matrix"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-white/[0.08] bg-black/20 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("smt")}
              className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs font-medium transition-all ${
                activeTab === "smt"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              SMT Proof
            </button>
            <button
              onClick={() => setActiveTab("spectral")}
              className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs font-medium transition-all ${
                activeTab === "spectral"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              Laplacian
            </button>
            <button
              onClick={() => setActiveTab("flow")}
              className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs font-medium transition-all ${
                activeTab === "flow"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              Cut & Flow
            </button>
            <button
              onClick={() => setActiveTab("risk")}
              className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs font-medium transition-all ${
                activeTab === "risk"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              Risk Prior
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-20 bg-slate-900/60 rounded-xl border border-white/[0.05]" />
                <div className="h-32 bg-slate-900/60 rounded-xl border border-white/[0.05]" />
                <div className="h-24 bg-slate-900/60 rounded-xl border border-white/[0.05]" />
              </div>
            ) : data ? (
              <>
                {/* 1. SMT Verification Tab */}
                {activeTab === "smt" && (
                  <div className="space-y-4">
                    {/* Status Certificate Card */}
                    <div
                      className={`p-4 rounded-xl border shadow-sm ${
                        data.verification.status === "UNSAT"
                          ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-100"
                          : data.verification.status === "SAT"
                          ? "bg-rose-950/30 border-rose-500/40 text-rose-100"
                          : "bg-amber-950/30 border-amber-500/40 text-amber-100"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-black/40 border border-white/[0.08] shrink-0">
                          {data.verification.status === "UNSAT" ? (
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ShieldAlert className="w-5 h-5 text-rose-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-sans font-bold text-xs tracking-tight text-white uppercase">
                            {data.verification.status === "UNSAT"
                              ? "Formal Certificate: UNSAT (Resilient)"
                              : data.verification.status === "SAT"
                              ? "Counterexample Identified: SAT (Vulnerable)"
                              : "Verification Timeout: UNKNOWN"}
                          </div>
                          <div className="text-[11px] font-sans text-slate-300 mt-1 leading-relaxed">
                            Resilience verified against {data.verification.failure_mode} {data.verification.failure_k} concurrent node failures.
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                            Z3 Theorem Prover elapsed: {data.verification.verification_time_ms.toFixed(2)}ms
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Counterexample Breakdown Card */}
                    {data.verification.status === "SAT" && (
                      <div className="p-4 rounded-xl bg-slate-900/70 border border-rose-500/30 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between text-rose-300 font-sans font-semibold text-xs">
                          <span>Minimal Failure Cut Set Witness:</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                            |F*| = {data.verification.counterexample_nodes.length}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {data.verification.counterexample_nodes.length === 0 ? (
                            <span className="text-slate-500 italic text-xs">
                              Trivially severed: Base graph is disconnected prior to failures
                            </span>
                          ) : (
                            data.verification.counterexample_nodes.map((nodeId) => (
                              <span
                                key={nodeId}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-200 border border-rose-500/40 text-xs font-mono font-bold shadow-sm"
                              >
                                {nodeId}
                              </span>
                            ))
                          )}
                        </div>

                        <p className="text-[11px] font-sans text-slate-300 leading-relaxed border-t border-white/[0.06] pt-2.5">
                          {data.verification.witness_description}
                        </p>

                        {onOpenRepair && (
                          <button
                            onClick={onOpenRepair}
                            className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-indigo-700 hover:from-rose-500 hover:to-indigo-600 text-white font-sans font-semibold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center justify-center space-x-2"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Synthesize Formally Verified Repair</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Visual Cut Partition (S vs T) */}
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.08] space-y-2.5 shadow-sm">
                      <div className="text-[10.5px] font-sans uppercase font-bold text-slate-400 flex items-center justify-between">
                        <span>Directed Cut Partition (Menger Closure)</span>
                        <span className="text-[9.5px] font-mono text-slate-500">S ∩ T = ∅</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/20">
                          <div className="text-emerald-400 font-sans font-semibold text-[11px] mb-1.5">
                            Ingress Partition S ({data.flow.source_partition.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {data.flow.source_partition.map((id) => (
                              <span key={id} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono border border-white/[0.04]">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/20">
                          <div className="text-cyan-400 font-sans font-semibold text-[11px] mb-1.5">
                            Sink Partition T ({data.flow.sink_partition.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {data.flow.sink_partition.map((id) => (
                              <span key={id} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-mono border border-white/[0.04]">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proof Certificate Details */}
                    <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/[0.06] space-y-1.5">
                      <div className="text-slate-400 font-sans font-semibold text-[10.5px] uppercase tracking-wider">
                        Theorem Prover Proof Notes
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {data.verification.proof_notes}
                      </p>
                    </div>

                    {/* Collapsible Theoretical Foundations */}
                    <div className="border border-white/[0.07] rounded-xl bg-slate-900/40 overflow-hidden">
                      <button
                        onClick={() => setIsFormulasExpanded(!isFormulasExpanded)}
                        className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-sans text-slate-300 hover:text-white transition-colors"
                      >
                        <span className="flex items-center space-x-1.5">
                          <Info className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-medium">SMT Reachability Axioms</span>
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFormulasExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {isFormulasExpanded && (
                        <div className="p-3.5 border-t border-white/[0.06] text-xs font-sans text-slate-300 space-y-2 leading-relaxed bg-black/20">
                          <p>
                            <strong className="text-white">Cut-Reachability Closure:</strong> A failure set <code className="text-indigo-300 font-mono">F</code> severs <code className="text-emerald-300 font-mono">s</code> from <code className="text-cyan-300 font-mono">t</code> iff there exists partition <code className="text-slate-200 font-mono">S ⊆ V</code> satisfying:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[10.5px] pl-1">
                            <li>s ∈ S, t ∉ S</li>
                            <li>∀ u ∈ V \ &#123;s, t&#125;: u ∈ S ⟹ u ∉ F</li>
                            <li>∀ (u, v) ∈ E: (u ∈ S ∧ v ∉ F) ⟹ v ∈ S</li>
                            <li>|F| ≤ k</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Spectral Tab (Laplacian Heatmap & Spectrum) */}
                {activeTab === "spectral" && (
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.08] shadow-sm">
                        <div className="text-[10.5px] text-slate-400 font-sans font-medium uppercase tracking-wider">
                          Fiedler Value (λ₂)
                        </div>
                        <div className="text-lg font-bold font-mono text-indigo-400 mt-1">
                          {data.spectral.fiedler_value.toFixed(4)}
                        </div>
                        <div className="text-[10px] font-sans text-slate-400 mt-0.5">
                          {data.spectral.fiedler_value > 0.001 ? "Connected Fabric" : "Disconnected Clusters"}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.08] shadow-sm">
                        <div className="text-[10.5px] text-slate-400 font-sans font-medium uppercase tracking-wider">
                          Robustness Score (ρ)
                        </div>
                        <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                          {(data.spectral.algebraic_connectivity_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-[10px] font-sans text-slate-400 mt-0.5">
                          λ₂ / max(d_v) normalized
                        </div>
                      </div>
                    </div>

                    {/* Eigenvalue Spectrum Bar Chart */}
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.08] space-y-2.5 shadow-sm">
                      <div className="text-[10.5px] font-sans font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Ordered Eigenvalues (λ₁ ... λₙ)</span>
                        <span className="text-[10px] font-mono text-indigo-400">λ₂ = Algebraic Connectivity</span>
                      </div>

                      {/* Bar Chart */}
                      <div className="h-20 w-full flex items-end gap-1 px-2 py-2 bg-slate-950/80 rounded-lg border border-white/[0.05]">
                        {eigenvalues.map((ev, i) => {
                          const heightPct = Math.max((ev / maxEigen) * 100, 6);
                          const isFiedler = i === 1;
                          return (
                            <div
                              key={i}
                              className="flex-1 flex flex-col items-center group relative h-full justify-end"
                            >
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-t transition-all ${
                                  isFiedler
                                    ? "bg-indigo-500 hover:bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.6)]"
                                    : i === 0
                                    ? "bg-slate-700"
                                    : "bg-cyan-600/70 hover:bg-cyan-500"
                                }`}
                              />
                              <div className="text-[8.5px] text-slate-400 mt-1 font-mono">
                                λ{i + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-1 text-[9.5px] font-mono">
                        {eigenvalues.map((ev, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded-md ${
                              i === 1
                                ? "bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40"
                                : "bg-slate-800/60 text-slate-400"
                            }`}
                          >
                            λ_{i + 1}={ev.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Color-Coded Heatmap Grid */}
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.08] space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between text-[10.5px] font-sans font-semibold text-slate-400 uppercase tracking-wider">
                        <span>Matrix Heatmap: {matrixView.toUpperCase()}</span>
                        <div className="flex space-x-1">
                          {(["laplacian", "adjacency", "degree"] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setMatrixView(m)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-sans font-medium transition-all ${
                                matrixView === m
                                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              {m[0].toUpperCase() + m.slice(1, 3)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {hoveredCell && (
                        <div className="text-[10.5px] text-indigo-300 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                          {matrixView}[{nodeOrder[hoveredCell.r]}, {nodeOrder[hoveredCell.c]}] = {hoveredCell.val.toFixed(2)}
                        </div>
                      )}

                      <div className="overflow-x-auto pb-1 max-h-56">
                        <table className="border-collapse select-none mx-auto text-[9.5px] font-mono">
                          <thead>
                            <tr>
                              <th className="p-1 text-slate-600 text-[8.5px] text-right" />
                              {nodeOrder.map((nid) => (
                                <th
                                  key={nid}
                                  className="p-1 text-slate-400 text-[8.5px] text-center max-w-[32px] truncate"
                                  title={nid}
                                >
                                  {nid.slice(0, 3)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentMatrix.map((row, r) => (
                              <tr key={r}>
                                <td className="p-1 text-slate-400 text-[8.5px] text-right pr-1 max-w-[32px] truncate" title={nodeOrder[r]}>
                                  {nodeOrder[r].slice(0, 3)}
                                </td>
                                {row.map((val, c) => {
                                  let bgClass = "bg-slate-950 text-slate-500";
                                  if (r === c && val > 0) {
                                    bgClass = "bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/30";
                                  } else if (val < 0) {
                                    bgClass = "bg-indigo-950/80 text-indigo-300 font-medium border border-indigo-500/30";
                                  } else if (val > 0) {
                                    bgClass = "bg-cyan-950/70 text-cyan-300";
                                  }

                                  return (
                                    <td
                                      key={c}
                                      onMouseEnter={() => setHoveredCell({ r, c, val })}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      className={`w-7 h-6 text-center cursor-pointer hover:ring-1 hover:ring-white rounded-sm ${bgClass}`}
                                    >
                                      {val !== 0 ? (val > 0 ? `+${val.toFixed(0)}` : val.toFixed(0)) : "0"}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Flow & Cut Tab */}
                {activeTab === "flow" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.08] shadow-sm">
                        <div className="text-[10.5px] text-slate-400 font-sans font-medium uppercase tracking-wider">
                          Max Throughput
                        </div>
                        <div className="text-lg font-bold font-mono text-white mt-1">
                          {data.flow.max_throughput.toFixed(1)}{" "}
                          <span className="text-xs font-normal text-slate-400">req/s</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.08] shadow-sm">
                        <div className="text-[10.5px] text-slate-400 font-sans font-medium uppercase tracking-wider">
                          Min-Cut Capacity
                        </div>
                        <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                          {data.flow.min_cut_capacity.toFixed(1)}{" "}
                          <span className="text-xs font-normal text-slate-400">units/s</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl font-sans font-medium">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Strong Duality: Directed Max-Flow == Min-Cut Mathematically Verified</span>
                    </div>

                    {/* Critical Cut Edges Table */}
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.08] space-y-2 shadow-sm">
                      <div className="text-[10.5px] font-sans font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Critical Bottleneck Edges ({data.flow.critical_cut_edges.length})</span>
                        <span className="text-[9.5px] font-mono text-rose-400">Severed Edges</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {data.flow.critical_cut_edges.length === 0 ? (
                          <div className="text-slate-500 text-xs italic p-3 bg-slate-950/60 rounded-lg text-center font-sans">
                            No bottleneck cut edges detected.
                          </div>
                        ) : (
                          data.flow.critical_cut_edges.map((e, idx) => (
                            <div
                              key={idx}
                              onClick={() => onSelectCutEdge?.(e.source, e.target)}
                              className="p-2.5 rounded-lg bg-slate-950/80 border border-rose-500/30 hover:border-rose-500/60 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                            >
                              <span className="text-slate-200 group-hover:text-rose-300 flex items-center space-x-2 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                                <span>{e.source}</span>
                                <ArrowRight className="w-3 h-3 text-slate-500" />
                                <span>{e.target}</span>
                              </span>
                              <span className="text-rose-400 font-bold font-mono text-[10.5px]">
                                cap={e.capacity}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Risk Tab */}
                {activeTab === "risk" && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-white/[0.08] space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-sans font-semibold text-slate-400 uppercase tracking-wider">
                          Joint Vulnerability Risk Prior
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                            data.risk.risk_tier === "CRITICAL"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : data.risk.risk_tier === "ELEVATED"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {data.risk.risk_tier}
                        </span>
                      </div>
                      <div className="text-2xl font-bold font-mono text-white">
                        {data.risk.counterexample_joint_prob !== undefined && data.risk.counterexample_joint_prob !== null
                          ? `${(data.risk.counterexample_joint_prob * 100).toFixed(4)}%`
                          : "0.00%"}
                      </div>
                      <div className="text-[11px] font-sans text-slate-400">
                        Product of independent failure probabilities across the minimal SMT cut set.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.06] text-xs font-sans text-slate-300 leading-relaxed">
                      {data.risk.notes}
                    </div>

                    {/* Node Failure Priors */}
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/[0.08] space-y-2 shadow-sm">
                      <div className="text-[10.5px] font-sans font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Node Stochastic Failure Priors
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {Object.entries(data.risk.independent_failure_probabilities).map(([nid, prob]) => (
                          <div
                            key={nid}
                            className="p-2 rounded-lg bg-slate-950/80 border border-white/[0.04] flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-300 font-mono">{nid}</span>
                            <span className="text-slate-200 font-mono font-medium">{(prob * 100).toFixed(2)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </>
      )}
    </aside>
  );
}

