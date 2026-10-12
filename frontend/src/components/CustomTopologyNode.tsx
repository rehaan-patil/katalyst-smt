"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { ShieldAlert, ArrowDownRight, Server, Database, Globe } from "lucide-react";

export interface NodeData {
  id: string;
  label: string;
  tier?: string;
  capacity?: number;
  failure_prob?: number;
  isSource?: boolean;
  isSink?: boolean;
  isVulnerable?: boolean;
}

function CustomTopologyNodeComponent({ data, selected }: NodeProps) {
  const nodeData = data as unknown as NodeData;
  const isSource = nodeData.isSource;
  const isSink = nodeData.isSink;
  const isVulnerable = nodeData.isVulnerable;

  // Tier Icon
  const getIcon = () => {
    if (isSource) return <Globe className="w-3.5 h-3.5 text-emerald-400" />;
    if (isSink) return <Database className="w-3.5 h-3.5 text-cyan-400" />;
    return <Server className="w-3.5 h-3.5 text-gray-400" />;
  };

  return (
    <div
      className={`relative px-3 py-2.5 rounded-md min-w-[150px] transition-all duration-200 select-none ${
        isVulnerable
          ? "bg-red-950/40 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          : isSource
          ? "bg-emerald-950/30 border border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
          : isSink
          ? "bg-cyan-950/30 border border-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          : selected
          ? "bg-[#141414] border border-cyberViolet shadow-[0_0_10px_rgba(139,92,246,0.2)]"
          : "bg-[#0A0A0A] border border-white/10 hover:border-white/20"
      }`}
    >
      {/* Target Handle (Left/Top) */}
      {!isSource && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-cyberViolet !w-2 !h-2 !border !border-white"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1.5">
          {getIcon()}
          <span className="font-mono text-xs font-semibold text-white tracking-tight truncate max-w-[100px]">
            {nodeData.label || nodeData.id}
          </span>
        </div>

        {isVulnerable && (
          <span className="flex items-center space-x-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-500 text-white animate-pulse">
            <ShieldAlert className="w-2.5 h-2.5" />
            <span>CUT</span>
          </span>
        )}

        {isSource && (
          <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            SRC
          </span>
        )}

        {isSink && (
          <span className="text-[9px] font-mono px-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            SINK
          </span>
        )}
      </div>

      {/* Sub-label & Metadata */}
      <div className="font-mono text-[10px] text-gray-400 space-y-0.5">
        <div className="text-gray-500 truncate">{nodeData.id}</div>
        <div className="flex justify-between text-[9px] text-gray-500 pt-1 border-t border-white/5">
          <span>Cap: {nodeData.capacity ? `${nodeData.capacity}/s` : "∞"}</span>
          <span>Fail: {((nodeData.failure_prob ?? 0.01) * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Source Handle (Bottom) */}
      {!isSink && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-neonBlue !w-2 !h-2 !border !border-white"
        />
      )}
    </div>
  );
}

export const CustomTopologyNode = memo(CustomTopologyNodeComponent);
