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
  Sparkles,
  ArrowRight,
  Boxes,
  Cpu,
  Database,
  Globe,
  Radio,
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
  const [activeTab, setActiveTab] = useState<"templates" | "add" | "history">("templates");
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
      className={`border-r border-slate-200 bg-white transition-all duration-300 flex flex-col z-20 select-none ${
        collapsed ? "w-14" : "w-72"
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-12 border-b border-slate-200 px-3.5 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <Boxes className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-800">
              Architecture Library
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {collapsed ? (
        <div className="p-2 space-y-3 flex flex-col items-center pt-3">
          <button
            onClick={() => { setCollapsed(false); setActiveTab("templates"); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === "templates" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title="Templates"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCollapsed(false); setActiveTab("add"); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === "add" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title="Add Service"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCollapsed(false); setActiveTab("history"); }}
            className={`p-2 rounded-lg transition-colors ${
              activeTab === "history" ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            }`}
            title="Test History"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("templates")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "templates"
                  ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "add"
                  ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              Add Service
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                activeTab === "history"
                  ? "bg-white text-blue-600 border border-slate-200 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
              }`}
            >
              History ({history.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* TAB 1: TEMPLATES */}
            {activeTab === "templates" && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-500 leading-relaxed px-0.5">
                  Pre-configured sample architectures to test resilience:
                </p>
                {SAMPLE_TOPOLOGIES.map((preset) => {
                  const isVuln = preset.difficulty.toLowerCase().includes("vulnerable");
                  const isResilient = preset.difficulty.toLowerCase().includes("resilient");
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onLoadPreset(preset)}
                      className="w-full text-left p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 truncate">
                          {preset.name}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            isVuln
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isResilient
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {preset.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                        {preset.description}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span>{preset.topology.nodes.length} services · {preset.topology.edges.length} links</span>
                        <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center space-x-0.5">
                          <span>Load</span>
                          <ArrowRight className="w-3 h-3 inline" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: ADD SERVICE */}
            {activeTab === "add" && (
              <div className="space-y-3.5">
                <p className="text-[11px] text-slate-500 leading-relaxed px-0.5">
                  Create a new microservice node and place it on the canvas:
                </p>

                <form onSubmit={handleAdd} className="space-y-3">
                  {/* Service Role */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Service Type
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "ingress", label: "Gateway", icon: <Globe className="w-3.5 h-3.5 text-blue-600" /> },
                        { id: "service", label: "Service", icon: <Cpu className="w-3.5 h-3.5 text-indigo-600" /> },
                        { id: "cache", label: "Cache / Queue", icon: <Layers className="w-3.5 h-3.5 text-amber-600" /> },
                        { id: "db", label: "Database", icon: <Database className="w-3.5 h-3.5 text-emerald-600" /> },
                      ].map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setSelectedRole(role.id as any)}
                          className={`flex items-center space-x-1.5 p-2 rounded-lg border text-xs transition-all ${
                            selectedRole === role.id
                              ? "bg-blue-50 border-blue-400 text-blue-900 font-medium shadow-sm"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {role.icon}
                          <span className="text-[11px]">{role.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Node ID */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Service ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. auth-service"
                      value={newNodeId}
                      onChange={(e) => setNewNodeId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Label */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Auth Gateway"
                      value={newNodeLabel}
                      onChange={(e) => setNewNodeLabel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Service to Canvas</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: TEST HISTORY */}
            {activeTab === "history" && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-slate-500 leading-relaxed px-0.5">
                  Recent test results in this session:
                </p>
                {history.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
                    <History className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-xs font-medium text-slate-600">No tests run yet</p>
                    <p className="text-[11px] text-slate-400">
                      Click &quot;Test Network Resilience&quot; below to run your first simulation.
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
                          className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between group shadow-sm"
                        >
                          <div>
                            <div className="text-xs font-semibold text-slate-800">
                              Simulated {item.k} Outage{item.k > 1 ? "s" : ""}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {item.timestamp} · {item.result.execution_duration_ms.toFixed(0)}ms
                            </div>
                          </div>
                          {isUnsat ? (
                            <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="w-3 h-3" />
                              <span>PASSED</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              <ShieldAlert className="w-3 h-3" />
                              <span>FAILED</span>
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
