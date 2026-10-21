"use client";

import React, { useState } from "react";
import { AnalyzeTopologyResponse } from "@/lib/types";
import {
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Layers,
  ArrowRight,
  Zap,
  Info,
  Clock,
  Activity,
  BarChart3,
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
  const [activeTab, setActiveTab] = useState<"verification" | "matrix" | "flow" | "risk">("verification");
  const [collapsed, setCollapsed] = useState(false);
  const [matrixView, setMatrixView] = useState<"laplacian" | "adjacency" | "degree">("laplacian");
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; val: number } | null>(null);
  const [isFormulasExpanded, setIsFormulasExpanded] = useState(false);

  if (!data && !isLoading) {
    return (
      <aside
        className={`border-l border-slate-200 bg-white transition-all duration-300 flex flex-col z-20 select-none ${
          collapsed ? "w-12" : "w-80"
        }`}
      >
        <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                Network Diagnostics
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto"
            title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        {!collapsed && (
          <div className="p-8 text-center text-xs text-slate-500 mt-16 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Ready to Test</p>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[220px] mx-auto">
              Run a resilience test from the dock below to inspect connectivity scores, flow limits, and bottleneck diagnostics.
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
      className={`border-l border-slate-200 bg-white transition-all duration-300 flex flex-col z-20 select-none ${
        collapsed ? "w-12" : "w-[410px]"
      }`}
    >
      {/* Header */}
      <div className="h-12 border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
              Network Diagnostics
            </span>
            {data && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {data.execution_duration_ms.toFixed(0)} ms
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto"
          title={collapsed ? "Expand Inspector" : "Collapse Inspector"}
        >
          {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {collapsed ? (
        <div className="p-2 space-y-3 flex flex-col items-center pt-3">
          <button
            onClick={() => { setCollapsed(false); setActiveTab("verification"); }}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            title="Verification"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setCollapsed(false); setActiveTab("matrix"); }}
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            title="Matrix"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("verification")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "verification"
                  ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Result
            </button>
            <button
              onClick={() => setActiveTab("matrix")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "matrix"
                  ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Matrix & Spectra
            </button>
            <button
              onClick={() => setActiveTab("flow")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "flow"
                  ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Flow Limits
            </button>
            <button
              onClick={() => setActiveTab("risk")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "risk"
                  ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Outage Risk
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-20 bg-slate-100 rounded-xl" />
                <div className="h-32 bg-slate-100 rounded-xl" />
                <div className="h-24 bg-slate-100 rounded-xl" />
              </div>
            ) : data ? (
              <>
                {/* 1. Verification Tab */}
                {activeTab === "verification" && (
                  <div className="space-y-3.5">
                    {/* Status Card */}
                    <div
                      className={`p-4 rounded-xl border shadow-sm ${
                        data.verification.status === "UNSAT"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : data.verification.status === "SAT"
                          ? "bg-rose-50 border-rose-200 text-rose-900"
                          : "bg-amber-50 border-amber-200 text-amber-900"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-white border border-slate-200 shrink-0 shadow-sm">
                          {data.verification.status === "UNSAT" ? (
                            <ShieldCheck className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <ShieldAlert className="w-5 h-5 text-rose-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs uppercase tracking-tight">
                            {data.verification.status === "UNSAT"
                              ? "Architecture Resilient (Passed)"
                              : data.verification.status === "SAT"
                              ? "Vulnerability Detected (Failed)"
                              : "Simulation Inconclusive"}
                          </div>
                          <div className="text-xs text-slate-700 mt-1 leading-relaxed">
                            {data.verification.status === "UNSAT"
                              ? `Tested with up to ${data.verification.failure_k} simultaneous node outage(s). Network will remain fully connected.`
                              : `A combination of ${data.verification.counterexample_nodes.length} node outage(s) will completely disconnect traffic.`}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1.5 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Verified with Z3 in {data.verification.verification_time_ms.toFixed(1)} ms</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Counterexample Breakdown Card */}
                    {data.verification.status === "SAT" && (
                      <div className="p-4 rounded-xl bg-white border border-rose-200 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between text-rose-800 font-semibold text-xs">
                          <span>Outage Cut Set (Bottlenecks):</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200">
                            {data.verification.counterexample_nodes.length} Service(s)
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {data.verification.counterexample_nodes.map((nodeId) => (
                            <span
                              key={nodeId}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold"
                            >
                              {nodeId}
                            </span>
                          ))}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                          {data.verification.witness_description}
                        </p>

                        {onOpenRepair && (
                          <button
                            onClick={onOpenRepair}
                            className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Suggest Fix Architecture</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Directed Cut Partition */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
                      <div className="text-[11px] uppercase font-semibold text-slate-500 flex items-center justify-between">
                        <span>Traffic Partitions</span>
                        <span className="text-[10px] text-slate-400">Source to Destination</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="text-slate-800 font-semibold text-[11px] mb-1">
                            Connected to Ingress ({data.flow.source_partition.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {data.flow.source_partition.map((id) => (
                              <span key={id} className="px-1.5 py-0.5 rounded bg-white text-slate-700 text-[10px] font-mono border border-slate-200">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="text-slate-800 font-semibold text-[11px] mb-1">
                            Connected to Sink ({data.flow.sink_partition.length})
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {data.flow.sink_partition.map((id) => (
                              <span key={id} className="px-1.5 py-0.5 rounded bg-white text-slate-700 text-[10px] font-mono border border-slate-200">
                                {id}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proof Certificate Details */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="text-slate-500 font-semibold text-[11px] uppercase tracking-wide">
                        Proof Notes
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {data.verification.proof_notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Matrix Tab */}
                {activeTab === "matrix" && (
                  <div className="space-y-3.5">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                          Connectivity Score (λ₂)
                        </div>
                        <div className="text-lg font-bold font-mono text-blue-600 mt-1">
                          {data.spectral.fiedler_value.toFixed(3)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {data.spectral.fiedler_value > 0.001 ? "Fully connected fabric" : "Disconnected network"}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                          Robustness Score
                        </div>
                        <div className="text-lg font-bold font-mono text-emerald-600 mt-1">
                          {(data.spectral.algebraic_connectivity_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Degree normalized
                        </div>
                      </div>
                    </div>

                    {/* Eigenvalues */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                        <span>Laplacian Eigenvalues</span>
                        <span className="text-[10px] text-blue-600 font-mono">λ₂ = Algebraic Connectivity</span>
                      </div>

                      <div className="h-16 w-full flex items-end gap-1 px-2 py-2 bg-slate-50 rounded-lg border border-slate-200">
                        {eigenvalues.map((ev, i) => {
                          const heightPct = Math.max((ev / maxEigen) * 100, 8);
                          const isFiedler = i === 1;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center h-full justify-end">
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-t transition-all ${
                                  isFiedler ? "bg-blue-600" : i === 0 ? "bg-slate-300" : "bg-blue-400"
                                }`}
                              />
                              <div className="text-[9px] text-slate-400 mt-1 font-mono">
                                λ{i + 1}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Heatmap Grid */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                        <span>Matrix: {matrixView.toUpperCase()}</span>
                        <div className="flex space-x-1">
                          {(["laplacian", "adjacency", "degree"] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setMatrixView(m)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                                matrixView === m
                                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
                              }`}
                            >
                              {m[0].toUpperCase() + m.slice(1, 3)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {hoveredCell && (
                        <div className="text-[11px] text-blue-700 font-mono bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {matrixView}[{nodeOrder[hoveredCell.r]}, {nodeOrder[hoveredCell.c]}] = {hoveredCell.val.toFixed(2)}
                        </div>
                      )}

                      <div className="overflow-x-auto pb-1 max-h-56">
                        <table className="border-collapse select-none mx-auto text-[10px] font-mono">
                          <thead>
                            <tr>
                              <th className="p-1 text-slate-400 text-[9px] text-right" />
                              {nodeOrder.map((nid) => (
                                <th
                                  key={nid}
                                  className="p-1 text-slate-600 text-[9px] text-center max-w-[32px] truncate font-medium"
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
                                <td className="p-1 text-slate-600 text-[9px] text-right pr-1 max-w-[32px] truncate font-medium" title={nodeOrder[r]}>
                                  {nodeOrder[r].slice(0, 3)}
                                </td>
                                {row.map((val, c) => {
                                  let bgClass = "bg-white text-slate-400 border border-slate-100";
                                  if (r === c && val > 0) {
                                    bgClass = "bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200";
                                  } else if (val < 0) {
                                    bgClass = "bg-blue-50 text-blue-700 font-medium border border-blue-200";
                                  } else if (val > 0) {
                                    bgClass = "bg-slate-100 text-slate-700";
                                  }

                                  return (
                                    <td
                                      key={c}
                                      onMouseEnter={() => setHoveredCell({ r, c, val })}
                                      onMouseLeave={() => setHoveredCell(null)}
                                      className={`w-7 h-6 text-center cursor-pointer hover:ring-1 hover:ring-blue-400 rounded-sm ${bgClass}`}
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

                {/* 3. Flow Limits Tab */}
                {activeTab === "flow" && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                          Max Flow
                        </div>
                        <div className="text-lg font-bold font-mono text-slate-900 mt-1">
                          {data.flow.max_throughput.toFixed(1)}{" "}
                          <span className="text-xs font-normal text-slate-500">req/s</span>
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                        <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                          Min-Cut Bottleneck
                        </div>
                        <div className="text-lg font-bold font-mono text-blue-600 mt-1">
                          {data.flow.min_cut_capacity.toFixed(1)}{" "}
                          <span className="text-xs font-normal text-slate-500">req/s</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Flow Balanced: Max Flow exactly matches Minimum Cut capacity.</span>
                    </div>

                    {/* Bottlenecks List */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                        <span>Critical Bottleneck Connections ({data.flow.critical_cut_edges.length})</span>
                      </div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {data.flow.critical_cut_edges.length === 0 ? (
                          <div className="text-slate-500 text-xs italic p-3 bg-slate-50 rounded-lg text-center">
                            No bottleneck connections found.
                          </div>
                        ) : (
                          data.flow.critical_cut_edges.map((e, idx) => (
                            <div
                              key={idx}
                              onClick={() => onSelectCutEdge?.(e.source, e.target)}
                              className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-200 hover:border-rose-400 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                            >
                              <span className="text-slate-800 group-hover:text-rose-700 flex items-center space-x-2 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                                <span>{e.source}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span>{e.target}</span>
                              </span>
                              <span className="text-rose-700 font-bold font-mono text-[11px]">
                                capacity: {e.capacity} req/s
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
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                          Outage Risk Level
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            data.risk.risk_tier === "CRITICAL"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : data.risk.risk_tier === "ELEVATED"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {data.risk.risk_tier}
                        </span>
                      </div>
                      <div className="text-2xl font-bold font-mono text-slate-900">
                        {data.risk.counterexample_joint_prob !== undefined && data.risk.counterexample_joint_prob !== null
                          ? `${(data.risk.counterexample_joint_prob * 100).toFixed(4)}%`
                          : "0.00%"}
                      </div>
                      <div className="text-xs text-slate-500">
                        Combined probability of nodes failing simultaneously.
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                      {data.risk.notes}
                    </div>

                    {/* Node Priors */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-sm">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Individual Node Failure Rates
                      </div>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {Object.entries(data.risk.independent_failure_probabilities).map(([nid, prob]) => (
                          <div
                            key={nid}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-800 font-mono">{nid}</span>
                            <span className="text-slate-600 font-mono font-medium">{(prob * 100).toFixed(2)}%</span>
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
