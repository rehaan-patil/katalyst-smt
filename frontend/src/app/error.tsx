"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col items-center justify-center p-6 font-mono">
      <div className="max-w-md w-full p-6 rounded-xl bg-panel border border-red-500/30 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Application Error Encountered</h2>
        <p className="text-xs text-gray-400 leading-relaxed">
          {error.message || "An unexpected error occurred during rendering."}
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded bg-cyberViolet hover:bg-cyberViolet-dark text-white font-semibold text-xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Workspace</span>
        </button>
      </div>
    </div>
  );
}
