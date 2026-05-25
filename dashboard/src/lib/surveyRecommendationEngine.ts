import { getPayloadValue, type SurveyStepDef } from "@/lib/siteSurveySchema";
import { getFieldMeta, type ComputedRule } from "@/lib/surveyFieldMeta";

export type ComputedRecommendationItem = {
  id: string;
  fieldId?: string;
  text: string;
};

export type ComputedRecommendations = {
  guardsRecommended?: number;
  guardsDelta?: number;
  guardsBaseline?: number;
  items: ComputedRecommendationItem[];
};

const WEAKNESS_ACTIONS: Record<string, string> = {
  blind_spots: "Install additional CCTV or lighting to cover blind spots.",
  uncontrolled_access: "Add access control barriers and manned checkpoints.",
  poor_supervision: "Introduce shift supervisors and structured handover reports.",
  weak_reporting: "Deploy electronic patrol system and daily incident logs.",
  lack_training: "Schedule guard training on access control and emergency response.",
  communication_gaps: "Issue radios and define escalation procedures.",
  poor_lighting: "Increase perimeter and parking area lighting.",
  delayed_response: "Define alarm response SLAs and supervisor on-call.",
};

function parseIntSafe(v: unknown): number | null {
  if (typeof v === "number" && !Number.isNaN(v)) return Math.round(v);
  if (typeof v === "string") {
    const m = v.match(/\d+/);
    if (m) return parseInt(m[0], 10);
  }
  return null;
}

function guardsPlusFour(payload: Record<string, unknown>, step?: SurveyStepDef): ComputedRecommendationItem | null {
  const raw =
    getPayloadValue(payload, "finalObjectives.guardsNeeded") ??
    getPayloadValue(payload, "manpower.siteSize");
  const n = parseIntSafe(raw);
  if (n == null || n < 0) return null;
  const recommended = n + 4;
  return {
    id: "guards_plus_four",
    fieldId: step?.id,
    text: `Based on your entry of ${n} guard(s), we recommend ${recommended} guards (+4) for adequate coverage and supervision.`,
  };
}

function guardsFromAccessPoints(payload: Record<string, unknown>, step?: SurveyStepDef): ComputedRecommendationItem | null {
  const entrances = parseIntSafe(getPayloadValue(payload, "accessControl.entrancesExits")) ?? 0;
  const gates = parseIntSafe(getPayloadValue(payload, "accessControl.vehicleGates")) ?? 0;
  const loading = parseIntSafe(getPayloadValue(payload, "accessControl.loadingAreas")) ?? 0;
  const external = (getPayloadValue(payload, "threats.external") as string[] | undefined) ?? [];
  const threatBonus = Math.min(external.length, 4);
  const suggested = Math.max(2, entrances + gates + Math.ceil(loading / 2) + threatBonus);
  return {
    id: "guards_from_access_points",
    fieldId: step?.id,
    text: `Suggested minimum deployment: ${suggested} guards (based on ${entrances} entrances, ${gates} vehicle gates, and threat profile). Consider +4 buffer for peak hours.`,
  };
}

function threatPriority(payload: Record<string, unknown>, step?: SurveyStepDef): ComputedRecommendationItem | null {
  const key = step?.payloadKey ?? "";
  const selected = (getPayloadValue(payload, key) as string[] | undefined) ?? [];
  if (selected.length === 0) return null;
  const labels = step?.options?.filter((o) => selected.includes(o.value)).map((o) => o.label) ?? selected;
  const top = labels.slice(0, 3).join(", ");
  return {
    id: "threat_priority",
    fieldId: step?.id,
    text: `Prioritise controls for: ${top}. Align guard posts and patrol frequency to these threats.`,
  };
}

function weaknessActions(payload: Record<string, unknown>, step?: SurveyStepDef): ComputedRecommendationItem | null {
  const selected = (getPayloadValue(payload, "weaknesses.selected") as string[] | undefined) ?? [];
  if (selected.length === 0) return null;
  const lines = selected
    .map((w) => WEAKNESS_ACTIONS[w])
    .filter(Boolean)
    .slice(0, 4);
  return {
    id: "weakness_actions",
    fieldId: step?.id,
    text: lines.length ? lines.join(" ") : "Address each identified weakness with a dated corrective action.",
  };
}

function runRule(
  rule: ComputedRule,
  payload: Record<string, unknown>,
  step?: SurveyStepDef,
): ComputedRecommendationItem | null {
  switch (rule) {
    case "guards_plus_four":
      return guardsPlusFour(payload, step);
    case "guards_from_access_points":
      return guardsFromAccessPoints(payload, step);
    case "threat_priority":
      return threatPriority(payload, step);
    case "weakness_actions":
      return weaknessActions(payload, step);
    default:
      return null;
  }
}

/** Build all computed recommendations for a payload (call on submit and for dashboard display). */
export function buildComputedRecommendations(payload: Record<string, unknown>): ComputedRecommendations {
  const items: ComputedRecommendationItem[] = [];
  const seen = new Set<string>();

  const guardsItem = guardsPlusFour(payload);
  let guardsBaseline: number | undefined;
  let guardsRecommended: number | undefined;
  let guardsDelta = 4;
  if (guardsItem) {
    items.push(guardsItem);
    seen.add(guardsItem.id);
    const m = guardsItem.text.match(/entry of (\d+)/);
    if (m) guardsBaseline = parseInt(m[1], 10);
    const m2 = guardsItem.text.match(/recommend (\d+) guards/);
    if (m2) guardsRecommended = parseInt(m2[1], 10);
  }

  const accessItem = guardsFromAccessPoints(payload);
  if (accessItem && !seen.has(accessItem.id)) {
    items.push(accessItem);
    seen.add(accessItem.id);
  }

  return {
    guardsBaseline,
    guardsRecommended,
    guardsDelta,
    items,
  };
}

/** Per-field computed hint for wizard UI. */
export function computedForStep(step: SurveyStepDef, payload: Record<string, unknown>): string | null {
  const rule = getFieldMeta(step).computedRule;
  if (!rule) return null;
  return runRule(rule, payload, step)?.text ?? null;
}

/** Merge step-level items when rendering a full survey. */
export function allComputedItems(payload: Record<string, unknown>, steps: SurveyStepDef[]): ComputedRecommendationItem[] {
  const built = buildComputedRecommendations(payload);
  const items = [...built.items];
  const seen = new Set(items.map((i) => `${i.id}:${i.fieldId ?? ""}`));
  for (const step of steps) {
    const rule = getFieldMeta(step).computedRule;
    if (!rule || rule === "guards_plus_four" || rule === "guards_from_access_points") continue;
    const item = runRule(rule, payload, step);
    if (item) {
      const k = `${item.id}:${item.fieldId ?? ""}`;
      if (!seen.has(k)) {
        items.push(item);
        seen.add(k);
      }
    }
  }
  return items;
}
