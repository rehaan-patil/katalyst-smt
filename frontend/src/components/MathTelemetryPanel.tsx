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
  Binary,
  Layers,
} from "lucide-react";

interface MathTelemetryPanelProps {
  data: AnalyzeTopologyResponse | null;
  isLoading: boolean;
  onOpenRepair?: () => void;
}

export function MathTelemetryPanel({
  data,
  isLoading,
  onOpenRepair,
}: MathTelemetryPanelProps) {
  const [activeTab, setActiveTab] = useState<"smt" | "spectral" | "flow" | "risk">("smt");
  const [collapsed, setCollapsed] = useState(false);
  const [matrixView, setMatrixView] = useState<"laplacian" | "adjacency" | "degree">("laplacian");

  if (!data && !isLoading) {
    return (
      <aside
        className={`border-l border-white/10 bg-panel transition-all duration-300 flex flex-col z-10 ${
          collapsed ? "w-10" : "w-80"
        }`}
      >
        <div className="h-12 border-b border-white/10 px-3 flex items-center justify-between">
          {!collapsed && (
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gray-400">
              Math Telemetry
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded text-gray-500 hover:text-white ml-auto"
          >
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        {!collapsed && (
          <div className="p-4 text-center text-xs font-mono text-gray-600 mt-20">
            <Binary className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p>Awaiting analysis execution.</p>
            <p className="text-[10px] text-gray-700 mt-1">
              Click &quot;Analyze Topology&quot; in dock to run Z3 SMT solver.
            </p>
          </div>
        )}
      </aside>
    );
  }

  return (
    <aside
      className={`border-l border-white/10 bg-panel transition-all duration-300 flex flex-col z-10 ${
        collapsed ? "w-10" : "w-96"
      }`}
    >
      {/* Header */}
      <div className="h-12 border-b border-white/10 px-3 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gray-300">
              Mathematical Telemetry
            </span>
            {data && (
              <span className="text-[10px] font-mono text-gray-500">
                ({data.execution_duration_ms.toFixed(1)}ms)
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-gray-500 hover:text-white ml-auto"
        >
          {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {collapsed ? (
        <div className="p-2 space-y-4 flex flex-col items-center">
          <ShieldCheck className="w-4 h-4 text-gray-500 hover:text-cyberViolet cursor-pointer" />
          <Activity className="w-4 h-4 text-gray-500 hover:text-cyberViolet cursor-pointer" />
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab("smt")}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === "smt"
                  ? "border-cyberViolet text-white font-semibold bg-white/5"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              SMT Proof
            </button>
            <button
              onClick={() => setActiveTab("spectral")}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === "spectral"
                  ? "border-cyberViolet text-white font-semibold bg-white/5"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Spectral (λ)
            </button>
            <button
              onClick={() => setActiveTab("flow")}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === "flow"
                  ? "border-cyberViolet text-white font-semibold bg-white/5"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Flow & Cut
            </button>
            <button
              onClick={() => setActiveTab("risk")}
              className={`flex-1 py-2 text-center border-b-2 transition-colors ${
                activeTab === "risk"
                  ? "border-cyberViolet text-white font-semibold bg-white/5"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              Risk Prior
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-20 bg-white/5 rounded"></div>
                <div className="h-28 bg-white/5 rounded"></div>
                <div className="h-20 bg-white/5 rounded"></div>
              </div>
            ) : data ? (
              <>
                {/* 1. SMT Verification Tab */}
                {activeTab === "smt" && (
                  <div className="space-y-4">
                    {/* Status Badge */}
                    <div
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        data.verification.status === "UNSAT"
                          ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                          : data.verification.status === "SAT"
                          ? "bg-red-950/30 border-red-500/40 text-red-300"
                          : "bg-yellow-950/20 border-yellow-500/40 text-yellow-300"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {data.verification.status === "UNSAT" ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-5 h-5 text-red-400" />
                        )}
                        <div>
                          <div className="font-bold text-sm tracking-wide">
                            {data.verification.status === "UNSAT"
                              ? "VERIFIED (UNSAT)"
                              : data.verification.status === "SAT"
                              ? "VULNERABILITY FOUND (SAT)"
                              : "INCONCLUSIVE (UNKNOWN)"}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Z3 Solver Runtime: {data.verification.verification_time_ms.toFixed(1)}ms
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Counterexample Section */}
                    {data.verification.status === "SAT" && (
                      <div className="p-3 rounded bg-black border border-red-500/30 space-y-2">
                        <div className="flex items-center justify-between text-red-400 font-semibold text-[11px]">
                          <span>Simultaneous Failure Witness:</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 border border-red-500/30">
                            k = {data.verification.failure_k}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {data.verification.counterexample_nodes.length === 0 ? (
                            <span className="text-gray-500 italic">None (Base graph disconnected)</span>
                          ) : (
                            data.verification.counterexample_nodes.map((nodeId) => (
                              <span
                                key={nodeId}
                                className="px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-bold"
                              >
                                {nodeId}
                              </span>
                            ))
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed pt-1">
                          {data.verification.witness_description}
                        </p>

                        {onOpenRepair && (
                          <button
                            onClick={onOpenRepair}
                            className="w-full mt-2 py-1.5 rounded bg-cyberViolet hover:bg-cyberViolet-dark text-white font-semibold text-xs tracking-wide transition-all shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                          >
                            Synthesize & Verify Repair
                          </button>
                        )}
                      </div>
                    )}

                    {/* Proof Certificate Note */}
                    <div className="p-3 rounded bg-black/60 border border-white/10 space-y-1">
                      <div className="text-gray-400 font-semibold text-[11px] uppercase tracking-wider">
                        Formal Invariant Certificate
                      </div>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {data.verification.proof_notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Spectral Tab */}
                {activeTab === "spectral" && (
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded bg-black border border-white/10">
                        <div className="text-[10px] text-gray-500 uppercase">Fiedler Value (λ₂)</div>
                        <div className="text-base font-bold text-cyberViolet-light">
                          {data.spectral.fiedler_value.toFixed(4)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-black border border-white/10">
                        <div className="text-[10px] text-gray-500 uppercase">Robustness Score (ρ)</div>
                        <div className="text-base font-bold text-neonBlue-light">
                          {(data.spectral.algebraic_connectivity_score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-black border border-white/10 text-[10px] text-gray-400 leading-relaxed">
                      {data.spectral.interpretation}
                    </div>

                    {/* Eigenvalues */}
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">
                        Sorted Eigenvalue Spectrum (λ₁ ... λₙ)
                      </div>
                      <div className="p-2 rounded bg-black border border-white/10 flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                        {data.spectral.eigenvalues.map((ev, i) => (
                          <span
                            key={i}
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              i === 1
                                ? "bg-cyberViolet/30 text-cyberViolet-light font-bold border border-cyberViolet/50"
                                : "bg-white/5 text-gray-400"
                            }`}
                          >
                            λ_{i + 1}={ev.toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Matrix View Toggle */}
                    <div>
                      <div className="flex items-center justify-between mb-1 text-[10px] text-gray-500 uppercase">
                        <span>Matrix Inspection</span>
                        <div className="flex space-x-1">
                          {(["laplacian", "adjacency", "degree"] as const).map((m) => (
                            <button
                              key={m}
                              onClick={() => setMatrixView(m)}
                              className={`px-1.5 py-0.5 rounded text-[9px] ${
                                matrixView === m
                                  ? "bg-cyberViolet text-white font-semibold"
                                  : "bg-white/5 text-gray-400"
                              }`}
                            >
                              {m[0].toUpperCase() + m.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-2 rounded bg-black border border-white/10 overflow-x-auto max-h-40 text-[9px] font-mono leading-tight">
                        <table className="border-collapse">
                          <tbody>
                            {(matrixView === "laplacian"
                              ? data.spectral.laplacian_matrix
                              : matrixView === "adjacency"
                              ? data.spectral.adjacency_matrix
                              : data.spectral.degree_matrix
                            ).map((row, r) => (
                              <tr key={r}>
                                {row.map((val, c) => (
                                  <td
                                    key={c}
                                    className={`px-1 py-0.5 text-center ${
                                      val > 0
                                        ? "text-emerald-400"
                                        : val < 0
                                        ? "text-red-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    {val.toFixed(1)}
                                  </td>
                                ))}
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
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded bg-black border border-white/10">
                        <div className="text-[10px] text-gray-500 uppercase">Max Throughput</div>
                        <div className="text-base font-bold text-white">
                          {data.flow.max_throughput.toFixed(1)} <span className="text-[10px] text-gray-500">units/s</span>
                        </div>
                      </div>
                      <div className="p-2.5 rounded bg-black border border-white/10">
                        <div className="text-[10px] text-gray-500 uppercase">Min-Cut Capacity</div>
                        <div className="text-base font-bold text-white">
                          {data.flow.min_cut_capacity.toFixed(1)} <span className="text-[10px] text-gray-500">units/s</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Max-Flow / Min-Cut Duality: Certified Equal</span>
                    </div>

                    {/* Critical Cut Edges */}
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">
                        Critical Cut Bottlenecks ({data.flow.critical_cut_edges.length})
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {data.flow.critical_cut_edges.length === 0 ? (
                          <div className="text-gray-600 text-[11px] italic">No active cut edges.</div>
                        ) : (
                          data.flow.critical_cut_edges.map((e, idx) => (
                            <div
                              key={idx}
                              className="p-1.5 rounded bg-black border border-white/10 flex items-center justify-between text-[11px]"
                            >
                              <span className="text-gray-300">
                                {e.source} <span className="text-gray-600">→</span> {e.target}
                              </span>
                              <span className="text-gray-400 font-bold">{e.capacity}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Partitions */}
                    <div className="text-[10px] text-gray-400 space-y-1 border-t border-white/10 pt-2">
                      <div>
                        <strong className="text-gray-300">Partition S (Source):</strong>{" "}
                        {data.flow.source_partition.join(", ")}
                      </div>
                      <div>
                        <strong className="text-gray-300">Partition T (Sink):</strong>{" "}
                        {data.flow.sink_partition.join(", ")}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Risk Tab */}
                {activeTab === "risk" && (
                  <div className="space-y-4">
                    <div className="p-3 rounded bg-black border border-white/10 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 uppercase">Risk Tier</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            data.risk.risk_tier === "CRITICAL"
                              ? "bg-red-500/20 text-red-400 border border-red-500/40"
                              : data.risk.risk_tier === "ELEVATED"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          }`}
                        >
                          {data.risk.risk_tier}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-white">
                        {data.risk.counterexample_joint_prob !== undefined
                          ? `${(data.risk.counterexample_joint_prob * 100).toFixed(4)}%`
                          : "0.00%"}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Estimated joint probability of simultaneous counterexample failure.
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-black/60 border border-white/10 text-[10px] text-gray-400 leading-relaxed">
                      {data.risk.notes}
                    </div>

                    {/* Node Failure Rates */}
                    <div>
                      <div className="text-[10px] text-gray-500 uppercase mb-1">
                        Independent Node Priors
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {Object.entries(data.risk.independent_failure_probabilities).map(([nid, prob]) => (
                          <div
                            key={nid}
                            className="p-1.5 rounded bg-black border border-white/5 flex items-center justify-between text-[11px]"
                          >
                            <span className="text-gray-400">{nid}</span>
                            <span className="text-gray-300">{(prob * 100).toFixed(2)}%</span>
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
