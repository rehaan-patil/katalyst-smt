"use client";

import React, { useState } from "react";
import { SAMPLE_TOPOLOGIES, TopologyPreset } from "@/lib/sample-topologies";
import { AnalyzeTopologyResponse } from "@/lib/types";
import {
  Layers,
  Plus,
  History,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Server,
  Sparkles,
  ArrowRight,
  Boxes,
  Cpu,
  Database,
  Globe,
  SlidersHorizontal,
} from "lucide-react";

interface AppSidebarProps {
  onLoadPreset: (preset: TopologyPreset) => void;
  onAddNode: (id: string, label: string) => void;
  history: Array<{
    timestamp: string;
    k: number;
    result: AnalyzeTopologyResponse;
  }>;
  onSelectHistory: (item: AnalyzeTopologyResponse) => void;
}

export function AppSidebar({
  onLoadPreset,
  onAddNode,
  history,
  onSelectHistory,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "architect" | "history">("presets");
  const [newNodeId, setNewNodeId] = useState("");
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [selectedRole, setSelectedRole] = useState<"ingress" | "service" | "db" | "cache">("service");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeId.trim()) return;
    onAddNode(newNodeId.trim(), newNodeLabel.trim() || newNodeId.trim());
    setNewNodeId("");
    setNewNodeLabel("");
  };

  return (
    <aside
      className={`border-r border-white/[0.08] bg-[#090D15]/95 backdrop-blur-xl transition-all duration-300 flex flex-col z-20 ${
        collapsed ? "w-14" : "w-72"
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-12 border-b border-white/[0.08] px-3.5 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-indigo-400" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-200">
              Topology Hub
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors ml-auto"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {collapsed ? (
        <div className="p-2 space-y-4 flex flex-col items-center pt-4">
          <button
            onClick={() => { setCollapsed(false); setActiveTab("presets"); }}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/[0.06] transition-colors"
            title="Presets"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setCollapsed(false); setActiveTab("architect"); }}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/[0.06] transition-colors"
            title="Architect Node"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setCollapsed(false); setActiveTab("history"); }}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/[0.06] transition-colors"
            title="Audit Proof History"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="flex border-b border-white/[0.08] bg-black/20 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("presets")}
              className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs font-medium transition-all ${
                activeTab === "presets"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setActiveTab("architect")}
              className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs font-medium transition-all ${
                activeTab === "architect"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              Architect
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-1.5 px-2 rounded-md font-sans text-xs font-medium transition-all ${
                activeTab === "history"
                  ? "bg-indigo-600/30 text-indigo-200 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
              }`}
            >
              Audit ({history.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* TAB 1: PRESETS */}
            {activeTab === "presets" && (
              <div className="space-y-3">
                <div className="text-[11px] font-sans text-slate-400 leading-relaxed px-1">
                  Validated infrastructure architectures pre-configured for fault-injection analysis:
                </div>
                {SAMPLE_TOPOLOGIES.map((preset) => {
                  const isVuln = preset.difficulty.includes("Vulnerable");
                  const isResilient = preset.difficulty.includes("Resilient");
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onLoadPreset(preset)}
                      className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.06] hover:border-indigo-500/40 transition-all group shadow-sm hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-sans text-xs font-semibold text-slate-100 group-hover:text-white truncate">
                          {preset.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded-full border ${
                            isVuln
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : isResilient
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                          }`}
                        >
                          {preset.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans line-clamp-2 leading-relaxed mb-2">
                        {preset.description}
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-2 border-t border-white/[0.04]">
                        <span>|V|={preset.topology.nodes.length} · |E|={preset.topology.edges.length}</span>
                        <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                          <span>Load</span>
                          <ArrowRight className="w-3 h-3 inline" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: ARCHITECT NODE */}
            {activeTab === "architect" && (
              <div className="space-y-4">
                <div className="text-[11px] font-sans text-slate-400 leading-relaxed px-1">
                  Synthesize and inject custom microservice instances into the verification mesh:
                </div>

                <form onSubmit={handleAdd} className="space-y-3">
                  {/* Service Archetype */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                      Service Archetype
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "ingress", label: "Gateway", icon: <Globe className="w-3 h-3 text-emerald-400" /> },
                        { id: "service", label: "Service", icon: <Cpu className="w-3 h-3 text-indigo-400" /> },
                        { id: "cache", label: "Queue/Cache", icon: <Layers className="w-3 h-3 text-amber-400" /> },
                        { id: "db", label: "Data Store", icon: <Database className="w-3 h-3 text-cyan-400" /> },
                      ].map((arch) => (
                        <button
                          key={arch.id}
                          type="button"
                          onClick={() => setSelectedRole(arch.id as any)}
                          className={`flex items-center space-x-1.5 p-2 rounded-lg border text-xs font-sans transition-all ${
                            selectedRole === arch.id
                              ? "bg-indigo-600/30 border-indigo-500 text-white shadow-sm"
                              : "bg-slate-900/60 border-white/[0.06] text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {arch.icon}
                          <span className="text-[11px] font-medium">{arch.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Node ID */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                      Unique Node ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., redis-cache-primary"
                      value={newNodeId}
                      onChange={(e) => setNewNodeId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-white/[0.08] text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Label */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400">
                      Display Label (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Redis Cluster Zone A"
                      value={newNodeLabel}
                      onChange={(e) => setNewNodeLabel(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900/90 border border-white/[0.08] text-xs font-sans text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-sans text-xs font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.35)] flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Insert Node to Canvas</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: AUDIT HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-3">
                <div className="text-[11px] font-sans text-slate-400 leading-relaxed px-1">
                  Chronological formal verification solver executions in this session:
                </div>
                {history.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-900/40 border border-white/[0.05] text-center space-y-2">
                    <History className="w-6 h-6 text-slate-600 mx-auto" />
                    <p className="text-xs font-sans text-slate-400">No verification runs yet.</p>
                    <p className="text-[11px] font-sans text-slate-600">
                      Trigger formal analysis from the bottom command dock to record solver proofs.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, idx) => {
                      const isUnsat = item.result.verification.status === "UNSAT";
                      return (
                        <button
                          key={idx}
                          onClick={() => onSelectHistory(item.result)}
                          className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/[0.06] hover:border-indigo-500/40 transition-all flex items-center justify-between group shadow-sm"
                        >
                          <div>
                            <div className="text-[11px] font-sans font-medium text-slate-200">
                              k = {item.k} Failure Search
                            </div>
                            <div className="text-[9.5px] font-mono text-slate-500 mt-0.5">
                              {item.timestamp} · {item.result.execution_duration_ms.toFixed(1)}ms
                            </div>
                          </div>
                          {isUnsat ? (
                            <span className="flex items-center space-x-1 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3" />
                              <span>UNSAT</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              <ShieldAlert className="w-3 h-3" />
                              <span>SAT</span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

