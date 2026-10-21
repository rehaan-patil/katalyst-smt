"use client";

import React from "react";
import { Play, Wrench, ShieldCheck, ShieldAlert, Loader2, Sparkles, Sliders } from "lucide-react";

interface CommandDockProps {
  failureK: number;
  onFailureKChange: (k: number) => void;
  failureMode: "at_most" | "exact";
  onFailureModeChange: (mode: "at_most" | "exact") => void;
  onAnalyze: () => void;
  onSuggestRepairs: () => void;
  isAnalyzing: boolean;
  isRepairing: boolean;
  hasVulnerability: boolean;
}

export function CommandDock({
  failureK,
  onFailureKChange,
  failureMode,
  onFailureModeChange,
  onAnalyze,
  onSuggestRepairs,
  isAnalyzing,
  isRepairing,
  hasVulnerability,
}: CommandDockProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 select-none">
      <div className="px-4 py-2.5 rounded-2xl bg-[#090D15]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_12px_40px_rgba(0,0,0,0.8)] flex items-center space-x-3.5 text-xs ring-1 ring-white/[0.05]">
        {/* Failure parameter k selector */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/[0.07]">
          <span className="text-slate-400 font-sans font-medium text-[11px] flex items-center space-x-1">
            <Sliders className="w-3 h-3 text-indigo-400" />
            <span>Tolerance (k):</span>
          </span>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4].map((kVal) => (
              <button
                key={kVal}
                onClick={() => onFailureKChange(kVal)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-[11px] transition-all ${
                  failureK === kVal
                    ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.6)] scale-105"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                }`}
                title={`Test resilience against up to ${kVal} concurrent node failures`}
              >
                {kVal}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-900/90 border border-white/[0.07]">
          <button
            onClick={() => onFailureModeChange("at_most")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-medium transition-all ${
              failureMode === "at_most"
                ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Failures ≤ k (at most k nodes fail)"
          >
            ≤ k (At-Most)
          </button>
          <button
            onClick={() => onFailureModeChange("exact")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-medium transition-all ${
              failureMode === "exact"
                ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Failures = k (exactly k nodes fail)"
          >
            = k (Exact)
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/[0.08]" />

        {/* Primary Analyze Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-sans font-semibold text-xs tracking-wide transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] disabled:opacity-50 hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Solving Constraints with Z3...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Verify Infrastructure Resilience</span>
            </>
          )}
        </button>

        {/* Proof-to-Repair Button */}
        {hasVulnerability && (
          <button
            onClick={onSuggestRepairs}
            disabled={isRepairing}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-indigo-500/20 hover:from-rose-500/30 hover:to-indigo-500/30 text-rose-300 border border-rose-500/40 font-sans font-semibold text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
          >
            {isRepairing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5 text-rose-400" />
                <span>Synthesize Repairs</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

