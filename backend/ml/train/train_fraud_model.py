"""Train the RideShield fraud model artifact using synthetic scenario data."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

from backend.ml.features.fraud_features import FRAUD_FEATURE_NAMES, fraud_feature_builder


def generate_fraud_dataset(n_samples: int = 5000) -> pd.DataFrame:
    import numpy as np

    np.random.seed(42)
    rows: list[dict[str, float | int]] = []

    for _ in range(n_samples):
        duplicate_signal = np.random.beta(1.1, 8.0)
        movement_signal = np.random.beta(2.2, 3.6)
        device_signal = np.random.beta(1.8, 4.8)
        cluster_signal = np.random.beta(2.0, 3.4)
        timing_signal = np.random.beta(1.7, 4.5)
        income_inflation_signal = np.random.beta(1.9, 4.0)
        pre_activity_signal = np.random.beta(2.1, 3.7)
        trust_score = np.random.beta(4.5, 2.8)
        account_age_days = int(np.random.gamma(shape=4.0, scale=28.0))
        recent_claims = int(np.random.poisson(1.8))
        cluster_claims = int(np.random.poisson(2.1))
        activity_count = int(np.random.randint(0, 10))
        policy_age_hours = int(np.random.gamma(shape=3.0, scale=18.0))
        income_ratio = float(np.random.uniform(0.8, 2.6))
        event_severity = float(np.random.uniform(0.35, 0.95))
        event_confidence = float(np.random.uniform(0.45, 0.98))

        latent_score = (
            0.14 * duplicate_signal
            + 0.13 * movement_signal
            + 0.10 * device_signal
            + 0.12 * cluster_signal
            + 0.12 * timing_signal
            + 0.11 * income_inflation_signal
            + 0.10 * pre_activity_signal
            + 0.08 * min(income_ratio / 2.5, 1.0)
            + 0.07 * min(cluster_claims / 7.0, 1.0)
            + 0.05 * (1.0 - min(account_age_days / 180.0, 1.0))
            - 0.10 * trust_score
            - 0.05 * min(activity_count / 8.0, 1.0)
            - 0.03 * event_confidence
        )
        latent_score += float(np.random.normal(0.0, 0.09))
        fraud_probability = 1.0 / (1.0 + np.exp(-((latent_score - 0.33) * 5.2)))
        is_fraud = int(np.random.random() < fraud_probability)

        # Add light class-conditioned drift after label sampling so classes overlap but remain learnable.
        if is_fraud:
            duplicate_signal = min(1.0, duplicate_signal + np.random.uniform(0.0, 0.22))
            movement_signal = min(1.0, movement_signal + np.random.uniform(0.02, 0.18))
            timing_signal = min(1.0, timing_signal + np.random.uniform(0.02, 0.18))
            pre_activity_signal = min(1.0, pre_activity_signal + np.random.uniform(0.01, 0.16))
            trust_score = max(0.0, trust_score - np.random.uniform(0.0, 0.18))
        else:
            trust_score = min(1.0, trust_score + np.random.uniform(0.0, 0.08))
            event_confidence = min(1.0, event_confidence + np.random.uniform(0.0, 0.05))

        context = {
            "duplicate_signal": duplicate_signal,
            "movement_signal": movement_signal,
            "device_signal": device_signal,
            "cluster_signal": cluster_signal,
            "timing_signal": timing_signal,
            "income_inflation_signal": income_inflation_signal,
            "pre_activity_signal": pre_activity_signal,
            "trust_score": trust_score,
            "account_age_days": account_age_days,
            "income_ratio": income_ratio,
            "activity_count": activity_count,
            "recent_claims_count": recent_claims,
            "cluster_claims_count": cluster_claims,
            "policy_age_hours": policy_age_hours,
            "event_severity_norm": event_severity,
            "event_confidence_norm": event_confidence,
        }
        bundle = fraud_feature_builder.build(context)
        rows.append({**bundle.features, "is_fraud": int(is_fraud)})

    return pd.DataFrame(rows)


def train_fraud_model(output_dir: str = "backend/ml/artifacts") -> dict:
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    df = generate_fraud_dataset()
    X = df[FRAUD_FEATURE_NAMES]
    y = df["is_fraud"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    model = RandomForestClassifier(
        n_estimators=180,
        max_depth=6,
        min_samples_leaf=6,
        random_state=42,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    probabilities = model.predict_proba(X_test)[:, 1]
    predictions = (probabilities >= 0.5).astype(int)

    importance = {
        name: round(float(value), 4)
        for name, value in sorted(
            zip(FRAUD_FEATURE_NAMES, model.feature_importances_, strict=False),
            key=lambda item: item[1],
            reverse=True,
        )
    }

    metadata = {
        "version": "fraud-model-v1",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "model_type": "RandomForestClassifier",
        "metrics": {
            "roc_auc": round(float(roc_auc_score(y_test, probabilities)), 4),
            "average_precision": round(float(average_precision_score(y_test, probabilities)), 4),
            "precision": round(float(precision_score(y_test, predictions, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, predictions, zero_division=0)), 4),
        },
        "feature_names": list(FRAUD_FEATURE_NAMES),
        "feature_importance": importance,
        "n_samples": int(len(df)),
        "positive_rate": round(float(df["is_fraud"].mean()), 4),
        "train_test_split": "80/20",
        "training_source": "synthetic_scenario_generator",
    }

    joblib.dump(model, out_dir / "fraud_model.joblib")
    (out_dir / "fraud_model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metadata


if __name__ == "__main__":  # pragma: no cover
    print(train_fraud_model())
