"""
Risk Scoring Engine
Calculates risk_score for each worker based on city, zone, season, and conditions.
Phase 1: Rule-based scoring
Phase 3: ML model replaces this
"""

from datetime import datetime, timezone

from backend.config import settings
from backend.core.risk_model_service import risk_model_service
from backend.ml.explainability import summarize_risk


class RiskScorer:
    """
    Calculates risk_score in [0, 1] for a worker.

    Calibration anchors:
        0.10 = Bengaluru, dry week, no disruption forecast
        0.40 = Delhi, normal winter week
        0.60 = Delhi, active monsoon week
        0.85 = Mumbai, peak flood season + festival week
        1.00 = theoretical maximum
    """

    SEASONAL_FACTORS = {
        1: 0.7,
        2: 0.6,
        3: 0.65,
        4: 0.8,
        5: 0.85,
        6: 0.9,
        7: 1.0,
        8: 0.95,
        9: 0.85,
        10: 0.7,
        11: 0.75,
        12: 0.8,
    }

    CITY_SEASONAL_OVERRIDES = {
        "delhi": {4: 0.9, 5: 0.95, 6: 0.85, 7: 0.95, 11: 0.9, 12: 0.85},
        "mumbai": {6: 0.95, 7: 1.0, 8: 0.95},
        "chennai": {10: 0.85, 11: 0.95, 12: 0.9},
    }

    ZONE_MODIFIERS = {
        "south_delhi": 0.05,
        "north_delhi": 0.0,
        "east_delhi": 0.03,
        "west_delhi": 0.0,
        "central_delhi": -0.05,
        "south_mumbai": 0.05,
        "western_suburbs": 0.0,
        "eastern_suburbs": 0.03,
        "navi_mumbai": -0.03,
        "koramangala": 0.0,
        "whitefield": 0.05,
        "indiranagar": 0.0,
        "jayanagar": -0.03,
        "electronic_city": 0.05,
        "t_nagar": 0.0,
        "anna_nagar": -0.03,
        "adyar": 0.05,
        "velachery": 0.08,
    }

    def _rule_based_risk_score(
        self,
        city: str,
        zone: str = None,
        reference_date: datetime = None,
        city_base_override: float | None = None,
    ) -> dict:
        """
        Calculate risk score for a worker.

        Returns:
            dict with risk_score and breakdown
        """
        if reference_date is None:
            reference_date = datetime.now(timezone.utc)

        city = city.lower().strip()
        month = reference_date.month

        city_profile = settings.CITY_RISK_PROFILES.get(city, {})
        city_base = city_base_override if city_base_override is not None else city_profile.get("base_risk", 0.50)

        city_overrides = self.CITY_SEASONAL_OVERRIDES.get(city, {})
        if month in city_overrides:
            seasonal = city_overrides[month]
        else:
            seasonal = self.SEASONAL_FACTORS.get(month, 0.7)

        zone_mod = 0.0
        if zone:
            zone = zone.lower().strip()
            zone_mod = self.ZONE_MODIFIERS.get(zone, 0.0)

        raw_score = (city_base * seasonal) + zone_mod
        final_score = round(max(0.05, min(0.95, raw_score)), 3)

        if final_score < 0.30:
            risk_level = "low"
            explanation = "Low disruption risk. Favorable conditions expected."
        elif final_score < 0.55:
            risk_level = "moderate"
            explanation = "Moderate disruption risk. Some weather or traffic events possible."
        elif final_score < 0.75:
            risk_level = "high"
            explanation = "High disruption risk. Significant weather, pollution, or traffic events likely."
        else:
            risk_level = "very_high"
            explanation = "Very high disruption risk. Multiple severe disruption triggers expected."

        return {
            "risk_score": final_score,
            "breakdown": {
                "city_base_risk": city_base,
                "seasonal_factor": seasonal,
                "zone_modifier": zone_mod,
                "final_risk_score": final_score,
                "risk_level": risk_level,
                "explanation": explanation,
            },
        }

    def calculate_risk_score(
        self,
        city: str,
        zone: str = None,
        reference_date: datetime = None,
        city_base_override: float | None = None,
    ) -> dict:
        reference_date = reference_date or datetime.now(timezone.utc)
        rule_result = self._rule_based_risk_score(
            city=city,
            zone=zone,
            reference_date=reference_date,
            city_base_override=city_base_override,
        )
        month = reference_date.month
        base_risk = city_base_override if city_base_override is not None else rule_result["breakdown"]["city_base_risk"]
        zone_mod = rule_result["breakdown"]["zone_modifier"]
        ml_result = risk_model_service.score(
            {
                "city": city,
                "month": month,
                "city_base_risk": base_risk,
                "zone_profile_risk": max(0.02, min(0.98, base_risk + zone_mod)),
            }
        )
        if ml_result["fallback_used"]:
            merged_score = rule_result["risk_score"]
            explanation = [{"factor": "fallback", "label": "rule-based baseline", "value": merged_score, "text": "ML artifact unavailable, so the rule baseline is active."}]
            model_version = "rule-based"
        else:
            merged_score = ml_result["risk_score"]
            explanation = ml_result["explanation"]
            model_version = ml_result["model_version"]

        rule_result["risk_score"] = merged_score
        rule_result["breakdown"].update(
            {
                "model_version": model_version,
                "fallback_used": ml_result["fallback_used"],
                "top_factors": explanation,
                "summary": summarize_risk(merged_score, explanation),
            }
        )
        return rule_result


risk_scorer = RiskScorer()
