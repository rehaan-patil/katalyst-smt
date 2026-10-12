"use client";

import React, { useState } from "react";
import { SAMPLE_TOPOLOGIES, TopologyPreset } from "@/lib/sample-topologies";
import { Topology, AnalyzeTopologyResponse } from "@/lib/types";
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
  const [newNodeId, setNewNodeId] = useState("");
  const [newNodeLabel, setNewNodeLabel] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeId.trim()) return;
    onAddNode(newNodeId.trim(), newNodeLabel.trim() || newNodeId.trim());
    setNewNodeId("");
    setNewNodeLabel("");
  };

  return (
    <aside
      className={`border-r border-white/10 bg-panel transition-all duration-300 flex flex-col z-10 ${
        collapsed ? "w-12" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="h-12 border-b border-white/10 px-3 flex items-center justify-between">
        {!collapsed && (
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-gray-400">
            Topology Library
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors ml-auto"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {collapsed ? (
        <div className="p-2 space-y-4 flex flex-col items-center">
          <Layers className="w-5 h-5 text-gray-400 hover:text-cyberViolet cursor-pointer" />
          <History className="w-5 h-5 text-gray-400 hover:text-cyberViolet cursor-pointer" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Presets */}
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-mono font-medium text-gray-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-cyberViolet" />
              <span>Architectural Presets</span>
            </div>
            <div className="space-y-1.5">
              {SAMPLE_TOPOLOGIES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onLoadPreset(preset)}
                  className="w-full text-left p-2 rounded bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-mono text-xs font-semibold text-gray-200 group-hover:text-white truncate">
                      {preset.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1 rounded ${
                        preset.difficulty.includes("Vulnerable")
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {preset.difficulty}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-2">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Node Adder */}
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-mono font-medium text-gray-400 mb-2">
              <Plus className="w-3.5 h-3.5 text-neonBlue" />
              <span>Add Node</span>
            </div>
            <form onSubmit={handleAdd} className="space-y-2">
              <input
                type="text"
                placeholder="Node ID (e.g., redis-cache)"
                value={newNodeId}
                onChange={(e) => setNewNodeId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-black border border-white/10 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyberViolet"
              />
              <input
                type="text"
                placeholder="Label (optional)"
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-black border border-white/10 text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyberViolet"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded bg-cyberViolet/20 hover:bg-cyberViolet/30 text-cyberViolet-light border border-cyberViolet/40 text-xs font-mono font-medium transition-colors"
              >
                Insert Node to Canvas
              </button>
            </form>
          </div>

          {/* Analysis History */}
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-mono font-medium text-gray-400 mb-2">
              <History className="w-3.5 h-3.5 text-gray-400" />
              <span>Session History ({history.length})</span>
            </div>
            {history.length === 0 ? (
              <p className="text-[11px] font-mono text-gray-600 italic">
                No analyses run in this session.
              </p>
            ) : (
              <div className="space-y-1.5">
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectHistory(item.result)}
                    className="w-full text-left p-2 rounded bg-black/40 hover:bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono transition-colors"
                  >
                    <div>
                      <div className="text-[11px] text-gray-300">
                        k = {item.k} failure search
                      </div>
                      <div className="text-[9px] text-gray-500">
                        {item.timestamp}
                      </div>
                    </div>
                    {item.result.verification.status === "UNSAT" ? (
                      <span className="flex items-center space-x-1 text-[10px] text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span>UNSAT</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] text-red-400">
                        <ShieldAlert className="w-3 h-3" />
                        <span>SAT</span>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
