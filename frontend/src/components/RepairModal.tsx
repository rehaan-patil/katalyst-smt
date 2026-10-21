"use client";

import React from "react";
import { SuggestRepairsResponse, RepairCandidate } from "@/lib/types";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  Coins,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Sparkles,
  GitBranch,
} from "lucide-react";

interface RepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SuggestRepairsResponse | null;
  onApplyRepair: (candidate: RepairCandidate) => void;
}

export function RepairModal({
  isOpen,
  onClose,
  data,
  onApplyRepair,
}: RepairModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-950 rounded-2xl border border-slate-800/90 shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[85vh] text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-gradient-to-r from-slate-900/95 via-slate-950 to-slate-900/95 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-sm shadow-brand-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Automated Resilience Remediation
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-mono font-semibold">
                  CEGIS-Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Counterexample-Guided Repair Synthesis & Formal SMT Re-Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          {/* Root Cause Banner */}
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-200 space-y-2">
            <div className="flex items-center space-x-2 font-semibold text-xs text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Vulnerability Root Cause Diagnosis</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {data.root_cause_diagnosis}
            </p>
          </div>

          {/* Candidates Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-white tracking-wide uppercase">
                  Synthesized Candidates
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                  {data.candidates.length} admissible
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-sans">
                Ranked by Cost-to-Throughput Pareto Frontier
              </span>
            </div>

            {data.candidates.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-slate-400">
                <Cpu className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs">No admissible candidate repairs could satisfy boundary constraints.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.candidates.map((cand) => {
                  const isRecommended = cand.candidate_id === data.recommended_candidate_id;
                  return (
                    <div
                      key={cand.candidate_id}
                      className={`p-4 rounded-xl border transition-all ${
                        isRecommended
                          ? "bg-slate-900/90 border-brand-500/50 shadow-[0_0_20px_rgba(99,102,241,0.12)] ring-1 ring-brand-500/20"
                          : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {/* Top Header of Candidate */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-mono font-bold text-white text-xs">
                            {cand.candidate_id}
                          </span>
                          {isRecommended && (
                            <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[10px] font-semibold tracking-wide">
                              RECOMMENDED
                            </span>
                          )}
                          {cand.is_verified ? (
                            <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>FORMALLY VERIFIED (UNSAT)</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-medium">
                              PARTIAL GAIN (SAT)
                            </span>
                          )}
                        </div>

                        {/* Cost & Flow Badges */}
                        <div className="flex items-center space-x-3 text-xs font-mono">
                          <div className="flex items-center space-x-1 text-slate-300">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span>Cost: {cand.estimated_cost}</span>
                          </div>
                          {cand.new_throughput !== undefined && (
                            <div className="flex items-center space-x-1 text-emerald-400 font-semibold">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Flow: {cand.new_throughput.toFixed(1)} req/s</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-slate-400 mb-3 leading-relaxed font-sans">
                        {cand.structural_gain}
                      </p>

                      {/* Edge Insertion Visual */}
                      <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-5 h-5 rounded bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                            <PlusCircle className="w-3 h-3" />
                          </div>
                          <span className="text-slate-400 text-[11px] font-medium">
                            Synthesized Topology Edge:
                          </span>
                          <div className="flex items-center space-x-1.5 font-mono">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white font-semibold">
                              {cand.added_edges[0]?.source}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white font-semibold">
                              {cand.added_edges[0]?.target}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-slate-400">
                          Capacity:{" "}
                          <strong className="text-emerald-400">
                            {cand.added_edges[0]?.capacity} req/s
                          </strong>
                        </span>
                      </div>

                      {/* Action */}
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          onClick={() => {
                            onApplyRepair(cand);
                            onClose();
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center space-x-1.5 ${
                            isRecommended
                              ? "bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/30"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          }`}
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Apply Remediation to Canvas</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Remediated graph is mathematically verified before canvas commit.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
