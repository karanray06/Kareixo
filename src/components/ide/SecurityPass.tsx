"use client";

import { useState } from "react";
import { SecurityResult } from "@/lib/security-check";

interface SecurityPassProps {
  result: SecurityResult | null;
  isChecking: boolean;
}

export default function SecurityPass({ result, isChecking }: SecurityPassProps) {
  const [expanded, setExpanded] = useState(false);

  if (!result && !isChecking) return null;

  if (isChecking) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-md bg-cream-200 border border-cream-300 mt-2">
        <div className="w-4 h-4 border-2 border-dusk-400 border-t-rosegold-400 rounded-full animate-spin shrink-0" />
        <span className="text-sm font-medium text-dusk-700">
          Running security checks...
        </span>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="mt-2">
      <div 
        className={`flex items-center justify-between p-3 rounded-md border cursor-pointer select-none transition-colors ${
          result.passed
            ? "bg-rosegold-400/5 border-rosegold-400/20 hover:bg-rosegold-400/10"
            : "bg-red-400/10 border-red-400/30 hover:bg-red-400/20"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {result.passed ? (
            <div className="badge badge-amber glow-amber text-[10px] py-1 shadow-[0_0_15px_rgba(251,191,36,0.3)] border-rosegold-400/40 font-bold bg-rosegold-400/15">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              SECURITY PASSED
            </div>
          ) : (
            <div className="badge badge-red font-bold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              ISSUES FOUND ({result.issues.length})
            </div>
          )}
          
          <span className="text-sm font-medium text-dusk-700">
            {result.passed 
              ? "Code is safe to apply" 
              : "Review required before applying"}
          </span>
        </div>
        
        <svg 
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`text-dusk-500 transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {expanded && result.issues.length > 0 && (
        <div className="p-3 bg-cream-100 border border-t-0 border-cream-300 rounded-b-md -mt-1 space-y-2">
          {result.issues.map(issue => (
            <div key={issue.id} className="text-sm text-dusk-700 flex items-start gap-2">
              <span className="text-red-400 shrink-0 mt-0.5">•</span>
              <div>
                <span className="font-medium text-dusk-700">{issue.message}</span>
                {issue.line && (
                  <span className="ml-2 text-xs font-mono text-dusk-500">Line {issue.line}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {expanded && result.passed && (
        <div className="p-3 bg-cream-100 border border-t-0 border-cream-300 rounded-b-md -mt-1">
          <p className="text-sm text-dusk-500">
            No hardcoded secrets, unsafe eval patterns, or obvious injection vectors detected.
          </p>
        </div>
      )}
    </div>
  );
}
