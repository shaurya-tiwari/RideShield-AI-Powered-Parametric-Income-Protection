/**
 * Explainability utilities for converting ML/risk data into plain-English explanations
 */

export const explainabilityUtils = {
  /**
   * Convert a risk score (0-1) to a human-readable level
   */
  riskLevel: (score) => {
    if (score < 0.25) return "low";
    if (score < 0.5) return "moderate";
    if (score < 0.75) return "elevated";
    return "high";
  },

  /**
   * Convert risk breakdown to a narrative explanation
   */
  explainRiskBreakdown: (breakdown) => {
    if (!breakdown) return "No risk data available.";

    // If backend already provided explanation, prefer that
    if (breakdown.explanation) {
      return breakdown.explanation;
    }

    // Fall back to client-side generation
    const parts = [];

    const riskLevel = breakdown.risk_level || explainabilityUtils.riskLevel(breakdown.final_risk_score || 0);
    const score = breakdown.final_risk_score || 0;

    // Risk level narrative
    const riskNarrative = {
      low: `Low disruption risk (${(score * 100).toFixed(0)}%). Your zone and conditions are favorable for consistent work.`,
      moderate: `Moderate disruption risk (${(score * 100).toFixed(0)}%). Some environmental or seasonal factors may affect your earnings.`,
      elevated: `Elevated disruption risk (${(score * 100).toFixed(0)}%). Recent incidents or patterns suggest increased disruption likelihood.`,
      high: `High disruption risk (${(score * 100).toFixed(0)}%). Consider adjusting working hours or zone selection if possible.`,
    };

    parts.push(riskNarrative[riskLevel] || riskNarrative.moderate);

    // City and zone context
    if (breakdown.city_base_risk !== undefined) {
      const base = breakdown.city_base_risk;
      if (base > 0.5) {
        parts.push(`Your city has inherent risk factors (${(base * 100).toFixed(0)}% baseline).`);
      }
    }

    // Seasonal context
    if (breakdown.seasonal_factor !== undefined && breakdown.seasonal_factor !== 1) {
      const seasonal = breakdown.seasonal_factor;
      if (seasonal > 1.1) {
        parts.push("Current season amplifies risk (monsoon or extreme weather periods).");
      } else if (seasonal < 0.9) {
        parts.push("Current season reduces risk (favorable weather conditions).");
      }
    }

    // Zone modifier
    if (breakdown.zone_modifier !== undefined && Math.abs(breakdown.zone_modifier) > 0.05) {
      const mod = breakdown.zone_modifier;
      if (mod > 0.05) {
        parts.push(`Your zone adds risk (${(mod * 100).toFixed(1)}% modifier).`);
      } else if (mod < -0.05) {
        parts.push(`Your zone reduces risk (${(mod * 100).toFixed(1)}% modifier).`);
      }
    }

    // Top factors if available
    if (breakdown.top_factors && breakdown.top_factors.length > 0) {
      const topFactor = breakdown.top_factors[0];
      const factorName = topFactor.factor || topFactor.name || "unknown";
      const contribution = (topFactor.contribution * 100).toFixed(1);
      parts.push(`Top factor: ${factorName} (${contribution}% impact).`);
    }

    // Model status
    if (breakdown.fallback_used) {
      parts.push("Currently using rule-based scoring (ML model not available).");
    } else if (breakdown.model_version) {
      parts.push(`Powered by ${breakdown.model_version} model.`);
    }

    return parts.join(" ");
  },

  /**
   * Convert a forecast disruption score to narrative
   */
  explainForecast: (forecast) => {
    if (!forecast) return "No forecast available.";

    const score = forecast.disruption_score || 0;
    const band = forecast.risk_band || "unknown";
    const triggers = forecast.likely_triggers || [];

    const bandNarrative = {
      low: `Low disruption likelihood (${(score * 100).toFixed(0)}%).`,
      guarded: `Guarded outlook (${(score * 100).toFixed(0)}%). Monitoring recommended.`,
      elevated: `Elevated disruption risk (${(score * 100).toFixed(0)}%). Be prepared.`,
      critical: `Critical disruption outlook (${(score * 100).toFixed(0)}%). High impact likely.`,
    };

    const narrative = bandNarrative[band] || bandNarrative.low;

    if (triggers.length > 0) {
      return `${narrative} Expected disruptions: ${triggers.slice(0, 2).join(", ")}.`;
    }

    return narrative;
  },

  /**
   * Convert a trust score to narrative
   */
  explainTrustScore: (score) => {
    if (score > 0.8) return "High trust. Claims processed quickly with minimal review.";
    if (score > 0.6) return "Good trust. Standard review applies.";
    if (score > 0.4) return "Developing trust. Additional verification may be needed.";
    return "Building trust. Claims under review to establish account patterns.";
  },
};

export default explainabilityUtils;
