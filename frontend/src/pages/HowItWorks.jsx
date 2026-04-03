import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, CalendarDays, Clock3, MapPin, Radar, ShieldCheck, Wallet, Zap } from "lucide-react";

import SectionHeader from "../components/SectionHeader";

const workerFlow = [
  {
    step: "Step 1",
    title: "Input",
    body: "Worker registers, selects a city and zone, and buys weekly cover linked to the right disruption classes.",
  },
  {
    step: "Step 2",
    title: "Processing",
    body: "RideShield monitors weather, AQI, traffic, platform, and civic signals in that worker's operating zone.",
  },
  {
    step: "Step 3",
    title: "Incident creation",
    body: "Threshold crossings are merged into one incident so the worker sees a coherent story instead of stacked duplicate events.",
  },
  {
    step: "Step 4",
    title: "Decision",
    body: "Coverage, confidence, trust, and fraud pressure determine whether the claim is approved, delayed, or rejected.",
  },
  {
    step: "Step 5",
    title: "Settlement",
    body: "Approved claims turn into payout records immediately in simulation mode, with the reasoning still visible in the UI.",
  },
];

const policyEngine = [
  { title: "Weekly cover", detail: "Policies are bought weekly, with coverage caps and trigger coverage tied to the selected plan." },
  { title: "Trigger-aware cover", detail: "Each plan defines which disruption classes are covered: rain, heat, AQI, traffic, platform outage, and social disruption." },
  { title: "Waiting period", detail: "A short activation delay is used so workers cannot buy coverage only after a disruption is already visible." },
  { title: "Zone-aware logic", detail: "Coverage and triggering are tied to city and zone records, not just a generic global rule." },
];

const engineSections = [
  {
    title: "Trigger engine",
    text: "Mocked external feeds supply weather, AQI, traffic, platform, and civic signals. The trigger engine applies real thresholds and zone-aware profiles to decide when an incident exists.",
  },
  {
    title: "Claim processor",
    text: "Claims are not filed by workers. RideShield identifies active covered workers in the affected zone and creates one claim per worker per incident window.",
  },
  {
    title: "Decision engine",
    text: "Disruption strength, event confidence, fraud score, and trust score are combined into an explainable approval, delay, or rejection path.",
  },
  {
    title: "Payout executor",
    text: "Approved claims are turned into payout records immediately in simulation mode so the worker and admin surfaces show the outcome end to end.",
  },
];

export default function HowItWorks() {
  useEffect(() => {
    document.title = "How RideShield Works";
  }, []);

  return (
    <div className="space-y-12">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="hero-glow hero-mesh rounded-[36px] p-8 sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">How RideShield works</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
            A policy engine, trigger engine, and payout engine stitched into one clear product.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            This page should feel like a journey through the system, not a stack of documentation boxes. Inputs become
            incidents, incidents become decisions, and decisions become payouts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/onboarding" className="button-secondary !bg-white !text-primary">
              Explore onboarding
              <ArrowRight size={18} />
            </Link>
            <Link to="/auth" className="rounded-[20px] bg-white/10 px-5 py-3 font-semibold text-white transition hover:bg-white/15">
              Sign in
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="context-panel p-6">
            <p className="eyebrow">Core promise</p>
            <p className="mt-3 text-2xl font-bold leading-tight text-primary">
              Workers should understand why money arrived, not wonder whether a form was lost.
            </p>
          </div>
          <div className="context-panel p-6">
            <p className="text-sm text-on-surface-variant">What makes it different</p>
            <p className="mt-2 text-lg font-semibold text-primary">
              Zero manual filing, incident-first logic, fraud-aware decisions, and visible worker/admin reasoning.
            </p>
          </div>
        </div>
      </section>

      <section className="hero-glow hero-mesh rounded-[32px] p-8 sm:p-10 text-white">
        <SectionHeader
          eyebrow="Worker flow"
          title="From coverage purchase to payout"
          description="This is the actual sequence RideShield is built around. Each step should feel like something is happening."
          invert
        />
        <div className="grid gap-4 md:grid-cols-5">
          {workerFlow.map((item) => (
            <div key={item.step} className="rounded-[24px] bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">{item.step}</p>
              <h3 className="mt-3 text-xl font-bold">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/78">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Policy engine"
          title="What the policy layer is actually doing"
          description="Coverage logic should be visible here instead of staying implicit inside onboarding."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {policyEngine.map((item, index) => {
            const Icon = [CalendarDays, Zap, Clock3, MapPin][index];
            return (
              <div key={item.title} className="context-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-surface-container-low text-primary">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-primary">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="System layers"
          title="How the backend becomes a trusted product"
          description="The external inputs are simulated for demo use, but the core engine is real and the decisions are exposed in the UI."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {engineSections.map(({ title, text }, index) => {
            const Icon = [Radar, Activity, ShieldCheck, Wallet][index];
            return (
              <div key={title} className="context-panel p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-surface-container-low text-primary">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-xl font-bold text-primary">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">{text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
