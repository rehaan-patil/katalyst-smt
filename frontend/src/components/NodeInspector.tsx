"use client";

import React from "react";
import { TopologyNode } from "@/lib/types";
import {
  X,
  Trash2,
  ArrowRightCircle,
  ArrowLeftCircle,
  Cpu,
  Activity,
  Zap,
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
    <div className="absolute top-4 right-4 w-80 rounded-xl bg-white border border-slate-200 shadow-xl z-30 flex flex-col overflow-hidden animate-fade-in text-slate-800 select-none">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 block">
              Service Settings
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              id: {node.id}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close Settings"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3.5 max-h-[calc(100vh-220px)] overflow-y-auto">
        {/* Node Identifier */}
        <div>
          <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 block mb-1">
            Service ID
          </label>
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs select-all flex items-center justify-between">
            <span className="font-semibold">{node.id}</span>
            <div className="flex items-center space-x-1">
              {isSource && (
                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[9px] font-bold">
                  SOURCE
                </span>
              )}
              {isSink && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  SINK
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Display Label */}
        <div>
          <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 block mb-1">
            Display Label
          </label>
          <input
            type="text"
            value={node.label || ""}
            onChange={(e) => onUpdate({ ...node, label: e.target.value })}
            placeholder="e.g. Primary Ingress"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Capacity */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-blue-600" />
              <span>Throughput Limit</span>
            </label>
            <span className="text-[10px] text-blue-600 font-medium">
              {node.capacity ? `${node.capacity} req/s` : "Unlimited"}
            </span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="5"
              placeholder="Leave blank for unlimited"
              value={node.capacity ?? ""}
              onChange={(e) =>
                onUpdate({
                  ...node,
                  capacity: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full pl-3 pr-14 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute right-3 top-1.5 text-[10px] text-slate-400 pointer-events-none">
              req/s
            </span>
          </div>
        </div>

        {/* Failure Probability Slider */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-600 flex items-center space-x-1">
              <Activity className="w-3 h-3 text-rose-500" />
              <span>Outage Probability</span>
            </label>
            <span className="text-xs font-bold text-rose-600 font-mono">
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
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0% (Never Fails)</span>
            <span>10%</span>
            <span>20% (High Risk)</span>
          </div>
        </div>

        {/* Roles (Source / Sink) */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 block">
            Traffic Boundary
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSetSource(node.id)}
              disabled={isSource}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-center space-x-1.5 ${
                isSource
                  ? "bg-blue-50 text-blue-700 border-blue-300 font-semibold cursor-default"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <ArrowRightCircle
                className={`w-3.5 h-3.5 ${isSource ? "text-blue-600" : "text-slate-400"}`}
              />
              <span className="text-[11px]">{isSource ? "Is Source" : "Set as Source"}</span>
            </button>

            <button
              onClick={() => onSetSink(node.id)}
              disabled={isSink}
              className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-center space-x-1.5 ${
                isSink
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold cursor-default"
                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              <ArrowLeftCircle
                className={`w-3.5 h-3.5 ${isSink ? "text-emerald-600" : "text-slate-400"}`}
              />
              <span className="text-[11px]">{isSink ? "Is Sink" : "Set as Sink"}</span>
            </button>
          </div>
        </div>

        {/* Delete Action */}
        <div className="pt-2 border-t border-slate-200">
          <button
            onClick={() => onDelete(node.id)}
            disabled={isSource || isSink}
            className={`w-full py-2 px-3 rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center space-x-1.5 ${
              isSource || isSink
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isSource || isSink ? "Terminals Cannot Be Deleted" : "Remove Service"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
