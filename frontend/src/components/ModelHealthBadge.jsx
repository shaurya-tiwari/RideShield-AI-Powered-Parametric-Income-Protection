import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { analyticsApi } from "../api/analytics";

export default function ModelHealthBadge() {
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.models();
        setModelData(res.data?.models?.risk_model);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load model health");
        console.error("Model health load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  if (loading || !modelData) {
    return null;
  }

  const status = modelData.status || "unknown";
  const statusColor = status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
  const statusDot = status === "active" ? "bg-emerald-500" : "bg-amber-500";

  const trainedDate = modelData.trained_at ? new Date(modelData.trained_at).toLocaleDateString() : "Unknown";
  const r2Score = modelData.r2_score ? parseFloat(modelData.r2_score).toFixed(3) : "—";

  return (
    <div className="rounded-[22px] border border-surface-variant bg-surface-container p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-on-surface-variant" />
          <div className="text-xs">
            <div className="font-semibold text-on-surface">{modelData.version || "risk-model"}</div>
            <div className="text-on-surface-variant">
              {trainedDate} - R2 {r2Score}
            </div>
          </div>
        </div>
        <span className={`pill ${statusColor} text-[10px]`}>
          <span className={`mr-1 inline-block h-2 w-2 rounded-full ${statusDot}`} />
          {status === "active" ? "Live" : "Fallback"}
        </span>
      </div>
    </div>
  );
}
