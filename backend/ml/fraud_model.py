"""Runtime loader for the RideShield fraud model artifact."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


@dataclass
class FraudPrediction:
    fraud_probability: float
    fraud_score: float
    model_version: str
    confidence: float
    feature_importance: dict[str, float]


class FraudModel:
    def __init__(self) -> None:
        self.model = None
        self.metadata: dict[str, Any] = {}
        self.available = False
        self.last_error: str | None = None

    def load(self, artifact_dir: str) -> bool:
        model_path = Path(artifact_dir) / "fraud_model.joblib"
        metadata_path = Path(artifact_dir) / "fraud_model_metadata.json"
        if not model_path.exists() or not metadata_path.exists():
            self.available = False
            self.last_error = "fraud model artifact missing"
            return False

        try:
            self.model = joblib.load(model_path)
            self.metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
            self.available = True
            self.last_error = None
            return True
        except Exception as exc:  # pragma: no cover
            self.available = False
            self.last_error = str(exc)
            return False

    def predict(self, vector: list[float]) -> FraudPrediction:
        if not self.available or self.model is None:
            raise RuntimeError("fraud model unavailable")

        feature_names = self.metadata.get("feature_names")
        payload = pd.DataFrame([vector], columns=feature_names) if feature_names else [vector]

        if hasattr(self.model, "predict_proba"):
            probability = float(self.model.predict_proba(payload)[0][1])
        else:  # pragma: no cover
            raw = float(self.model.predict(payload)[0])
            probability = max(0.0, min(1.0, raw))

        confidence = float(self.metadata.get("metrics", {}).get("roc_auc", 0.7))
        importance = self.metadata.get("feature_importance", {})

        return FraudPrediction(
            fraud_probability=round(max(0.01, min(0.99, probability)), 3),
            fraud_score=round(max(0.01, min(0.99, probability)), 3),
            model_version=str(self.metadata.get("version", "fraud-model")),
            confidence=max(0.0, min(1.0, confidence)),
            feature_importance={str(k): float(v) for k, v in importance.items()},
        )
