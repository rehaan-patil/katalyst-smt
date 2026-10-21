"use client";

import React, { useState, useEffect } from "react";
import { checkBackendHealth } from "@/lib/api";
import {
  Download,
  Upload,
  RotateCcw,
  Network,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react";

interface AppHeaderProps {
  nodeCount: number;
  edgeCount: number;
  onExport: () => void;
  onImportClick: () => void;
  onReset: () => void;
}

export function AppHeader({
  nodeCount,
  edgeCount,
  onExport,
  onImportClick,
  onReset,
}: AppHeaderProps) {
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [backendVersion, setBackendVersion] = useState<string>("1.0.0");
  const [z3Version, setZ3Version] = useState<string>("5.3.1");

  useEffect(() => {
    let mounted = true;
    async function ping() {
      try {
        const res = await checkBackendHealth();
        if (mounted) {
          setBackendStatus("online");
          setBackendVersion(res.version);
        }
      } catch {
        if (mounted) {
          setBackendStatus("offline");
        }
      }
    }
    ping();
    const interval = setInterval(ping, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-14 border-b border-white/[0.08] bg-[#090D15]/90 backdrop-blur-xl px-5 flex items-center justify-between z-30 select-none">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3.5">
        <div className="relative group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-[1px] shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-[#0B0F17] rounded-[7px] flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0B0F17]" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-sans font-extrabold text-sm tracking-tight text-white">
              KATALYST<span className="text-indigo-400">.SMT</span>
            </span>
            <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
              v{backendVersion}
            </span>
            <span className="hidden lg:inline-flex text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-slate-800/60 border border-white/[0.06] text-slate-400">
              PROD-FABRIC
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 font-sans hidden sm:block leading-none mt-0.5">
            Formally Verified Resilience & Proof-to-Repair Engine
          </p>
        </div>
      </div>

      {/* Center Metrics & Engine Telemetry */}
      <div className="hidden md:flex items-center space-x-3 text-xs">
        {/* Topology Cardinality */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/[0.08] text-slate-300 shadow-sm">
          <Network className="w-3.5 h-3.5 text-indigo-400" />
          <div className="flex items-center space-x-1.5 font-mono text-[11px]">
            <span className="text-slate-400">Nodes:</span>
            <span className="text-white font-semibold">{nodeCount}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Edges:</span>
            <span className="text-white font-semibold">{edgeCount}</span>
          </div>
        </div>

        {/* Solver Engine Live Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/[0.08] shadow-sm">
          <span
            className={`w-2 h-2 rounded-full transition-all ${
              backendStatus === "online"
                ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"
                : backendStatus === "offline"
                ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                : "bg-amber-400 animate-ping"
            }`}
          />
          <div className="flex items-center space-x-1 font-mono text-[11px]">
            <span className="text-slate-400">Z3 SMT:</span>
            <span
              className={`font-semibold ${
                backendStatus === "online" ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {backendStatus === "online" ? "VERIFIED ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onImportClick}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-white/20 transition-all shadow-sm"
          title="Import Topology Definition (JSON)"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-white/20 transition-all shadow-sm"
          title="Export Topology Definition (JSON)"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-white/[0.08] hover:border-white/20 transition-all shadow-sm"
          title="Reset Canvas to Default Preset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}

