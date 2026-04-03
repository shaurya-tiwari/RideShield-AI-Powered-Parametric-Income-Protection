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

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="rounded-[22px] border border-error/30 bg-error/10 p-3 text-sm text-error">
        {error}
      </div>
    );
  }

  if (!modelData) {
    return null;
  }

  const status = modelData.status || "unknown";
  const statusStyle =
    status === "active"
      ? { background: "rgba(0,53,48,0.4)", color: "#69f8e9" }
      : { background: "rgba(71,35,190,0.25)", color: "#cabeff" };
  const statusDot = status === "active" ? "bg-emerald-500" : "bg-amber-500";

  const trainedDate = modelData.trained_at ? new Date(modelData.trained_at).toLocaleDateString() : "Unknown";
  const r2Score = modelData.r2_score ? parseFloat(modelData.r2_score).toFixed(3) : "--";

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
        <span className="pill text-[10px]" style={statusStyle}>
          <span className={`mr-1 inline-block h-2 w-2 rounded-full ${statusDot}`} />
          {status === "active" ? "Live" : "Fallback"}
        </span>
      </div>
    </div>
  );
}
