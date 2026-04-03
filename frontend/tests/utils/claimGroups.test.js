import { describe, expect, it } from "vitest";
import { groupClaimsByIncident } from "../../src/utils/claimGroups";

describe("groupClaimsByIncident", () => {
  const baseClaim = (overrides = {}) => ({
    worker_id: "w1",
    worker_name: "Test Worker",
    zone: "south_delhi",
    trigger_type: "rain",
    created_at: "2026-04-02T10:00:00Z",
    status: "approved",
    fraud_score: 0.1,
    final_payout: 500,
    calculated_payout: 500,
    final_score: 0.8,
    ...overrides,
  });

  it("groups claims by worker, zone, and time bucket", () => {
    const claims = [
      baseClaim({ created_at: "2026-04-02T10:15:00Z" }),
      baseClaim({ created_at: "2026-04-02T10:30:00Z" }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups).toHaveLength(1);
    expect(groups[0].claim_count).toBe(2);
  });

  it("separates claims more than bucketMinutes apart", () => {
    const claims = [
      baseClaim({ created_at: "2026-04-02T10:00:00Z" }),
      baseClaim({ created_at: "2026-04-02T11:30:00Z" }),
    ];
    const groups = groupClaimsByIncident(claims, { bucketMinutes: 60 });
    expect(groups).toHaveLength(2);
  });

  it("does NOT split on status — same incident, different statuses are one group", () => {
    const claims = [
      baseClaim({ id: "c1", status: "approved", created_at: "2026-04-02T10:15:00Z" }),
      baseClaim({ id: "c2", status: "delayed", created_at: "2026-04-02T10:20:00Z" }),
      baseClaim({ id: "c3", status: "rejected", created_at: "2026-04-02T10:25:00Z" }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups).toHaveLength(1);
    expect(groups[0].claim_count).toBe(3);
  });

  it("derives group status as rejected when any claim is rejected", () => {
    const claims = [
      baseClaim({ id: "c1", status: "approved" }),
      baseClaim({ id: "c2", status: "rejected" }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups[0].status).toBe("rejected");
  });

  it("derives group status as delayed when no rejected but has delayed", () => {
    const claims = [
      baseClaim({ id: "c1", status: "approved" }),
      baseClaim({ id: "c2", status: "delayed" }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups[0].status).toBe("delayed");
  });

  it("derives group status as approved when all approved", () => {
    const claims = [
      baseClaim({ id: "c1", status: "approved" }),
      baseClaim({ id: "c2", status: "approved" }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups[0].status).toBe("approved");
  });

  it("accumulates payout totals across grouped claims", () => {
    const claims = [
      baseClaim({ id: "c1", final_payout: 200 }),
      baseClaim({ id: "c2", final_payout: 300 }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups[0].total_final_payout).toBe(500);
  });

  it("aggregates trigger types from all claims in the group", () => {
    const claims = [
      baseClaim({ id: "c1", trigger_type: "rain", decision_breakdown: { incident_triggers: ["rain"] } }),
      baseClaim({ id: "c2", trigger_type: "traffic", decision_breakdown: { incident_triggers: ["traffic"] } }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups[0].trigger_types).toContain("rain");
    expect(groups[0].trigger_types).toContain("traffic");
  });

  it("keeps max fraud score from the group", () => {
    const claims = [
      baseClaim({ id: "c1", fraud_score: 0.1 }),
      baseClaim({ id: "c2", fraud_score: 0.8 }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups[0].max_fraud_score).toBe(0.8);
  });

  it("sorts groups by created_at descending", () => {
    const claims = [
      baseClaim({ id: "c1", created_at: "2026-04-02T10:00:00Z" }),
      baseClaim({ id: "c2", created_at: "2026-04-02T12:00:00Z" }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(new Date(groups[0].created_at) > new Date(groups[1].created_at)).toBe(true);
  });

  it("keeps the strongest urgency context for the grouped incident", () => {
    const claims = [
      baseClaim({
        id: "c1",
        urgency_score: 0.42,
        urgency_band: "warning",
        priority_reason: "SLA breach risk",
        decision_confidence: 0.61,
        decision_confidence_band: "moderate",
        payout_risk: 48,
        primary_factor: "movement anomaly",
        secondary_factors: ["weak pre-event activity"],
      }),
      baseClaim({
        id: "c2",
        urgency_score: 0.81,
        urgency_band: "critical",
        priority_reason: "High payout exposure",
        decision_confidence: 0.74,
        decision_confidence_band: "moderate",
        payout_risk: 92,
        primary_factor: "worker trust score",
        secondary_factors: ["movement anomaly"],
      }),
    ];

    const groups = groupClaimsByIncident(claims);

    expect(groups[0].max_urgency_score).toBe(0.81);
    expect(groups[0].urgency_band).toBe("critical");
    expect(groups[0].priority_reason).toBe("High payout exposure");
    expect(groups[0].payout_risk).toBe(140);
    expect(groups[0].primary_factor).toBe("worker trust score");
  });

  it("sorts overdue and higher-urgency incidents first", () => {
    const claims = [
      baseClaim({
        id: "c1",
        worker_id: "w1",
        created_at: "2026-04-02T12:00:00Z",
        urgency_score: 0.4,
        urgency_band: "warning",
        hours_until_deadline: 8,
      }),
      baseClaim({
        id: "c2",
        worker_id: "w2",
        created_at: "2026-04-02T10:00:00Z",
        urgency_score: 0.78,
        urgency_band: "critical",
        is_overdue: true,
        hours_until_deadline: -2,
      }),
      baseClaim({
        id: "c3",
        worker_id: "w3",
        created_at: "2026-04-02T13:00:00Z",
        urgency_score: 0.72,
        urgency_band: "critical",
        hours_until_deadline: 2,
      }),
    ];

    const groups = groupClaimsByIncident(claims);

    expect(groups.map((group) => group.worker_id)).toEqual(["w2", "w3", "w1"]);
  });

  it("handles empty input", () => {
    expect(groupClaimsByIncident([])).toHaveLength(0);
  });

  it("handles null/undefined claims gracefully", () => {
    expect(groupClaimsByIncident(null)).toHaveLength(0);
    expect(groupClaimsByIncident(undefined)).toHaveLength(0);
  });

  it("separates different workers into different groups", () => {
    const claims = [
      baseClaim({ id: "c1", worker_id: "w1", worker_name: "Worker A" }),
      baseClaim({ id: "c2", worker_id: "w2", worker_name: "Worker B" }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups).toHaveLength(2);
  });

  it("separates different zones into different groups", () => {
    const claims = [
      baseClaim({ id: "c1", zone: "south_delhi" }),
      baseClaim({ id: "c2", zone: "east_delhi" }),
    ];
    const groups = groupClaimsByIncident(claims);
    expect(groups).toHaveLength(2);
  });
});
