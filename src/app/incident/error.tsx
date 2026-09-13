'use client';

export default function IncidentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h2 className="text-lg font-semibold mb-2">Incident Tracer couldn&apos;t load</h2>
        <p className="text-fg-muted text-sm mb-6">
          Something went wrong loading the Incident Tracer. This is usually a temporary issue.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-lg bg-accent-purple text-white font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
