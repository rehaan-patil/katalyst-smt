"use client";

import React from "react";
import { Play, Wrench, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 font-mono">
      <div className="px-3 py-2 rounded-xl bg-panel/90 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center space-x-3 text-xs">
        {/* Failure parameter k selector */}
        <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-black border border-white/5">
          <span className="text-gray-400 font-semibold text-[11px]">Failures (k):</span>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4].map((kVal) => (
              <button
                key={kVal}
                onClick={() => onFailureKChange(kVal)}
                className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] transition-colors ${
                  failureK === kVal
                    ? "bg-cyberViolet text-white shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                }`}
              >
                {kVal}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-1 px-1 py-1 rounded-lg bg-black border border-white/5">
          <button
            onClick={() => onFailureModeChange("at_most")}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              failureMode === "at_most"
                ? "bg-white/10 text-white font-semibold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            ≤ k
          </button>
          <button
            onClick={() => onFailureModeChange("exact")}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              failureMode === "exact"
                ? "bg-white/10 text-white font-semibold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            = k
          </button>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-white/10" />

        {/* Primary Analyze Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyberViolet to-neonBlue hover:from-cyberViolet-dark hover:to-neonBlue-dark text-white font-semibold text-xs tracking-wide transition-all shadow-[0_0_16px_rgba(139,92,246,0.3)] disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying with Z3...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Analyze Topology</span>
            </>
          )}
        </button>

        {/* Proof-to-Repair Button */}
        {hasVulnerability && (
          <button
            onClick={onSuggestRepairs}
            disabled={isRepairing}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-cyberViolet/20 hover:bg-cyberViolet/30 text-cyberViolet-light border border-cyberViolet/40 font-medium text-xs tracking-wide transition-all shadow-[0_0_12px_rgba(139,92,246,0.2)] animate-pulse"
          >
            {isRepairing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5" />
                <span>Synthesize Repairs</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
