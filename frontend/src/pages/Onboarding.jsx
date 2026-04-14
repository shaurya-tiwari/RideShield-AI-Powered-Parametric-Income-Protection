import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../auth/AuthContext";
import { locationsApi } from "../api/locations";
import { policiesApi } from "../api/policies";
import { workersApi } from "../api/workers";
import ErrorState from "../components/ErrorState";
import PlanCard from "../components/PlanCard";
import RiskGauge from "../components/RiskGauge";
import SectionHeader from "../components/SectionHeader";
import { PLATFORM_OPTIONS, STORAGE_KEYS } from "../utils/constants";
import {
  formatCurrency,
  humanizeSlug,
} from "../utils/formatters";

const initialForm = {
  name: "",
  phone: "",
  password: "",
  confirm_password: "",
  city: "delhi",
  zone: "south_delhi",
  platform: "zomato",
  self_reported_income: 900,
  working_hours: 9,
  consent_given: false,
};

const steps = [
  { id: "register", label: "Worker profile" },
  { id: "plan", label: "Policy choice" },
  { id: "complete", label: "Ready" },
];

const PLAN_STORIES = {
  basic_protect: {
    eyebrow: "Starter cover",
    bestFor:
      "A low-cost safety net for riders who mainly want outage protection and a predictable weekly premium.",
    compareFit: "Low-cost safety net",
  },
  smart_protect: {
    eyebrow: "Balanced cover",
    bestFor:
      "The default choice for most active riders who want weather, traffic, and outage protection together.",
    compareFit: "Best for everyday riding",
  },
  assured_plan: {
    eyebrow: "Guaranteed floor",
    bestFor:
      "Broader trigger cover with a guaranteed minimum payout floor when conditions turn rough.",
    compareFit: "Broader payout certainty",
  },
  pro_max: {
    eyebrow: "Premium cover",
    bestFor:
      "The highest-cap option for full-time riders who want predictive alerts and the fastest payout path.",
    compareFit: "Maximum protection",
  },
};

function getRecommendationReason() {
  return "Best balance of cost and coverage for your risk level";
}

function getFeaturedPlans(plans, selectedPlan, recommendedPlan) {
  const planMap = new Map((plans || []).map((plan) => [plan.plan_name, plan]));
  const premiumChoice = ["assured_plan", "pro_max"].includes(selectedPlan)
    ? selectedPlan
    : ["assured_plan", "pro_max"].includes(recommendedPlan)
      ? recommendedPlan
      : planMap.has("pro_max")
        ? "pro_max"
        : planMap.has("assured_plan")
          ? "assured_plan"
          : null;

  const orderedNames = [
    "basic_protect",
    "smart_protect",
    premiumChoice,
    selectedPlan,
    recommendedPlan,
  ];

  return Array.from(new Set(orderedNames.filter(Boolean)))
    .map((planName) => planMap.get(planName))
    .filter(Boolean)
    .slice(0, 3);
}

function validateRegistration(form) {
  const errors = {};
  const normalizedPhone = String(form.phone || "").trim();

  if (!String(form.name || "").trim()) {
    errors.name = "Full name is required.";
  }

  if (!normalizedPhone) {
    errors.phone = "Phone number is required.";
  } else if (!/^\+?\d{10,15}$/.test(normalizedPhone)) {
    errors.phone = "Use a valid worker phone number.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (String(form.password).length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (!form.confirm_password) {
    errors.confirm_password = "Confirm the password to continue.";
  } else if (form.password !== form.confirm_password) {
    errors.confirm_password = "Passwords do not match.";
  }

  if (!form.zone) {
    errors.zone = "Select an operating zone.";
  }

  if (!form.consent_given) {
    errors.consent_given = "Consent is required before registration.";
  }

  return errors;
}

