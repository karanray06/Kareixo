"use client";

interface ProviderBadgeProps {
  model: string;
  provider: string;
  latency?: string;
}

export default function ProviderBadge({
  model,
  provider,
  latency,
}: ProviderBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="badge badge-cyan">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400" />
        via {model} · {provider}
      </span>
      {latency && (
        <span className="text-graphite-500 text-[11px] font-mono">{latency}</span>
      )}
    </div>
  );
}
