import { AlertCircle, RefreshCcw } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="panel p-6">
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100">
          <AlertCircle size={20} className="text-rose-600" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-on-surface">Something went wrong</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {message || "Failed to load data. This may be a temporary issue."}
          </p>
          {onRetry ? (
            <button
              type="button"
              className="button-secondary mt-3 !rounded-full !py-1.5"
              onClick={onRetry}
            >
              <RefreshCcw size={14} />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
