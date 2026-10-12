"use client";

import React, { useState, useEffect } from "react";
import { checkBackendHealth } from "@/lib/api";
import { Activity, ShieldCheck, Download, Upload, RefreshCw, Cpu } from "lucide-react";

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
  const [backendVersion, setBackendVersion] = useState<string>("");

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
    <header className="h-14 border-b border-white/10 bg-black/90 backdrop-blur px-4 flex items-center justify-between z-20 select-none">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyberViolet to-neonBlue flex items-center justify-center font-mono font-bold text-black text-sm tracking-tighter shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          K·S
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-semibold tracking-wider text-sm text-white">
              KATALYST<span className="text-cyberViolet">.SMT</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 font-mono">
              v1.0.0
            </span>
          </div>
          <p className="text-[10px] text-gray-500 font-mono hidden sm:block">
            Formally Verified Resilience & Proof-to-Repair Engine
          </p>
        </div>
      </div>

      {/* Center Metrics */}
      <div className="hidden md:flex items-center space-x-4 font-mono text-xs text-gray-400">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-panel border border-white/10">
          <Cpu className="w-3.5 h-3.5 text-cyberViolet" />
          <span>Nodes: <strong className="text-white">{nodeCount}</strong></span>
          <span className="text-gray-600">|</span>
          <span>Edges: <strong className="text-white">{edgeCount}</strong></span>
        </div>

        <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-panel border border-white/10">
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === "online"
                ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : backendStatus === "offline"
                ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                : "bg-yellow-500 animate-pulse"
            }`}
          />
          <span className="text-[11px]">
            API:{" "}
            <strong className={backendStatus === "online" ? "text-emerald-400" : "text-gray-400"}>
              {backendStatus.toUpperCase()}
            </strong>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onImportClick}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-mono text-gray-300 hover:text-white bg-panel hover:bg-white/5 border border-white/10 transition-colors"
          title="Import JSON Topology"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-mono text-gray-300 hover:text-white bg-panel hover:bg-white/5 border border-white/10 transition-colors"
          title="Export JSON Topology"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 rounded text-gray-400 hover:text-white bg-panel hover:bg-white/5 border border-white/10 transition-colors"
          title="Reset Topology"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
