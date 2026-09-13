'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-canvas-default text-fg-default">
        <div className="text-center max-w-md px-6">
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-fg-muted text-sm mb-6">
            An unexpected error occurred. This has been the kind of thing usually caused by a
            temporary backend issue — try again in a moment.
          </p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-accent-purple text-white font-medium"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
