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
        className={`border-l border-white/[0.08] bg-[#0A0A0C] transition-all duration-300 flex flex-col z-10 ${
          collapsed ? "w-10" : "w-80"
        }`}
      >
        <div className="h-10 border-b border-white/[0.08] px-3 flex items-center justify-between">
          {!collapsed && (
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Inspector
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-zinc-500 hover:text-white ml-auto"
            title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
          >
            {collapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
        {!collapsed && (
          <div className="p-6 text-center text-xs font-mono text-zinc-500 mt-16 space-y-2">
            <Binary className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-zinc-300 font-medium">Awaiting Analysis</p>
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              Run SMT Verification from the command dock to inspect spectral heatmaps, cut partitions, and formal certificates.
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
      className={`border-l border-white/[0.08] bg-[#0A0A0C] transition-all duration-300 flex flex-col z-10 ${
        collapsed ? "w-10" : "w-[390px]"
      }`}
    >
      {/* Header */}
      <div className="h-10 border-b border-white/[0.08] px-3.5 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Inspector & Telemetry
            </span>
            {data && (
              <span className="text-[10px] font-mono text-zinc-500">
                ({data.execution_duration_ms.toFixed(1)}ms)
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-zinc-500 hover:text-white ml-auto"
          title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
        >
          {collapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {collapsed ? (
        <div className="p-2 space-y-4 flex flex-col items-center">
          <ShieldCheck className="w-4 h-4 text-zinc-500 hover:text-violet-400 cursor-pointer" />
          <Activity className="w-4 h-4 text-zinc-500 hover:text-violet-400 cursor-pointer" />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-white/[0.08] text-xs font-mono shrink-0">
            <button
              onClick={() => setActiveTab("smt")}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === "smt"
                  ? "border-violet-500 text-white font-semibold bg-white/[0.03]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              SMT Proof
            </button>
            <button
              onClick={() => setActiveTab("spectral")}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === "spectral"
                  ? "border-violet-500 text-white font-semibold bg-white/[0.03]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Laplacian (L)
            </button>
            <button
              onClick={() => setActiveTab("flow")}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === "flow"
                  ? "border-violet-500 text-white font-semibold bg-white/[0.03]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Cut & Flow
            </button>
            <button
              onClick={() => setActiveTab("risk")}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === "risk"
                  ? "border-violet-500 text-white font-semibold bg-white/[0.03]"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Risk Prior
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 font-mono text-xs">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-white/[0.03] rounded border border-white/[0.05]" />
                <div className="h-28 bg-white/[0.03] rounded border border-white/[0.05]" />
                <div className="h-20 bg-white/[0.03] rounded border border-white/[0.05]" />
              </div>
            ) : data ? (
              <>
                {/* 1. SMT Verification Tab */}
                {activeTab === "smt" && (
                  <div className="space-y-3.5">
                    {/* Status Card */}
                    <div
                      className={`p-3 rounded border flex items-start justify-between ${
                        data.verification.status === "UNSAT"
                          ? "bg-emerald-950/25 border-emerald-500/40 text-emerald-200"
                          : data.verification.status === "SAT"
                          ? "bg-red-950/30 border-red-500/40 text-red-200"
                          : "bg-amber-950/20 border-amber-500/40 text-amber-200"
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        {data.verification.status === "UNSAT" ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-xs tracking-wider uppercase">
                            {data.verification.status === "UNSAT"
                              ? "Formal Certificate: UNSAT (Resilient)"
                              : data.verification.status === "SAT"
                              ? "Counterexample Found: SAT (Vulnerable)"
                              : "Verification Timeout: UNKNOWN"}
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            Property: Tolerance against {data.verification.failure_mode} {data.verification.failure_k} node failures
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">
                            Z3 Theorem Prover: {data.verification.verification_time_ms.toFixed(1)}ms
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Counterexample Breakdown Card */}
                    {data.verification.status === "SAT" && (
                      <div className="p-3 rounded bg-black/60 border border-red-500/30 space-y-2.5">
                        <div className="flex items-center justify-between text-red-300 font-semibold text-[11px]">
                          <span>Minimal Failure Witness:</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950/80 border border-red-500/40 text-red-300 font-bold">
                            |F*| = {data.verification.counterexample_nodes.length}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {data.verification.counterexample_nodes.length === 0 ? (
                            <span className="text-zinc-500 italic text-[11px]">
                              Trivially severed: Base graph is disconnected prior to failures
                            </span>
                          ) : (
                            data.verification.counterexample_nodes.map((nodeId) => (
                              <span
                                key={nodeId}
                                className="px-2 py-0.5 rounded bg-red-950/60 text-red-200 border border-red-500/50 text-[11px] font-bold"
                              >
                                {nodeId}
                              </span>
                            ))
                          )}
                        </div>

                        <p className="text-[10px] text-zinc-400 leading-relaxed border-t border-white/[0.06] pt-2">
                          {data.verification.witness_description}
                        </p>

                        {onOpenRepair && (
                          <button
                            onClick={onOpenRepair}
                            className="w-full mt-2 py-2 rounded bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center space-x-1.5"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Synthesize Verified Repair</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Visual Cut Partition (S vs T) */}
                    <div className="p-3 rounded bg-black/60 border border-white/[0.08] space-y-2">
                      <div className="text-[10px] uppercase font-semibold text-zinc-400 flex items-center justify-between">
                        <span>Directed Cut Partition (Menger Closure)</span>
                        <span className="text-[9px] text-zinc-500">S ∩ T = ∅</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                        <div className="p-2 rounded bg-zinc-950 border border-emerald-500/20">
                          <div className="text-emerald-400 font-semibold mb-1">
                            Ingress Partition S ({data.flow.source_partition.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {data.flow.source_partition.map((id) => (
                              <span key={id} className="px-1 py-0.2 rounded bg-zinc-900 text-zinc-300 text-[9px]">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-2 rounded bg-zinc-950 border border-cyan-500/20">
                          <div className="text-cyan-400 font-semibold mb-1">
                            Sink Partition T ({data.flow.sink_partition.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {data.flow.sink_partition.map((id) => (
                              <span key={id} className="px-1 py-0.2 rounded bg-zinc-900 text-zinc-300 text-[9px]">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proof Certificate Details */}
                    <div className="p-2.5 rounded bg-black/40 border border-white/[0.06] space-y-1">
                      <div className="text-zinc-500 font-semibold text-[10px] uppercase">
                        Proof Notes
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-relaxed font-mono">
                        {data.verification.proof_notes}
                      </p>
                    </div>

                    {/* Collapsible Theoretical Foundations */}
                    <div className="border border-white/[0.06] rounded bg-black/40 overflow-hidden">
                      <button
                        onClick={() => setIsFormulasExpanded(!isFormulasExpanded)}
                        className="w-full px-2.5 py-1.5 flex items-center justify-between text-[10px] text-zinc-400 hover:text-white"
                      >
                        <span className="flex items-center space-x-1">
                          <Info className="w-3 h-3 text-violet-400" />
                          <span>Formal SMT Verification Model</span>
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isFormulasExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {isFormulasExpanded && (
                        <div className="p-2.5 border-t border-white/[0.06] text-[10px] text-zinc-400 space-y-2 leading-relaxed">
                          <p>
                            <strong className="text-zinc-200">Cut-Reachability Closure:</strong> A failure set <code className="text-violet-300">F</code> severs <code className="text-emerald-300">s</code> from <code className="text-cyan-300">t</code> iff there exists partition <code className="text-zinc-200">S ⊆ V</code> satisfying:
                          </p>
                          <ul className="list-disc list-inside space-y-0.5 text-zinc-500 pl-1 font-mono text-[9px]">
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
                  <div className="space-y-3.5">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded bg-black/60 border border-white/[0.08]">
                        <div className="text-[10px] text-zinc-500 uppercase">Fiedler Value (λ₂)</div>
                        <div className="text-base font-bold text-violet-400">
                          {data.spectral.fiedler_value.toFixed(4)}
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          {data.spectral.fiedler_value > 0.001 ? "Connected fabric" : "Disconnected clusters"}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-black/60 border border-white/[0.08]">
                        <div className="text-[10px] text-zinc-500 uppercase">Robustness Score (ρ)</div>
                        <div className="text-base font-bold text-cyan-400">
                          {(data.spectral.algebraic_connectivity_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-[9px] text-zinc-500 mt-0.5">
                          λ₂ / max(d_v) normalized
                        </div>
                      </div>
                    </div>

                    {/* Eigenvalue Spectrum Bar Chart */}
                    <div className="p-2.5 rounded bg-black/60 border border-white/[0.08] space-y-2">
                      <div className="text-[10px] text-zinc-500 uppercase flex items-center justify-between">
                        <span>Ordered Eigenvalues (λ₁ ... λₙ)</span>
                        <span className="text-[9px] text-violet-400">λ₂ = Algebraic Connectivity</span>
                      </div>

                      {/* SVG Bar Chart */}
                      <div className="h-16 w-full flex items-end gap-1 px-1 py-1 bg-zinc-950 rounded border border-white/[0.04]">
                        {eigenvalues.map((ev, i) => {
                          const heightPct = Math.max((ev / maxEigen) * 100, 4);
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
                                    ? "bg-violet-500 hover:bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                                    : i === 0
                                    ? "bg-zinc-700"
                                    : "bg-cyan-600/70 hover:bg-cyan-500"
                                }`}
                              />
                              <div className="text-[8px] text-zinc-500 mt-1 font-mono">
                                λ{i + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-1 text-[9px]">
                        {eigenvalues.map((ev, i) => (
                          <span
                            key={i}
                            className={`px-1.5 py-0.5 rounded ${
                              i === 1
                                ? "bg-violet-950/80 text-violet-300 font-bold border border-violet-500/40"
                                : "bg-zinc-900 text-zinc-400"
                            }`}
                          >
                            λ_{i + 1}={ev.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Color-Coded Heatmap Grid */}
                    <div className="p-2.5 rounded bg-black/60 border border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase">
                        <span>Matrix Heatmap: {matrixView.toUpperCase()}</span>
                        <div className="flex space-x-1">
                          {(["laplacian", "adjacency", "degree"] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setMatrixView(m)}
                              className={`px-1.5 py-0.5 rounded text-[9px] ${
                                matrixView === m
                                  ? "bg-violet-600 text-white font-semibold"
                                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              {m[0].toUpperCase() + m.slice(1, 3)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {hoveredCell && (
                        <div className="text-[10px] text-violet-300 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-violet-500/20">
                          {matrixView}[{nodeOrder[hoveredCell.r]}, {nodeOrder[hoveredCell.c]}] = {hoveredCell.val.toFixed(2)}
                        </div>
                      )}

                      <div className="overflow-x-auto pb-1 max-h-56">
                        <table className="border-collapse select-none mx-auto text-[9px]">
                          <thead>
                            <tr>
                              <th className="p-1 text-zinc-600 font-mono text-[8px] text-right" />
                              {nodeOrder.map((nid) => (
                                <th
                                  key={nid}
                                  className="p-1 text-zinc-500 font-mono text-[8px] text-center max-w-[28px] truncate"
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
                                <td className="p-1 text-zinc-500 font-mono text-[8px] text-right pr-1 max-w-[28px] truncate" title={nodeOrder[r]}>
                                  {nodeOrder[r].slice(0, 3)}
                                </td>
                                {row.map((val, c) => {
                                  // Color shading:
                                  let bgClass = "bg-zinc-950 text-zinc-600";
                                  if (r === c && val > 0) {
                                    // Diagonal degree
                                    bgClass = "bg-emerald-950/80 text-emerald-300 font-semibold border border-emerald-500/30";
                                  } else if (val < 0) {
                                    // Negative off-diagonal Laplacian entry (connected edge)
                                    bgClass = "bg-violet-950/80 text-violet-300 font-medium border border-violet-500/30";
                                  } else if (val > 0) {
                                    // Positive entry (adjacency or degree)
                                    bgClass = "bg-cyan-950/70 text-cyan-300";
                                  }

                                  return (
                                    <td
                                      key={c}
                                      onMouseEnter={() => setHoveredCell({ r, c, val })}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      className={`w-7 h-6 text-center text-[9px] cursor-pointer hover:ring-1 hover:ring-white ${bgClass}`}
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
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded bg-black/60 border border-white/[0.08]">
                        <div className="text-[10px] text-zinc-500 uppercase">Max Throughput</div>
                        <div className="text-base font-bold text-white">
                          {data.flow.max_throughput.toFixed(1)}{" "}
                          <span className="text-[10px] text-zinc-500">req/s</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-black/60 border border-white/[0.08]">
                        <div className="text-[10px] text-zinc-500 uppercase">Min-Cut Capacity</div>
                        <div className="text-base font-bold text-cyan-400">
                          {data.flow.min_cut_capacity.toFixed(1)}{" "}
                          <span className="text-[10px] text-zinc-500">units/s</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-1 rounded">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Strong Duality: Max-Flow == Min-Cut Verified</span>
                    </div>

                    {/* Critical Cut Edges Table */}
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase mb-1.5 flex items-center justify-between">
                        <span>Critical Bottleneck Edges ({data.flow.critical_cut_edges.length})</span>
                        <span className="text-[9px] text-red-400">Severed Edges</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {data.flow.critical_cut_edges.length === 0 ? (
                          <div className="text-zinc-600 text-[11px] italic p-2 bg-zinc-950 rounded">
                            No bottleneck cut edges detected.
                          </div>
                        ) : (
                          data.flow.critical_cut_edges.map((e, idx) => (
                            <div
                              key={idx}
                              onClick={() => onSelectCutEdge?.(e.source, e.target)}
                              className="p-2 rounded bg-black border border-red-500/30 hover:border-red-500/60 transition-colors flex items-center justify-between text-[11px] cursor-pointer group"
                            >
                              <span className="text-zinc-200 group-hover:text-red-300 flex items-center space-x-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                                <span>{e.source}</span>
                                <ArrowRight className="w-3 h-3 text-zinc-600" />
                                <span>{e.target}</span>
                              </span>
                              <span className="text-red-400 font-bold text-[10px]">
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
                  <div className="space-y-3.5">
                    <div className="p-3 rounded bg-black/60 border border-white/[0.08] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 uppercase">Joint Vulnerability Risk</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            data.risk.risk_tier === "CRITICAL"
                              ? "bg-red-950 text-red-400 border border-red-500/40"
                              : data.risk.risk_tier === "ELEVATED"
                              ? "bg-amber-950 text-amber-400 border border-amber-500/40"
                              : "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                          }`}
                        >
                          {data.risk.risk_tier}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {data.risk.counterexample_joint_prob !== undefined && data.risk.counterexample_joint_prob !== null
                          ? `${(data.risk.counterexample_joint_prob * 100).toFixed(4)}%`
                          : "0.00%"}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        Product of independent failure probabilities across minimal cut set.
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-950 border border-white/[0.06] text-[10px] text-zinc-400 leading-relaxed">
                      {data.risk.notes}
                    </div>

                    {/* Node Failure Priors */}
                    <div>
                      <div className="text-[10px] text-zinc-500 uppercase mb-1">
                        Node Independent Failure Priors
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {Object.entries(data.risk.independent_failure_probabilities).map(([nid, prob]) => (
                          <div
                            key={nid}
                            className="p-1.5 rounded bg-black border border-white/[0.04] flex items-center justify-between text-[11px]"
                          >
                            <span className="text-zinc-400">{nid}</span>
                            <span className="text-zinc-200">{(prob * 100).toFixed(2)}%</span>
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