function getPasswordStrength(password) {
  if (!password) {
    return null;
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score >= 4) {
    return { label: "Strong password", tone: "text-emerald-700" };
  }
  if (score >= 2) {
    return { label: "Decent password", tone: "text-amber-700" };
  }
  return { label: "Weak password", tone: "text-rose-700" };
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { loginWorker } = useAuth();
  const [step, setStep] = useState("register");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [cityOptions, setCityOptions] = useState([]);
  const [zoneOptions, setZoneOptions] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [planCatalog, setPlanCatalog] = useState([]);
  const [planCatalogLoading, setPlanCatalogLoading] = useState(false);
  const [planCatalogError, setPlanCatalogError] = useState("");
  const [planCatalogReloadKey, setPlanCatalogReloadKey] = useState(0);
  const [policyPurchase, setPolicyPurchase] = useState(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [locationsError, setLocationsError] = useState("");
  const [touched, setTouched] = useState({});
  const [showAllPlans, setShowAllPlans] = useState(false);

  const planOptions = useMemo(
    () =>
      planCatalog.length
        ? planCatalog
        : registration?.available_plans || [],
    [planCatalog, registration?.available_plans],
  );
  const recommendedPlanName =
    planOptions.find((plan) => plan.is_recommended)?.plan_name ||
    registration?.recommended_plan ||
    "";
  const selectedPlanData =
    planOptions.find((plan) => plan.plan_name === selectedPlan) ||
    registration?.available_plans?.find(
      (plan) => plan.plan_name === selectedPlan,
    );
  const featuredPlans = useMemo(
    () => getFeaturedPlans(planOptions, selectedPlan, recommendedPlanName),
    [planOptions, recommendedPlanName, selectedPlan],
  );
  const additionalPlans = useMemo(
    () =>
      planOptions.filter(
        (plan) =>
          !featuredPlans.some(
            (featuredPlan) => featuredPlan.plan_name === plan.plan_name,
          ),
      ),
    [featuredPlans, planOptions],
  );
  const stepIndex = steps.findIndex((item) => item.id === step);
  const progressWidth = `${((stepIndex + 1) / steps.length) * 100}%`;
  const validationErrors = useMemo(() => validateRegistration(form), [form]);
  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password],
  );
  const monitoredCities = cityOptions.length || 4;

  useEffect(() => {
    document.title = "Onboarding | RideShield";
  }, []);

  useEffect(() => {
    try {
      const rawDraft = window.sessionStorage.getItem(
        STORAGE_KEYS.onboardingDraft,
      );
      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft.form) {
          setForm((current) => ({ ...current, ...draft.form }));
        }
        if (draft.registration) {
          setRegistration(draft.registration);
        }
        if (draft.selectedPlan) {
          setSelectedPlan(draft.selectedPlan);
        }
        if (Array.isArray(draft.planCatalog)) {
          setPlanCatalog(draft.planCatalog);
        }
        if (draft.step && draft.step !== "complete") {
          setStep(draft.step);
        }
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEYS.onboardingDraft);
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  const loadCities = useCallback(async () => {
    setLocationsLoading(true);
    setLocationsError("");
    try {
      const response = await locationsApi.cities();
      const cities = response.data || [];
      setCityOptions(cities);
      if (cities.length) {
        setForm((current) =>
          cities.some((city) => city.slug === current.city)
            ? current
            : { ...current, city: cities[0].slug },
        );
      }
    } catch {
      setLocationsError(
        "Worker geography could not be loaded. Retry to continue onboarding.",
      );
    } finally {
      setLocationsLoading(false);
    }
  }, []);

  const loadZones = useCallback(async (citySlug) => {
    try {
      setLocationsError("");
      const response = await locationsApi.zones(citySlug);
      const zones = response.data || [];
      setZoneOptions(zones);
      if (zones.length) {
        setForm((current) =>
          zones.some((zone) => zone.slug === current.zone)
            ? current
            : { ...current, zone: zones[0].slug },
        );
      }
    } catch {
      setLocationsError("Zones could not be loaded for the selected city.");
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }
    loadCities();
  }, [draftLoaded, loadCities]);

  useEffect(() => {
    if (draftLoaded && form.city) {
      loadZones(form.city);
    }
  }, [draftLoaded, form.city, loadZones]);

  useEffect(() => {
    if (!draftLoaded) {
      return;
    }
    if (step === "complete") {
      window.sessionStorage.removeItem(STORAGE_KEYS.onboardingDraft);
      return;
    }
    window.sessionStorage.setItem(
      STORAGE_KEYS.onboardingDraft,
      JSON.stringify({
        step,
        form,
        registration,
        selectedPlan,
        planCatalog,
      }),
    );
  }, [draftLoaded, form, planCatalog, registration, selectedPlan, step]);

  useEffect(() => {
    if (
      additionalPlans.some((plan) => plan.plan_name === selectedPlan) &&
      !showAllPlans
    ) {
      setShowAllPlans(true);
    }
  }, [additionalPlans, selectedPlan, showAllPlans]);

  useEffect(() => {
    let active = true;

    async function loadPlanCatalog() {
      if (step !== "plan" || !registration?.worker_id) {
        return;
      }

      setPlanCatalogLoading(true);
      setPlanCatalogError("");
      try {
        const response = await policiesApi.plans(registration.worker_id);
        if (!active) {
          return;
        }
        const plans = response.data?.plans || [];
        setPlanCatalog(plans);

        const recommended = response.data?.recommended;
        if (recommended) {
          setSelectedPlan((current) => {
            if (!current) {
              return recommended;
            }
            return plans.some((plan) => plan.plan_name === current)
              ? current
              : recommended;
          });
        }
      } catch (error) {
        if (!active) {
          return;
        }
        setPlanCatalogError(
          error.response?.data?.detail ||
            "Detailed premium pricing could not be loaded.",
        );
      } finally {
        if (active) {
          setPlanCatalogLoading(false);
        }
      }
    }

    loadPlanCatalog();

    return () => {
      active = false;
    };
  }, [planCatalogReloadKey, registration?.worker_id, step]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function markTouched(field) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleOpenDashboard() {
    setLoading(true);
    try {
      const result = await loginWorker(form.phone, form.password);
      navigate(`/dashboard/${result.session.worker_id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Worker sign-in failed. Use the sign-in page to continue.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const nextTouched = {
      name: true,
      phone: true,
      password: true,
      confirm_password: true,
      zone: true,
      consent_given: true,
    };
    setTouched((current) => ({ ...current, ...nextTouched }));
    if (Object.keys(validationErrors).length) {
      toast.error("Fix the highlighted registration fields first.");
      return;
    }
    setLoading(true);
    try {
      const response = await workersApi.register({
        password: form.password,
        name: form.name,
        phone: form.phone,
        city: form.city,
        zone: form.zone,
        platform: form.platform,
        self_reported_income: Number(form.self_reported_income),
        working_hours: Number(form.working_hours),
        consent_given: form.consent_given,
      });
      setRegistration(response.data);
      setPlanCatalog([]);
      setPlanCatalogError("");
      setSelectedPlan(response.data.recommended_plan);
      setStep("plan");
      toast.success("Worker registered. Choose a policy next.");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Worker registration failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!selectedPlan) {
      toast.error("Select a plan before continuing");
      return;
    }
    setLoading(true);
    try {
      const response = await policiesApi.create({
        worker_id: registration.worker_id,
        plan_name: selectedPlan,
      });
      setPolicyPurchase(response.data);
      setStep("complete");
      window.sessionStorage.removeItem(STORAGE_KEYS.onboardingDraft);
      toast.success("Policy purchased");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Policy purchase failed.");
    } finally {
      setLoading(false);
    }
  }

  const summaryLine = useMemo(() => {
    return `${humanizeSlug(form.city)} - ${humanizeSlug(form.zone)} - ${humanizeSlug(form.platform)}`;
  }, [form.city, form.zone, form.platform]);

  if (step === "complete" && registration && policyPurchase) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <SectionHeader
          eyebrow="Ready"
          title="You're now protected"
          description="Your income protection is active and monitoring for disruptions."
        />
        <div className="decision-panel p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-surface-container-high border border-surface-container-highest p-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Worker</p>
              <p className="mt-2 text-2xl font-bold">{registration.name}</p>
              <p className="mt-2 text-sm text-primary">
                Active in {humanizeSlug(registration.city)}
              </p>
            </div>
            <div className="rounded-3xl bg-surface-container-high border border-surface-container-highest p-5">
              <p className="text-sm font-semibold uppercase tracking-widest text-on-surface-variant">Policy</p>
              <p className="mt-2 text-2xl font-bold">
                {policyPurchase.policy.plan_display_name}
              </p>
              <p className="mt-2 text-sm text-primary">
                {formatCurrency(selectedPlanData.weekly_premium)}/week • Active
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="button-primary"
              disabled={loading}
              onClick={handleOpenDashboard}
            >
              {loading ? "Opening dashboard..." : "Go to Dashboard"}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => navigate("/auth")}
            >
              Sign in again later
            </button>
          </div>
          <p className="mt-6 text-sm text-on-surface-variant text-center">
            We&apos;ll automatically detect disruptions and handle claims for you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "mx-auto max-w-5xl space-y-8",
        step === "plan" ? "pb-36" : "",
      )}
    >
      <SectionHeader
        eyebrow="Worker onboarding"
        title="Register a delivery worker and buy a policy"
        description="This flow uses the real worker registration and policy purchase APIs. Admin-only simulation actions stay outside the worker signup flow."
      />

      <div className="context-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {steps.map((item, index) => (
              <div
                key={item.id}
                className={`pill ${index <= stepIndex ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant"}`}
              >
                {item.label}
              </div>
            ))}
          </div>
          <p className="text-sm text-on-surface-variant">{summaryLine}</p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-container-low">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      {step === "register" ? (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <form className="context-panel p-6" onSubmit={handleRegister}>
            <div className="space-y-6">
              {locationsError ? (
                <ErrorState message={locationsError} onRetry={loadCities} />
              ) : null}
              <div>
                <p className="eyebrow">Identity</p>
                <div className="mt-4 grid gap-5">
                  <div>
                    <label className="label" htmlFor="worker-name">
                      Full name
                    </label>
                    <input
                      id="worker-name"
                      className="field"
                      value={form.name}
                      onBlur={() => markTouched("name")}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                    />
                    {touched.name && validationErrors.name ? (
                      <p className="mt-2 text-sm text-rose-700">
                        {validationErrors.name}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="label" htmlFor="worker-phone">
                      Phone number
                    </label>
                    <input
                      id="worker-phone"
                      className="field"
                      value={form.phone}
                      onBlur={() => markTouched("phone")}
                      onChange={(e) => updateField("phone", e.target.value)}
                      required
                    />
                    {touched.phone && validationErrors.phone ? (
                      <p className="mt-2 text-sm text-rose-700">
                        {validationErrors.phone}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="worker-password">
                        Password
                      </label>
                      <input
                        id="worker-password"
                        className="field"
                        type="password"
                        value={form.password}
                        onBlur={() => markTouched("password")}
                        onChange={(e) =>
                          updateField("password", e.target.value)
                        }
                        minLength={8}
                        required
                      />
                      {passwordStrength ? (
                        <p className={`mt-2 text-sm ${passwordStrength.tone}`}>
                          {passwordStrength.label}
                        </p>
                      ) : null}
                      {touched.password && validationErrors.password ? (
                        <p className="mt-2 text-sm text-rose-700">
                          {validationErrors.password}
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label
                        className="label"
                        htmlFor="worker-confirm-password"
                      >
                        Confirm password
                      </label>
                      <input
                        id="worker-confirm-password"
                        className="field"
                        type="password"
                        value={form.confirm_password}
                        onBlur={() => markTouched("confirm_password")}
                        onChange={(e) =>
                          updateField("confirm_password", e.target.value)
                        }
                        minLength={8}
                        required
                      />
                      {touched.confirm_password &&
                      validationErrors.confirm_password ? (
                        <p className="mt-2 text-sm text-rose-700">
                          {validationErrors.confirm_password}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="eyebrow">Operating area</p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="worker-city">
                      City
                    </label>
                    <select
                      id="worker-city"
                      className="field"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      disabled={locationsLoading}
                    >
                      {cityOptions.map((option) => (
                        <option key={option.id} value={option.slug}>
                          {option.display_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="worker-zone">
                      Zone
                    </label>
                    <select
                      id="worker-zone"
                      className="field"
                      value={form.zone}
                      onBlur={() => markTouched("zone")}
                      onChange={(e) => updateField("zone", e.target.value)}
                      disabled={locationsLoading || !zoneOptions.length}
                    >
                      {zoneOptions.map((zone) => (
                        <option key={zone.id} value={zone.slug}>
                          {zone.display_name}
                        </option>
                      ))}
                    </select>
                    {touched.zone && validationErrors.zone ? (
                      <p className="mt-2 text-sm text-rose-700">
                        {validationErrors.zone}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <p className="eyebrow">Earning profile</p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="worker-platform">
                      Platform
                    </label>
                    <select
                      id="worker-platform"
                      className="field"
                      value={form.platform}
                      onChange={(e) => updateField("platform", e.target.value)}
                    >
                      {PLATFORM_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="worker-hours">
                      Working hours per day
                    </label>
                    <input
                      id="worker-hours"
                      className="field"
                      type="number"
                      step="0.5"
                      value={form.working_hours}
                      onChange={(e) =>
                        updateField("working_hours", e.target.value)
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="worker-income">
                      Self-reported daily income
                    </label>
                    <input
                      id="worker-income"
                      className="field"
                      type="number"
                      value={form.self_reported_income}
                      onChange={(e) =>
                        updateField("self_reported_income", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-2xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={form.consent_given}
                  onBlur={() => markTouched("consent_given")}
                  onChange={(e) =>
                    updateField("consent_given", e.target.checked)
                  }
                />
                <span>
                  Worker consents to location, behavior, and device data being
                  used for claim validation and fraud checks.
                </span>
              </label>
              {touched.consent_given && validationErrors.consent_given ? (
                <p className="text-sm text-rose-700">
                  {validationErrors.consent_given}
                </p>
              ) : null}

              <button
                type="submit"
                className="button-primary"
                disabled={
                  loading ||
                  locationsLoading ||
                  !form.consent_given ||
                  !form.zone
                }
              >
                {loading ? "Calculating risk profile..." : "Register worker"}
              </button>
            </div>
          </form>

          <RiskGauge
            score={registration?.risk_score}
            breakdown={registration?.risk_breakdown}
          />
        </div>
      ) : null}

      {step === "plan" && registration ? (
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <RiskGauge
              score={registration.risk_score}
              breakdown={registration.risk_breakdown}
            />

            <div className="panel p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Compare plans</p>
                  <h3 className="mt-2 text-2xl font-bold text-primary">
                    Pick protection in one glance
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
                    Three curated options. Weekly pricing already reflects the
                    rider&apos;s live risk score, so you only need to compare
                    cost, cap, and fit.
                  </p>
                </div>
                <span className="pill bg-surface-container-high text-on-surface-variant">
                  {featuredPlans.length} options
                </span>
              </div>

              {planCatalogError ? (
                <div className="mt-5">
                  <ErrorState
                    message={planCatalogError}
                    onRetry={() =>
                      setPlanCatalogReloadKey((current) => current + 1)
                    }
                  />
                </div>
              ) : null}

              {planCatalogLoading ? (
                <div className="mt-5 rounded-2xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
                  Refreshing live policy pricing...
                </div>
              ) : null}

              {featuredPlans.length ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {featuredPlans.map((plan) => {
                    const story = PLAN_STORIES[plan.plan_name];
                    const planName =
                      plan.display_name || humanizeSlug(plan.plan_name);

                    return (
                      <div
                        key={plan.plan_name}
                        className={clsx(
                          "rounded-2xl border p-4 transition",
                          selectedPlan === plan.plan_name
                            ? "border-ink bg-white"
                            : "border-white/10 bg-surface-container-high",
                        )}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                          {planName}
                        </p>
                        <p className="mt-3 text-2xl font-bold">
                          {formatCurrency(plan.weekly_premium)}
                        </p>
                        <p className="mt-1 text-sm text-on-surface-variant">
                          Up to {formatCurrency(plan.coverage_cap)}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                          {story?.compareFit || plan.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-surface-container-high p-4 text-sm text-on-surface-variant">
                  Policy options will appear as soon as pricing finishes
                  loading.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {featuredPlans.map((plan) => (
              <PlanCard
                key={plan.plan_name}
                plan={plan}
                selected={selectedPlan === plan.plan_name}
                onSelect={setSelectedPlan}
                story={PLAN_STORIES[plan.plan_name]}
                recommendationReason={
                  plan.is_recommended
                    ? getRecommendationReason()
                    : ""
                }
              />
            ))}
          </div>

          {additionalPlans.length ? (
            <div className="context-panel p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">More options</p>
                  <h3 className="mt-2 text-2xl font-bold text-primary">
                    Need a different coverage shape?
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant">
                    The short list keeps the decision fast, but the full backend
                    catalog is still available when a rider wants a different
                    cap or payout profile.
                  </p>
                </div>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setShowAllPlans((current) => !current)}
                >
                  {showAllPlans
                    ? `Hide extra option${additionalPlans.length === 1 ? "" : "s"}`
                    : `Show ${additionalPlans.length} more option${additionalPlans.length === 1 ? "" : "s"}`}
                </button>
              </div>

              {showAllPlans ? (
                <div className="mt-5 grid gap-4 xl:grid-cols-3">
                  {additionalPlans.map((plan) => (
                    <PlanCard
                      key={plan.plan_name}
                      plan={plan}
                      selected={selectedPlan === plan.plan_name}
                      onSelect={setSelectedPlan}
                      story={PLAN_STORIES[plan.plan_name]}
                      recommendationReason={
                        plan.is_recommended
                          ? getRecommendationReason()
                          : ""
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl bg-surface-container-high p-4 text-sm leading-6 text-on-surface-variant">
                  RideShield is highlighting the quickest three-way choice
                  first. Open the extra option list if this rider needs a
                  different premium-to-coverage tradeoff.
                </div>
              )}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="panel p-6">
              <p className="eyebrow">Trust and safety</p>
              <h3 className="mt-2 text-2xl font-bold text-primary">
                Why this feels safer to buy
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-surface-container-high p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    Monitoring
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    {monitoredCities} cities live
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    Weather, traffic, AQI, and outage thresholds are tracked
                    automatically.
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container-high p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    Decision path
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Auto-checks first
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    Straightforward claims can auto-decide; suspicious ones
                    route to manual review.
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container-high p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    Activation
                  </p>
                  <p className="mt-2 text-lg font-semibold">
                    Clear waiting period
                  </p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    Coverage stays pending until the waiting period ends or
                    simulation activates it.
                  </p>
                </div>
              </div>
            </div>

            <div className="panel p-6">
              <p className="eyebrow">After purchase</p>
              <h3 className="mt-2 text-2xl font-bold text-primary">
                What happens next
              </h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-surface-container-high p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    Step 1
                  </p>
                  <p className="mt-2 text-lg font-semibold">Purchase</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    Lock in the selected weekly premium and coverage cap.
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container-high p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    Step 2
                  </p>
                  <p className="mt-2 text-lg font-semibold">Waiting period</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    The policy stays pending until the wait window ends or an
                    admin activates simulation coverage.
                  </p>
                </div>
                <div className="rounded-2xl bg-surface-container-high p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">
                    Step 3
                  </p>
                  <p className="mt-2 text-lg font-semibold">Coverage active</p>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                    The worker dashboard shows the active policy, live
                    incidents, and claim outcomes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {step === "plan" && registration ? (
        <div className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-5xl">
          <div className="panel border-primary/20 bg-surface-container-low p-4 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-primary">
                  Selected Plan:{" "}
                  {selectedPlanData
                    ? selectedPlanData.display_name ||
                      humanizeSlug(selectedPlanData.plan_name)
                    : "None"}
                </p>
                {selectedPlanData ? (
                  <span className="text-lg font-semibold text-primary">
                    • {formatCurrency(selectedPlanData.weekly_premium)}/week
                  </span>
                ) : null}
              </div>

              <button
                type="button"
                className="button-primary min-w-[240px] px-8 py-4 text-base"
                disabled={loading || !selectedPlanData}
                onClick={handlePurchase}
              >
                {loading ? "Activating..." : "Activate Protection"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
