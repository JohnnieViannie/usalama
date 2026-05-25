import type { SurveyStepDef } from "@/lib/siteSurveySchema";

export type FieldMeta = {
  requiresPhoto?: boolean;
};

/** Sections that show a section-level photo strip (vulnerability evidence). */
export const PHOTO_SECTION_IDS = ["general", "access", "perimeter", "cctv", "weaknesses"] as const;

export const FIELD_META: Record<string, FieldMeta> = {
  general_site: { requiresPhoto: true },
  perimeter_checklist: { requiresPhoto: true },
  perimeter_vulnerable: { requiresPhoto: true },
  perimeter_24_7_gate: { requiresPhoto: true },
  perimeter_tailgating: { requiresPhoto: true },
  perimeter_blind_spots: { requiresPhoto: true },
  cctv_checklist: { requiresPhoto: true },
  cctv_blind_spots: { requiresPhoto: true },
  cctv_obstructions: { requiresPhoto: true },
  cctv_nonfunctional: { requiresPhoto: true },
  cctv_monitoring_delay: { requiresPhoto: true },
  weaknesses_selected: { requiresPhoto: true },
};

export function getFieldMeta(step: SurveyStepDef): FieldMeta {
  return FIELD_META[step.id] ?? {};
}

export function sectionAllowsPhotos(sectionId: string): boolean {
  return (PHOTO_SECTION_IDS as readonly string[]).includes(sectionId);
}

export function collectsGuardRecommendation(step: SurveyStepDef): boolean {
  return step.kind !== "intro" && step.kind !== "deployment_matrix";
}

export function getGuardRecommendation(
  payload: Record<string, unknown>,
  stepId: string,
): string {
  const m = payload.guardRecommendations as Record<string, string> | undefined;
  return (m?.[stepId] ?? "").trim();
}
