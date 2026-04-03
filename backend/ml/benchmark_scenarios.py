"""Fixed benchmark scenarios for comparing rule and ML-backed outputs."""

BENCHMARK_SCENARIOS = {
    "safe_worker": {
        "city": "bengaluru",
        "zone": "koramangala",
        "month": 2,
        "expected_band": "low",
    },
    "medium_risk_worker": {
        "city": "delhi",
        "zone": "south_delhi",
        "month": 10,
        "expected_band": "moderate",
    },
    "high_risk_monsoon_worker": {
        "city": "mumbai",
        "zone": "western_suburbs",
        "month": 7,
        "expected_band": "very_high",
    },
    "compound_disruption_zone": {
        "city": "chennai",
        "zone": "velachery",
        "month": 11,
        "expected_band": "high",
    },
}

