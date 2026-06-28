"use client";

interface ApplyStepProps {
  onApply: () => void;
  onReject: () => void;
  isApplying: boolean;
  canApply: boolean;
  providerBadge?: React.ReactNode;
}

export default function ApplyStep({
  onApply,
  onReject,
  isApplying,
  canApply,
  providerBadge
}: ApplyStepProps) {
  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-cream-300/50">
      <div>
        {providerBadge}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onReject}
          disabled={isApplying || !canApply}
          className="btn btn-ghost text-sm px-4 py-1.5 disabled:opacity-50"
        >
          Reject
        </button>
        <button
          onClick={onApply}
          disabled={isApplying || !canApply}
          className="btn btn-primary text-sm px-5 py-1.5 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
        >
          {isApplying ? "Applying..." : "Apply Changes"}
        </button>
      </div>
    </div>
  );
}
