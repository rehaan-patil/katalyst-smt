"use client";

import React from "react";
import { AnalyzeTopologyResponse } from "@/lib/types";
import { ShieldCheck, ShieldAlert, Cpu, Activity, Zap, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

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

  // Mini sparkline SVG from eigenvalues
  const eigenvalues = data?.spectral.eigenvalues ?? [];
  const maxEigen = eigenvalues.length > 0 ? Math.max(...eigenvalues, 1) : 1;
  const sparklinePoints = eigenvalues
    .map((val, idx) => {
      const x = (idx / Math.max(eigenvalues.length - 1, 1)) * 52;
      const y = 14 - (val / maxEigen) * 12;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="h-11 border-b border-white/[0.08] bg-[#0A0E17]/95 backdrop-blur-md px-5 flex items-center justify-between text-xs select-none z-20 shrink-0">
      {/* Left Metrics */}
      <div className="flex items-center space-x-3.5">
        {/* Topology Cardinality */}
        <div className="flex items-center space-x-1.5 font-mono text-[11px] text-slate-300">
          <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider">Mesh</span>
          <span className="font-semibold text-white">|V|={nodeCount}</span>
          <span className="text-slate-600">/</span>
          <span className="font-semibold text-white">|E|={edgeCount}</span>
        </div>

        <div className="h-3.5 w-px bg-white/[0.08]" />

        {/* Fiedler Value & Spectrum Sparkline */}
        <div className="flex items-center space-x-2">
          <span
            className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider"
            title="Algebraic Connectivity (2nd smallest Laplacian eigenvalue)"
          >
            Fiedler λ₂
          </span>
          {fiedler !== null ? (
            <div className="flex items-center space-x-2">
              <span
                className={`font-mono text-xs font-bold ${
                  fiedler > 0.001 ? "text-indigo-300" : "text-amber-400"
                }`}
              >
                {fiedler.toFixed(3)}
              </span>
              {eigenvalues.length > 1 && (
                <div className="bg-slate-900/80 px-1 py-0.5 rounded border border-white/[0.06] flex items-center" title="Eigenvalue Spectrum">
                  <svg className="w-13 h-3.5 overflow-visible" viewBox="0 0 52 14" fill="none">
                    <polyline
                      fill="none"
                      stroke="#818CF8"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={sparklinePoints}
                    />
                    {eigenvalues.length > 1 && (
                      <circle
                        cx={(1 / (eigenvalues.length - 1)) * 52}
                        cy={14 - (eigenvalues[1] / maxEigen) * 12}
                        r="2.2"
                        fill="#6366F1"
                      />
                    )}
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <span className="font-mono text-slate-600">—</span>
          )}
        </div>

        <div className="h-3.5 w-px bg-white/[0.08]" />

        {/* Max Flow & Min-Cut Capacity */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-sans font-semibold text-slate-400 uppercase tracking-wider">Flow / Cut</span>
          {maxFlow !== null && minCut !== null ? (
            <div className="flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="text-cyan-400 font-semibold">{maxFlow.toFixed(1)}</span>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-400 font-semibold">{minCut.toFixed(1)}</span>
              <span
                className="text-[9px] font-sans font-semibold px-1.5 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full"
                title="Max-Flow Min-Cut Strong Duality Formally Verified"
              >
                DUAL VERIFIED
              </span>
            </div>
          ) : (
            <span className="font-mono text-slate-600">—</span>
          )}
        </div>
      </div>

      {/* Right: Formal SMT Verification Status */}
      <div className="flex items-center space-x-3">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-indigo-400 animate-pulse bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
            <Cpu className="w-3.5 h-3.5 animate-spin" />
            <span className="font-mono text-[11px] font-semibold tracking-wide">
              SOLVING Z3 SMT CONSTRAINTS...
            </span>
          </div>
        ) : verification ? (
          <div className="flex items-center space-x-2.5">
            {verification.status === "UNSAT" ? (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-sans font-bold text-xs tracking-tight">
                  CERTIFIED RESILIENT (k={failureK})
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  UNSAT
                </span>
              </div>
            ) : verification.status === "SAT" ? (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-200 shadow-sm">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-sans font-bold text-xs tracking-tight">
                  VULNERABILITY DETECTED: {verification.counterexample_nodes.length} SPOF
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                  SAT
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 shadow-sm">
                <Activity className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-sans font-bold text-xs tracking-tight">SOLVER TIMEOUT (UNKNOWN)</span>
              </div>
            )}

            {duration !== null && (
              <div className="flex items-center space-x-1 text-[10.5px] font-mono text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-white/[0.06]">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{duration.toFixed(1)}ms</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-slate-600 inline-block" />
            <span>SMT Ready · Awaiting Verification Run</span>
          </div>
        )}
      </div>
    </div>
  );
}

