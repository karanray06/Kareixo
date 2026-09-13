import { CheckCircle2, ShieldCheck, Clock, XCircle, LucideIcon } from "lucide-react";

type VerificationStatus = "confirmed" | "supported" | "unverifiable" | "rejected";

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; icon: LucideIcon; bgClass: string; textClass: string }
> = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    bgClass: "bg-diff-addition-line",
    textClass: "text-diff-addition-text",
  },
  supported: {
    label: "Strongly Supported",
    icon: ShieldCheck,
    bgClass: "bg-surface-container",
    textClass: "text-accent-blue",
  },
  unverifiable: {
    label: "Unverifiable",
    icon: Clock,
    bgClass: "bg-surface-container",
    textClass: "text-accent-amber",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
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
      <config.icon size={13} />
      {config.label}
    </span>
  );
}

export type { VerificationStatus };
