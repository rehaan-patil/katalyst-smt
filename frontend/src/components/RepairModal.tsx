"use client";

import React from "react";
import { SuggestRepairsResponse, RepairCandidate, TopologyEdge } from "@/lib/types";
import {
  X,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  Coins,
  TrendingUp,
  Cpu,
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-panel rounded-xl border border-white/10 shadow-2xl overflow-hidden font-mono text-xs flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="h-14 border-b border-white/10 px-6 flex items-center justify-between bg-black/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded bg-cyberViolet/20 border border-cyberViolet/40 flex items-center justify-center text-cyberViolet-light">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                Proof-to-Repair Remediation Engine
              </h2>
              <p className="text-[10px] text-gray-500">
                SMT Counterexample-Guided Synthesis & Formal Re-Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Root Cause Banner */}
          <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-500/30 text-red-300 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Root Cause Diagnosis</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              {data.root_cause_diagnosis}
            </p>
          </div>

          {/* Candidates List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Synthesized Remediation Candidates ({data.candidates.length})
              </span>
              <span className="text-[10px] text-gray-500">
                Optimized by Cost & Re-Verified
              </span>
            </div>

            {data.candidates.length === 0 ? (
              <div className="p-4 rounded bg-black border border-white/5 text-center text-gray-500">
                No admissible candidate modifications could be generated.
              </div>
            ) : (
              <div className="space-y-3">
                {data.candidates.map((cand) => {
                  const isRecommended = cand.candidate_id === data.recommended_candidate_id;
                  return (
                    <div
                      key={cand.candidate_id}
                      className={`p-4 rounded-lg border transition-all ${
                        isRecommended
                          ? "bg-black/80 border-cyberViolet shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                          : "bg-black/40 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">
                            {cand.candidate_id}
                          </span>
                          {isRecommended && (
                            <span className="px-2 py-0.5 rounded bg-cyberViolet/20 text-cyberViolet-light border border-cyberViolet/40 text-[10px] font-bold">
                              RECOMMENDED
                            </span>
                          )}
                          {cand.is_verified ? (
                            <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px]">
                              <ShieldCheck className="w-3 h-3" />
                              <span>FORMALLY VERIFIED (UNSAT)</span>
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[10px]">
                              PARTIAL GAIN (SAT)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-gray-400 text-[11px]">
                          <span className="flex items-center space-x-1">
                            <Coins className="w-3 h-3 text-yellow-400" />
                            <span>Cost: {cand.estimated_cost}</span>
                          </span>
                          {cand.new_throughput !== undefined && (
                            <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                              <TrendingUp className="w-3 h-3" />
                              <span>Flow: {cand.new_throughput.toFixed(1)}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
                        {cand.structural_gain}
                      </p>

                      {/* Added Edge Display */}
                      <div className="p-2 rounded bg-panel border border-white/5 flex items-center justify-between text-[11px] mb-3">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <PlusCircle className="w-3.5 h-3.5 text-cyberViolet" />
                          <span>Add Directed Edge:</span>
                          <strong className="text-white">{cand.added_edges[0]?.source}</strong>
                          <ArrowRight className="w-3 h-3 text-gray-600" />
                          <strong className="text-white">{cand.added_edges[0]?.target}</strong>
                        </div>
                        <span className="text-gray-500 text-[10px]">
                          Capacity: {cand.added_edges[0]?.capacity} units
                        </span>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            onApplyRepair(cand);
                            onClose();
                          }}
                          className={`px-3 py-1.5 rounded font-semibold text-xs tracking-wide transition-all ${
                            isRecommended
                              ? "bg-cyberViolet hover:bg-cyberViolet-dark text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                              : "bg-white/10 hover:bg-white/20 text-white"
                          }`}
                        >
                          Apply Repair to Canvas
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
