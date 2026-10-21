"use client";

import React, { useState, useEffect } from "react";
import { checkBackendHealth } from "@/lib/api";
import {
  Download,
  Upload,
  RotateCcw,
  Network,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
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
    <header className="h-14 border-b border-slate-200 bg-white px-5 flex items-center justify-between z-30 select-none shadow-sm">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <ShieldCheck className="w-4 h-4" />
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm tracking-tight text-slate-900">
              Katalyst
            </span>
            <span className="text-xs text-slate-400 font-normal">/</span>
            <span className="text-xs font-medium text-slate-600">
              Resilience Studio
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              v{backendVersion}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Simulate outages, detect single points of failure, and auto-fix architectures
          </p>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div className="hidden md:flex items-center space-x-3 text-xs">
        {/* Topology Summary */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
          <Network className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-medium text-slate-800">
            {nodeCount} Services · {edgeCount} Connections
          </span>
        </div>

        {/* Verification Engine Status */}
        <div
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
            backendStatus === "online"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : backendStatus === "offline"
              ? "bg-rose-50 border-rose-200 text-rose-700"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === "online"
                ? "bg-emerald-500 animate-pulse"
                : backendStatus === "offline"
                ? "bg-rose-500"
                : "bg-slate-400"
            }`}
          />
          <span>
            {backendStatus === "online"
              ? "Verification Engine Ready"
              : backendStatus === "offline"
              ? "Engine Disconnected"
              : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onImportClick}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
          title="Import architecture JSON"
        >
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
          title="Export architecture JSON"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Export</span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
          title="Reset to default architecture"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
