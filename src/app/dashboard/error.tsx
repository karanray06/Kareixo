'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <h2 className="text-lg font-semibold mb-2">Dashboard couldn&apos;t load</h2>
        <p className="text-fg-muted text-sm mb-6">
          {error.message.includes("DATABASE_URL")
            ? "The database connection isn't configured correctly."
            : "Something went wrong loading your dashboard."}
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
