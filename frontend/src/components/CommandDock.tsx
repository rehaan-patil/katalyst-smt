"use client";

import React from "react";
import { Play, Wrench, Loader2, Sliders } from "lucide-react";

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
      <div className="px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl flex items-center space-x-3.5 text-xs text-slate-800">
        {/* Outage Simulation Parameter */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-slate-500 font-medium text-[11px] flex items-center space-x-1">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulate Outages (k):</span>
          </span>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4].map((kVal) => (
              <button
                key={kVal}
                onClick={() => onFailureKChange(kVal)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                  failureK === kVal
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
                title={`Simulate up to ${kVal} simultaneous node outages`}
              >
                {kVal}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-1 p-0.5 rounded-xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => onFailureModeChange("at_most")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              failureMode === "at_most"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Simulate 1 up to k outages"
          >
            ≤ {failureK} Outages
          </button>
          <button
            onClick={() => onFailureModeChange("exact")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              failureMode === "exact"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 font-semibold"
                : "text-slate-500 hover:text-slate-900"
            }`}
            title="Simulate exactly k outages"
          >
            = {failureK} Exact
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Primary Action Button */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm disabled:opacity-60"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Checking Resilience...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test Network Resilience</span>
            </>
          )}
        </button>

        {/* Suggest Repairs CTA */}
        {hasVulnerability && (
          <button
            onClick={onSuggestRepairs}
            disabled={isRepairing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold text-xs transition-all shadow-sm"
          >
            {isRepairing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                <span>Generating Fix...</span>
              </>
            ) : (
              <>
                <Wrench className="w-3.5 h-3.5 text-rose-600" />
                <span>Suggest Architecture Fix</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
