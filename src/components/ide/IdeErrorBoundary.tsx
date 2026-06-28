"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}
interface State {
  error: Error | null;
}

export default class IdeErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[IdeErrorBoundary] caught:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-red-400 p-8 text-center gap-4">
          <h2 className="text-xl font-bold">IDE Runtime Error</h2>
          <p className="text-sm font-mono bg-red-950/50 p-4 rounded-md border border-red-900/50 max-w-3xl whitespace-pre-wrap text-left">
            {this.state.error.message}
            {"\n\n"}
            {this.state.error.stack}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded bg-graphite-800 text-graphite-200 hover:bg-graphite-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
