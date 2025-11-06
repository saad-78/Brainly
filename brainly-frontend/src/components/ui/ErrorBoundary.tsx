//@ts-ignore
import { ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
}

export function ErrorBoundary({ children, onRetry }: ErrorBoundaryProps) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
      <div className="text-red-400 text-3xl mb-3">⚠️</div>
      <p className="text-red-300 font-semibold mb-2">Failed to load content</p>
      <p className="text-red-300/70 text-sm mb-6">
        Something went wrong. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all font-semibold"
      >
        🔄 Retry
      </button>
    </div>
  );
}
