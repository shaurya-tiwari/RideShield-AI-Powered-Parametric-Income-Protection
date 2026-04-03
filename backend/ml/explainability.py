"""Plain-English explanation helpers for ML and heuristic outputs."""

from __future__ import annotations


def summarize_risk(score: float, top_factors: list[dict]) -> str:
    if not top_factors:
        return f"Current disruption risk is {score:.2f}."
    joined = ", ".join(item["label"] for item in top_factors[:3])
    return f"Current disruption risk is {score:.2f}, driven mainly by {joined}."


def summarize_forecast(city: str, horizon_hours: int, top_factors: list[dict]) -> str:
    if not top_factors:
        return f"Forecast for {city} over the next {horizon_hours} hours is stable."
    joined = ", ".join(item["label"] for item in top_factors[:3])
    return f"Forecast for {city} over the next {horizon_hours} hours is shaped by {joined}."

