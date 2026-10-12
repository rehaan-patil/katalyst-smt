"use client";

import React from "react";
import { TopologyNode } from "@/lib/types";
import { X, Trash2, ArrowRightCircle, ArrowLeftCircle } from "lucide-react";

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

  return (
    <div className="absolute top-4 right-4 w-72 rounded-lg bg-panel/95 backdrop-blur border border-white/10 shadow-2xl p-4 z-30 font-mono text-xs text-gray-300">
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
        <div className="flex items-center space-x-1.5">
          <span className="font-semibold text-white">Node Inspector</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
            Node ID
          </label>
          <div className="px-2.5 py-1.5 rounded bg-black border border-white/10 text-white select-all">
            {node.id}
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
            Label
          </label>
          <input
            type="text"
            value={node.label || ""}
            onChange={(e) => onUpdate({ ...node, label: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded bg-black border border-white/10 text-white focus:outline-none focus:border-cyberViolet"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
            Flow Capacity (req/s)
          </label>
          <input
            type="number"
            min="0"
            step="1"
            placeholder="Unlimited (none)"
            value={node.capacity ?? ""}
            onChange={(e) =>
              onUpdate({
                ...node,
                capacity: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
            className="w-full px-2.5 py-1.5 rounded bg-black border border-white/10 text-white focus:outline-none focus:border-cyberViolet"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wider block mb-1">
            Failure Probability (p)
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.005"
            value={node.failure_prob ?? 0.01}
            onChange={(e) =>
              onUpdate({
                ...node,
                failure_prob: parseFloat(e.target.value) || 0.0,
              })
            }
            className="w-full px-2.5 py-1.5 rounded bg-black border border-white/10 text-white focus:outline-none focus:border-cyberViolet"
          />
        </div>

        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex space-x-2">
            <button
              onClick={() => onSetSource(node.id)}
              disabled={isSource}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium border transition-colors flex items-center justify-center space-x-1 ${
                isSource
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 cursor-default"
                  : "bg-black hover:bg-white/5 border-white/10 text-gray-300"
              }`}
            >
              <ArrowRightCircle className="w-3 h-3 mr-1" />
              <span>{isSource ? "Is Source" : "Set Source"}</span>
            </button>

            <button
              onClick={() => onSetSink(node.id)}
              disabled={isSink}
              className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium border transition-colors flex items-center justify-center space-x-1 ${
                isSink
                  ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 cursor-default"
                  : "bg-black hover:bg-white/5 border-white/10 text-gray-300"
              }`}
            >
              <ArrowLeftCircle className="w-3 h-3 mr-1" />
              <span>{isSink ? "Is Sink" : "Set Sink"}</span>
            </button>
          </div>

          <button
            onClick={() => onDelete(node.id)}
            className="w-full py-1.5 px-2 rounded text-[11px] font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center justify-center space-x-1"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            <span>Delete Node</span>
          </button>
        </div>
      </div>
    </div>
  );
}
