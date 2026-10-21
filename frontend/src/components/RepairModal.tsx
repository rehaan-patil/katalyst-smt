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
  CheckCircle2,
  Wrench,
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Recommended Architecture Fix
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold">
                  Auto-Synthesized
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Eliminate single points of failure with verified redundant connections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Root Cause Banner */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
            <div className="flex items-center space-x-2 font-semibold text-xs text-rose-700">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Root Cause Diagnosis</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {data.root_cause_diagnosis}
            </p>
          </div>

          {/* Candidates Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Available Fix Options
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                  {data.candidates.length} options generated
                </span>
              </div>
              <span className="text-xs text-slate-500">
                Ranked by lowest implementation cost
              </span>
            </div>

            {data.candidates.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs">
                No admissible candidate modifications could satisfy routing constraints.
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
                          ? "bg-blue-50/20 border-blue-400 shadow-sm ring-1 ring-blue-400/30"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {cand.candidate_id}
                          </span>
                          {isRecommended && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                              RECOMMENDED
                            </span>
                          )}
                          {cand.is_verified ? (
                            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified Resilient</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                              Partial Gain
                            </span>
                          )}
                        </div>

                        {/* Cost & Flow Badges */}
                        <div className="flex items-center space-x-3 text-xs">
                          <div className="flex items-center space-x-1 text-slate-600">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>Cost: {cand.estimated_cost}</span>
                          </div>
                          {cand.new_throughput !== undefined && (
                            <div className="flex items-center space-x-1 text-emerald-700 font-semibold">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Flow: {cand.new_throughput.toFixed(1)} req/s</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        {cand.structural_gain}
                      </p>

                      {/* Edge Insertion Visual */}
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center text-blue-700">
                            <PlusCircle className="w-3 h-3" />
                          </div>
                          <span className="text-slate-500 font-medium text-[11px]">
                            Add Redundant Link:
                          </span>
                          <div className="flex items-center space-x-1.5 font-mono text-xs">
                            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-900">
                              {cand.added_edges[0]?.source}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-900">
                              {cand.added_edges[0]?.target}
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-600">
                          Capacity:{" "}
                          <strong className="text-emerald-700">
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
                          className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center space-x-1.5 ${
                            isRecommended
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200"
                          }`}
                        >
                          <GitBranch className="w-3.5 h-3.5" />
                          <span>Apply Fix to Architecture Map</span>
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
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>The modified architecture is mathematically verified before applying.</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
