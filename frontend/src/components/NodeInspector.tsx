"use client";

import React from "react";
import { TopologyNode } from "@/lib/types";
import {
  X,
  Trash2,
  ArrowRightCircle,
  ArrowLeftCircle,
  Cpu,
  Layers,
  Activity,
  Zap,
  Sliders,
  AlertTriangle,
} from "lucide-react";

interface NodeInspectorProps {
  node: TopologyNode | null;
  isSource: boolean;
  isSink: boolean;
  onClose: () => void;
  onUpdate: (updated: TopologyNode) => void;
  onSetSource: (id: string) => void;
  onSetSink: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NodeInspector({
  node,
  isSource,
  isSink,
  onClose,
  onUpdate,
  onSetSource,
  onSetSink,
  onDelete,
}: NodeInspectorProps) {
  if (!node) return null;

  const failurePercent = ((node.failure_prob ?? 0.01) * 100).toFixed(1);

  return (
    <div className="absolute top-4 right-4 w-80 rounded-xl bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/80 z-30 flex flex-col overflow-hidden animate-fade-in text-slate-200">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900/90 to-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold tracking-tight text-white">
                Node Inspector
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                v1.2
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Config & Telemetry Attributes
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Close Inspector"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
        {/* Node Identifier */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 flex items-center space-x-1">
              <span>Vertex Identifier</span>
            </label>
            <span className="text-[9px] font-mono text-slate-500">Immutable</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-white font-mono text-xs select-all flex items-center justify-between">
            <span className="font-bold text-slate-200">{node.id}</span>
            <div className="flex items-center space-x-1">
              {isSource && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-semibold">
                  SRC
                </span>
              )}
              {isSink && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[9px] font-semibold">
                  SNK
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Node Display Name / Label */}
        <div>
          <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block mb-1.5">
            Service Label
          </label>
          <input
            type="text"
            value={node.label || ""}
            onChange={(e) => onUpdate({ ...node, label: e.target.value })}
            placeholder="e.g. Ingress Gateway"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 text-xs placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
          />
        </div>

        {/* Capacity */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-brand-400" />
              <span>Throughput Capacity</span>
            </label>
            <span className="text-[10px] font-mono text-brand-400">
              {node.capacity ? `${node.capacity} req/s` : "Unbounded"}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="5"
              placeholder="Unlimited capacity"
              value={node.capacity ?? ""}
              onChange={(e) =>
                onUpdate({
                  ...node,
                  capacity: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full pl-3 pr-14 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
            />
            <span className="absolute right-3 top-1.5 text-[10px] font-mono text-slate-500 pointer-events-none">
              req/s
            </span>
          </div>
        </div>

        {/* Failure Probability Slider */}
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-300 flex items-center space-x-1">
              <Activity className="w-3 h-3 text-rose-400" />
              <span>Failure Probability (p)</span>
            </label>
            <span className="text-xs font-mono font-bold text-rose-400">
              {failurePercent}%
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="0.20"
            step="0.005"
            value={node.failure_prob ?? 0.01}
            onChange={(e) =>
              onUpdate({
                ...node,
                failure_prob: parseFloat(e.target.value) || 0.0,
              })
            }
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />

          <div className="flex justify-between text-[9px] font-mono text-slate-500">
            <span>0% (Resilient)</span>
            <span>10%</span>
            <span>20% (High Risk)</span>
          </div>
        </div>

        {/* Terminal Roles (Source / Sink) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 block">
            Topological Boundary
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSetSource(node.id)}
              disabled={isSource}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-center space-x-1.5 ${
                isSource
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 cursor-default shadow-sm shadow-emerald-500/20"
                  : "bg-slate-900/80 hover:bg-slate-850 hover:border-slate-700 border-slate-800 text-slate-300"
              }`}
            >
              <ArrowRightCircle
                className={`w-3.5 h-3.5 ${isSource ? "text-emerald-400" : "text-slate-400"}`}
              />
              <span className="text-[11px]">{isSource ? "Active Source" : "Set Source"}</span>
            </button>

            <button
              onClick={() => onSetSink(node.id)}
              disabled={isSink}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-center space-x-1.5 ${
                isSink
                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 cursor-default shadow-sm shadow-cyan-500/20"
                  : "bg-slate-900/80 hover:bg-slate-850 hover:border-slate-700 border-slate-800 text-slate-300"
              }`}
            >
              <ArrowLeftCircle
                className={`w-3.5 h-3.5 ${isSink ? "text-cyan-400" : "text-slate-400"}`}
              />
              <span className="text-[11px]">{isSink ? "Active Sink" : "Set Sink"}</span>
            </button>
          </div>
        </div>

        {/* Danger Zone: Delete Node */}
        <div className="pt-2 border-t border-slate-800/80">
          <button
            onClick={() => onDelete(node.id)}
            disabled={isSource || isSink}
            className={`w-full py-2 px-3 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              isSource || isSink
                ? "bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed"
                : "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isSource || isSink ? "Terminals Cannot Be Deleted" : "Decommission Node"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
