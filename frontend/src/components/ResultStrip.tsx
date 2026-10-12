"use client";

import React from "react";
import { AnalyzeTopologyResponse } from "@/lib/types";
import { ShieldCheck, ShieldAlert, Cpu, Activity, Zap, CheckCircle2 } from "lucide-react";

interface ResultStripProps {
  nodeCount: number;
  edgeCount: number;
  data: AnalyzeTopologyResponse | null;
  isLoading: boolean;
  failureK: number;
}

export function ResultStrip({
  nodeCount,
  edgeCount,
  data,
  isLoading,
  failureK,
}: ResultStripProps) {
  const fiedler = data?.spectral.fiedler_value ?? null;
  const maxFlow = data?.flow.max_throughput ?? null;
  const minCut = data?.flow.min_cut_capacity ?? null;
  const verification = data?.verification ?? null;
  const duration = data?.execution_duration_ms ?? null;

  // Generate a mini sparkline SVG from eigenvalues if available
  const eigenvalues = data?.spectral.eigenvalues ?? [];
  const maxEigen = eigenvalues.length > 0 ? Math.max(...eigenvalues, 1) : 1;
  const sparklinePoints = eigenvalues
    .map((val, idx) => {
      const x = (idx / Math.max(eigenvalues.length - 1, 1)) * 48;
      const y = 14 - (val / maxEigen) * 12;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="h-10 border-b border-white/[0.08] bg-[#0A0A0C] px-3.5 flex items-center justify-between text-xs font-mono select-none z-10 shrink-0">
      {/* Left: Topology Cardinality & Graph Density */}
      <div className="flex items-center space-x-3 text-zinc-400">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Graph</span>
          <span className="text-zinc-200 font-medium">|V|={nodeCount}</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-200 font-medium">|E|={edgeCount}</span>
        </div>

        <div className="h-3 w-[1px] bg-zinc-800" />

        {/* Fiedler Value & Spectrum Sparkline */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold" title="Algebraic Connectivity (2nd smallest Laplacian eigenvalue)">
            Fiedler λ₂
          </span>
          {fiedler !== null ? (
            <div className="flex items-center space-x-1.5">
              <span className={`font-semibold ${fiedler > 0.001 ? "text-violet-400" : "text-amber-400"}`}>
                {fiedler.toFixed(3)}
              </span>
              {eigenvalues.length > 1 && (
                <svg className="w-12 h-3.5 overflow-visible" viewBox="0 0 48 14" fill="none">
                  <polyline
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklinePoints}
                  />
                  {eigenvalues.length > 1 && (
                    <circle
                      cx={(1 / (eigenvalues.length - 1)) * 48}
                      cy={14 - (eigenvalues[1] / maxEigen) * 12}
                      r="2"
                      fill="#8B5CF6"
                    />
                  )}
                </svg>
              )}
            </div>
          ) : (
            <span className="text-zinc-600">—</span>
          )}
        </div>

        <div className="h-3 w-[1px] bg-zinc-800" />

        {/* Max Flow & Min-Cut Capacity */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-zinc-500 uppercase font-semibold">Flow / Cut</span>
          {maxFlow !== null && minCut !== null ? (
            <div className="flex items-center space-x-1.5 text-zinc-200">
              <span className="text-cyan-400 font-semibold">{maxFlow.toFixed(1)}</span>
              <span className="text-zinc-600">/</span>
              <span className="text-cyan-400 font-semibold">{minCut.toFixed(1)}</span>
              <span
                className="text-[9px] px-1 py-0.2 bg-emerald-950/70 text-emerald-400 border border-emerald-500/30 rounded"
                title="Max-Flow Min-Cut Strong Duality Formally Verified"
              >
                DUAL
              </span>
            </div>
          ) : (
            <span className="text-zinc-600">—</span>
          )}
        </div>
      </div>

      {/* Right: Formal SMT Verification Status */}
      <div className="flex items-center space-x-3">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-violet-400 animate-pulse">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[11px] font-semibold tracking-wide">SOLVING Z3 CONSTRAINTS...</span>
          </div>
        ) : verification ? (
          <div className="flex items-center space-x-2">
            {verification.status === "UNSAT" ? (
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold">CERTIFIED RESILIENT (k={failureK})</span>
                <span className="text-[10px] text-emerald-500 font-normal">UNSAT</span>
              </div>
            ) : verification.status === "SAT" ? (
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span className="text-[11px] font-bold">
                  VULNERABLE: {verification.counterexample_nodes.length} SPOF
                </span>
                <span className="text-[10px] text-red-400 font-normal">SAT</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold">INCONCLUSIVE (TIMEOUT)</span>
              </div>
            )}

            {duration !== null && (
              <span className="text-[10px] text-zinc-500">
                {duration.toFixed(1)}ms
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 text-zinc-500 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-zinc-700 inline-block" />
            <span>SMT READY · AWAITING RUN</span>
          </div>
        )}
      </div>
    </div>
  );
}
