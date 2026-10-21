"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  ShieldAlert,
  Server,
  Database,
  Globe,
  Layers,
  Cpu,
  Activity,
  Zap,
} from "lucide-react";

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
  const tier = (nodeData.tier || "").toLowerCase();

  // Tier Visual Configuration
  const getTierConfig = () => {
    if (isSource || tier.includes("ingress") || tier.includes("gateway")) {
      return {
        icon: <Globe className="w-3.5 h-3.5 text-emerald-400" />,
        accent: "from-emerald-500/20 to-teal-500/5",
        bar: "bg-emerald-400",
        badge: "INGRESS",
        badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      };
    }
    if (isSink || tier.includes("db") || tier.includes("storage") || tier.includes("data")) {
      return {
        icon: <Database className="w-3.5 h-3.5 text-cyan-400" />,
        accent: "from-cyan-500/20 to-blue-500/5",
        bar: "bg-cyan-400",
        badge: "PERSISTENCE",
        badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      };
    }
    if (tier.includes("cache") || tier.includes("queue") || tier.includes("broker")) {
      return {
        icon: <Layers className="w-3.5 h-3.5 text-amber-400" />,
        accent: "from-amber-500/20 to-orange-500/5",
        bar: "bg-amber-400",
        badge: "QUEUE / CACHE",
        badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      };
    }
    return {
      icon: <Cpu className="w-3.5 h-3.5 text-indigo-400" />,
      accent: "from-indigo-500/20 to-violet-500/5",
      bar: "bg-indigo-400",
      badge: "SERVICE",
      badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    };
  };

  const config = getTierConfig();
  const capacity = nodeData.capacity ?? 50;
  const failureProb = nodeData.failure_prob ?? 0.01;

  return (
    <div
      className={`relative w-[190px] rounded-xl overflow-hidden backdrop-blur-md transition-all duration-300 select-none shadow-lg ${
        isVulnerable
          ? "bg-rose-950/40 border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.35)] ring-1 ring-rose-500/50"
          : selected
          ? "bg-slate-900/90 border-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500/40"
          : "bg-[#0E131F]/90 border border-white/[0.09] hover:border-white/20 hover:shadow-xl hover:-translate-y-0.5"
      }`}
    >
      {/* Top Accent Gradient Bar */}
      <div className={`h-1 w-full ${isVulnerable ? "bg-rose-500 animate-pulse" : config.bar}`} />

      {/* Target Connection Handle (Top) */}
      {!isSource && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-indigo-500 !w-2.5 !h-2.5 !border-2 !border-[#07090E] !-top-1.5 transition-transform hover:!scale-150"
        />
      )}

      {/* Card Body */}
      <div className="p-3">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="p-1 rounded-md bg-white/[0.04] border border-white/[0.06] shrink-0">
              {config.icon}
            </div>
            <span className="font-sans font-semibold text-xs text-white tracking-tight truncate">
              {nodeData.label || nodeData.id}
            </span>
          </div>

          {/* Status Badge */}
          {isVulnerable ? (
            <span className="flex items-center space-x-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white shadow-sm shrink-0 animate-pulse">
              <ShieldAlert className="w-2.5 h-2.5" />
              <span>SPOF</span>
            </span>
          ) : (
            <span
              className={`text-[8.5px] font-mono font-medium px-1.5 py-0.5 rounded border shrink-0 ${config.badgeClass}`}
            >
              {config.badge}
            </span>
          )}
        </div>

        {/* Node Identifier */}
        <div className="font-mono text-[10px] text-slate-400 mb-2 truncate px-0.5">
          {nodeData.id}
        </div>

        {/* Metrics Grid */}
        <div className="pt-2 border-t border-white/[0.06] space-y-1.5 font-mono text-[10px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] text-slate-500 uppercase">Throughput</span>
            <span className="text-slate-200 font-medium">
              {nodeData.capacity ? `${nodeData.capacity} req/s` : "Unbounded"}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[9px] text-slate-500 uppercase">Fail Prior P(f)</span>
            <span
              className={`text-[9.5px] font-medium px-1 rounded ${
                failureProb > 0.015
                  ? "text-rose-400 bg-rose-500/10"
                  : "text-emerald-400 bg-emerald-500/10"
              }`}
            >
              {(failureProb * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Source Connection Handle (Bottom) */}
      {!isSink && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-cyan-400 !w-2.5 !h-2.5 !border-2 !border-[#07090E] !-bottom-1.5 transition-transform hover:!scale-150"
        />
      )}
    </div>
  );
}

export const CustomTopologyNode = memo(CustomTopologyNodeComponent);

