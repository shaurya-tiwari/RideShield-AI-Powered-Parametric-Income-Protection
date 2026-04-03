"""Risk model feature extraction and explanation helpers."""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from backend.config import settings


RISK_FEATURE_NAMES = [
    "city_base_risk",
    "zone_profile_risk",
    "month_sin",
    "month_cos",
    "incidents_7d",
    "incidents_30d",
    "rain_intensity",
    "heat_index",
    "aqi_normalized",
    "traffic_congestion",
    "platform_instability",
    "worker_density",
    "payout_pressure_30d",
]

HUMAN_LABELS = {
    "city_base_risk": "city baseline risk",
    "zone_profile_risk": "zone risk profile",
    "month_sin": "seasonality",
    "month_cos": "seasonality",
    "incidents_7d": "recent incident pressure",
    "incidents_30d": "monthly incident pressure",
    "rain_intensity": "rain pressure",
    "heat_index": "heat pressure",
    "aqi_normalized": "air quality pressure",
    "traffic_congestion": "traffic congestion",
    "platform_instability": "platform instability",
    "worker_density": "worker density",
    "payout_pressure_30d": "recent payout pressure",
}


@dataclass
class RiskFeatureBundle:
    features: dict[str, float]
    vector: list[float]


class RiskFeatureBuilder:
    def __init__(self) -> None:
        self.feature_names = list(RISK_FEATURE_NAMES)

    def build(self, context: dict[str, Any]) -> RiskFeatureBundle:
        city = str(context.get("city") or "").lower().strip()
        month = int(context.get("month") or datetime.now(timezone.utc).month)
        month = max(1, min(12, month))

        base_risk = float(
            context.get("city_base_risk")
            if context.get("city_base_risk") is not None
            else settings.CITY_RISK_PROFILES.get(city, {}).get("base_risk", 0.50)
        )
        zone_profile_risk = self._clamp(context.get("zone_profile_risk", base_risk))
        features = {
            "city_base_risk": self._clamp(base_risk),
            "zone_profile_risk": zone_profile_risk,
            "month_sin": (math.sin(2 * math.pi * month / 12) + 1) / 2,
            "month_cos": (math.cos(2 * math.pi * month / 12) + 1) / 2,
            "incidents_7d": self._normalize_count(context.get("incidents_7d", 0), 15),
            "incidents_30d": self._normalize_count(context.get("incidents_30d", 0), 50),
            "rain_intensity": self._clamp(context.get("rain_intensity", 0.0)),
            "heat_index": self._clamp(context.get("heat_index", 0.0)),
            "aqi_normalized": self._clamp(context.get("aqi_normalized", 0.0)),
            "traffic_congestion": self._clamp(context.get("traffic_congestion", 0.0)),
            "platform_instability": self._clamp(context.get("platform_instability", 0.0)),
            "worker_density": self._clamp(context.get("worker_density", 0.2)),
            "payout_pressure_30d": self._clamp(context.get("payout_pressure_30d", 0.0)),
        }
        return RiskFeatureBundle(features=features, vector=[features[name] for name in self.feature_names])

    def explain(self, feature_values: dict[str, float], top_n: int = 3) -> list[dict[str, Any]]:
        ranked = sorted(feature_values.items(), key=lambda item: abs(item[1]), reverse=True)
        explanations: list[dict[str, Any]] = []
        for name, value in ranked[:top_n]:
            label = HUMAN_LABELS.get(name, name.replace("_", " "))
            explanations.append(
                {
                    "factor": name,
                    "label": label,
                    "value": round(float(value), 3),
                    "text": self._text_for_factor(name, float(value)),
                }
            )
        return explanations

    @staticmethod
    def _text_for_factor(name: str, value: float) -> str:
        if name in {"incidents_7d", "incidents_30d"}:
            return f"{HUMAN_LABELS.get(name, name)} is elevated at {value:.2f}."
        if name == "platform_instability":
            return f"Platform instability contributes {value:.2f} to disruption pressure."
        if name in {"rain_intensity", "heat_index", "aqi_normalized", "traffic_congestion"}:
            return f"{HUMAN_LABELS.get(name, name).capitalize()} is contributing at {value:.2f}."
        return f"{HUMAN_LABELS.get(name, name).capitalize()} is currently {value:.2f}."

    @staticmethod
    def _clamp(value: Any, lo: float = 0.0, hi: float = 1.0) -> float:
        try:
            return max(lo, min(hi, float(value)))
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def _normalize_count(value: Any, max_count: int) -> float:
        try:
            return max(0.0, min(float(value) / max_count, 1.0))
        except (TypeError, ValueError):
            return 0.0


risk_feature_builder = RiskFeatureBuilder()

