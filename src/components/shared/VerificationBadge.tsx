type VerificationStatus = "confirmed" | "supported" | "unverifiable" | "rejected";

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; icon: string; bgClass: string; textClass: string }
> = {
  confirmed: {
    label: "Confirmed",
    icon: "check_circle",
    bgClass: "bg-diff-addition-line",
    textClass: "text-diff-addition-text",
  },
  supported: {
    label: "Strongly Supported",
    icon: "verified",
    bgClass: "bg-surface-container",
    textClass: "text-accent-blue",
  },
  unverifiable: {
    label: "Unverifiable",
    icon: "schedule",
    bgClass: "bg-surface-container",
    textClass: "text-accent-amber",
  },
  rejected: {
    label: "Rejected",
    icon: "cancel",
    bgClass: "bg-diff-deletion-line",
    textClass: "text-diff-deletion-text",
  },
};

export default function VerificationBadge({
  status,
  className = "",
}: {
  status: VerificationStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-badge-mono text-badge-mono font-medium ${config.bgClass} ${config.textClass} ${className}`}
    >
      <span className="material-symbols-outlined text-[13px]">{config.icon}</span>
      {config.label}
    </span>
  );
}

export type { VerificationStatus };
