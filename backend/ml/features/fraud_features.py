"""Fraud model feature extraction and explanation helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


FRAUD_FEATURE_NAMES = [
    "duplicate_signal",
    "movement_signal",
    "device_signal",
    "cluster_signal",
    "timing_signal",
    "income_inflation_signal",
    "pre_activity_signal",
    "trust_score",
    "account_age_norm",
    "income_ratio",
    "activity_count_norm",
    "recent_claims_norm",
    "cluster_claims_norm",
    "policy_age_hours_norm",
    "event_severity_norm",
    "event_confidence_norm",
]

FRAUD_HUMAN_LABELS = {
    "duplicate_signal": "duplicate claim pressure",
    "movement_signal": "movement anomaly",
    "device_signal": "device identity risk",
    "cluster_signal": "cluster fraud pressure",
    "timing_signal": "policy timing risk",
    "income_inflation_signal": "income inflation pressure",
    "pre_activity_signal": "weak pre-event activity",
    "trust_score": "worker trust score",
    "account_age_norm": "account age",
    "income_ratio": "reported income ratio",
    "activity_count_norm": "recent activity volume",
    "recent_claims_norm": "recent claim frequency",
    "cluster_claims_norm": "incident-window claim pressure",
    "policy_age_hours_norm": "policy age",
    "event_severity_norm": "event severity",
    "event_confidence_norm": "event confidence",
}


@dataclass
class FraudFeatureBundle:
    features: dict[str, float]
    vector: list[float]


class FraudFeatureBuilder:
    def __init__(self) -> None:
        self.feature_names = list(FRAUD_FEATURE_NAMES)

    def build(self, context: dict[str, Any]) -> FraudFeatureBundle:
        features = {
            "duplicate_signal": self._clamp(context.get("duplicate_signal", 0.0)),
            "movement_signal": self._clamp(context.get("movement_signal", 0.0)),
            "device_signal": self._clamp(context.get("device_signal", 0.0)),
            "cluster_signal": self._clamp(context.get("cluster_signal", 0.0)),
            "timing_signal": self._clamp(context.get("timing_signal", 0.0)),
            "income_inflation_signal": self._clamp(context.get("income_inflation_signal", 0.0)),
            "pre_activity_signal": self._clamp(context.get("pre_activity_signal", 0.0)),
            "trust_score": self._clamp(context.get("trust_score", 0.5)),
            "account_age_norm": self._clamp(self._normalize_days(context.get("account_age_days", 0), 180)),
            "income_ratio": self._clamp(context.get("income_ratio", 1.0), 0.0, 3.0) / 3.0,
            "activity_count_norm": self._clamp(self._normalize_count(context.get("activity_count", 0), 10)),
            "recent_claims_norm": self._clamp(self._normalize_count(context.get("recent_claims_count", 0), 8)),
            "cluster_claims_norm": self._clamp(self._normalize_count(context.get("cluster_claims_count", 0), 10)),
            "policy_age_hours_norm": self._clamp(self._normalize_hours(context.get("policy_age_hours", 0), 168)),
            "event_severity_norm": self._clamp(context.get("event_severity_norm", 0.5)),
            "event_confidence_norm": self._clamp(context.get("event_confidence_norm", 0.5)),
        }
        return FraudFeatureBundle(features=features, vector=[features[name] for name in self.feature_names])

    def explain(
        self,
        feature_values: dict[str, float],
        importances: dict[str, float] | None = None,
        top_n: int = 4,
    ) -> list[dict[str, Any]]:
        scored: list[tuple[str, float, float]] = []
        for name, value in feature_values.items():
            weight = abs(float(importances.get(name, 1.0))) if importances else 1.0
            scored.append((name, float(value), abs(float(value)) * weight))
        ranked = sorted(scored, key=lambda item: item[2], reverse=True)
        explanations: list[dict[str, Any]] = []
        for name, value, _ in ranked[:top_n]:
            label = FRAUD_HUMAN_LABELS.get(name, name.replace("_", " "))
            explanations.append(
                {
                    "factor": name,
                    "label": label,
                    "value": round(value, 3),
                    "text": self._text_for_factor(name, value),
                }
            )
        return explanations

    @staticmethod
    def _text_for_factor(name: str, value: float) -> str:
        if name == "trust_score":
            return f"Trust score is {value:.2f}, which {'supports' if value >= 0.6 else 'weakens'} auto-decision confidence."
        if name.endswith("_signal"):
            return f"{FRAUD_HUMAN_LABELS.get(name, name).capitalize()} is contributing at {value:.2f}."
        if name in {"recent_claims_norm", "cluster_claims_norm"}:
            return f"{FRAUD_HUMAN_LABELS.get(name, name).capitalize()} is elevated at {value:.2f}."
        if name in {"policy_age_hours_norm", "account_age_norm"}:
            return f"{FRAUD_HUMAN_LABELS.get(name, name).capitalize()} is currently {value:.2f}."
        return f"{FRAUD_HUMAN_LABELS.get(name, name).capitalize()} contributes {value:.2f}."

    @staticmethod
    def _normalize_days(value: Any, max_days: int) -> float:
        try:
            return max(0.0, min(float(value) / max_days, 1.0))
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def _normalize_hours(value: Any, max_hours: int) -> float:
        try:
            return max(0.0, min(float(value) / max_hours, 1.0))
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def _normalize_count(value: Any, max_count: int) -> float:
        try:
            return max(0.0, min(float(value) / max_count, 1.0))
        except (TypeError, ValueError):
            return 0.0

    @staticmethod
    def _clamp(value: Any, lo: float = 0.0, hi: float = 1.0) -> float:
        try:
            return max(lo, min(hi, float(value)))
        except (TypeError, ValueError):
            return 0.0


fraud_feature_builder = FraudFeatureBuilder()
