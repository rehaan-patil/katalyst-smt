"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import {
  ShieldAlert,
  Database,
  Globe,
  Layers,
  Cpu,
  AlertTriangle,
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
        icon: <Globe className="w-3.5 h-3.5 text-blue-600" />,
        accent: "bg-blue-600",
        badge: "GATEWAY",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }
    if (isSink || tier.includes("db") || tier.includes("storage") || tier.includes("data")) {
      return {
        icon: <Database className="w-3.5 h-3.5 text-emerald-600" />,
        accent: "bg-emerald-600",
        badge: "DATABASE",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    }
    if (tier.includes("cache") || tier.includes("queue") || tier.includes("broker")) {
      return {
        icon: <Layers className="w-3.5 h-3.5 text-amber-600" />,
        accent: "bg-amber-500",
        badge: "CACHE",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      icon: <Cpu className="w-3.5 h-3.5 text-indigo-600" />,
      accent: "bg-indigo-600",
      badge: "SERVICE",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };
  };

  const config = getTierConfig();
  const capacity = nodeData.capacity ?? 50;
  const failureProb = nodeData.failure_prob ?? 0.01;

  return (
    <div
      className={`relative w-[200px] rounded-xl overflow-hidden bg-white select-none transition-all duration-200 ${
        isVulnerable
          ? "border-2 border-rose-500 shadow-md ring-2 ring-rose-400/20"
          : selected
          ? "border-2 border-blue-600 shadow-md ring-2 ring-blue-500/20"
          : "border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow"
      }`}
    >
      {/* Top Accent Strip */}
      <div className={`h-1 w-full ${isVulnerable ? "bg-rose-500" : config.accent}`} />

      {/* Target Connection Handle (Top) */}
      {!isSource && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-blue-600 !w-2.5 !h-2.5 !border-2 !border-white !-top-1.5 transition-transform hover:!scale-125 !shadow-sm"
        />
      )}

      {/* Card Content */}
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="p-1 rounded-md bg-slate-50 border border-slate-100 shrink-0">
              {config.icon}
            </div>
            <span className="font-semibold text-xs text-slate-900 truncate">
              {nodeData.label || nodeData.id}
            </span>
          </div>

          {/* Status Badge */}
          {isVulnerable ? (
            <span className="flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
              <ShieldAlert className="w-2.5 h-2.5" />
              <span>At Risk</span>
            </span>
          ) : (
            <span
              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border shrink-0 ${config.badgeClass}`}
            >
              {config.badge}
            </span>
          )}
        </div>

        {/* Node Identifier */}
        <div className="font-mono text-[10px] text-slate-400 mb-2 truncate">
          id: {nodeData.id}
        </div>

        {/* Specs Table */}
        <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-slate-500">
            <span>Capacity</span>
            <span className="font-medium text-slate-800">
              {nodeData.capacity ? `${nodeData.capacity} req/s` : "Unlimited"}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500">
            <span>Failure Risk</span>
            <span
              className={`font-medium ${
                failureProb > 0.015 ? "text-rose-600 font-semibold" : "text-emerald-600"
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
          className="!bg-blue-600 !w-2.5 !h-2.5 !border-2 !border-white !-bottom-1.5 transition-transform hover:!scale-125 !shadow-sm"
        />
      )}
    </div>
  );
}

export const CustomTopologyNode = memo(CustomTopologyNodeComponent);
