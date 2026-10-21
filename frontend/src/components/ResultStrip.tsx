"use client";

import React from "react";
import { AnalyzeTopologyResponse } from "@/lib/types";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  Loader2,
  TrendingUp,
  Activity,
} from "lucide-react";

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
    <div className="h-11 border-b border-slate-200 bg-white px-5 flex items-center justify-between text-xs select-none z-20 shrink-0">
      {/* Left: Key Network Metrics */}
      <div className="flex items-center space-x-4">
        {/* Connectivity Score */}
        <div className="flex items-center space-x-2">
          <span
            className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide"
            title="Algebraic connectivity of the network graph"
          >
            Connectivity Strength
          </span>
          {fiedler !== null ? (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-900">
                {fiedler.toFixed(2)}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  fiedler > 0.5
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : fiedler > 0.05
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {fiedler > 0.5 ? "High Redundancy" : fiedler > 0.05 ? "Normal" : "Fragile"}
              </span>

              {eigenvalues.length > 1 && (
                <div
                  className="bg-slate-50 px-1 py-0.5 rounded border border-slate-200 flex items-center"
                  title="Eigenvalue spectrum distribution"
                >
                  <svg className="w-12 h-3.5 overflow-visible" viewBox="0 0 52 14" fill="none">
                    <polyline
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={sparklinePoints}
                    />
                    {eigenvalues.length > 1 && (
                      <circle
                        cx={(1 / (eigenvalues.length - 1)) * 52}
                        cy={14 - (eigenvalues[1] / maxEigen) * 12}
                        r="2"
                        fill="#2563EB"
                      />
                    )}
                  </svg>
                </div>
              )}
            </div>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>

        <div className="h-4 w-px bg-slate-200" />

        {/* Max Throughput */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Max Throughput
          </span>
          {maxFlow !== null ? (
            <div className="flex items-center space-x-1.5">
              <span className="font-semibold text-slate-900">
                {maxFlow.toFixed(1)} req/s
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium">
                Verified
              </span>
            </div>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </div>
      </div>

      {/* Right: Verification Status */}
      <div className="flex items-center space-x-3">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs font-medium">Testing network resilience...</span>
          </div>
        ) : verification ? (
          <div className="flex items-center space-x-2">
            {verification.status === "UNSAT" ? (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-xs">
                  Resilient against {failureK} simultaneous outage{failureK > 1 ? "s" : ""}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  PASSED
                </span>
              </div>
            ) : verification.status === "SAT" ? (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold text-xs">
                  Vulnerability Found: {verification.counterexample_nodes.join(", ") || "Cut failure"} breaks traffic
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                  FAILED
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                <Activity className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-xs">Simulation Inconclusive</span>
              </div>
            )}

            {duration !== null && (
              <div className="flex items-center space-x-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{duration.toFixed(0)} ms</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-slate-500 text-xs">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
            <span>Ready · Click &quot;Test Resilience&quot; below to evaluate</span>
          </div>
        )}
      </div>
    </div>
  );
}
