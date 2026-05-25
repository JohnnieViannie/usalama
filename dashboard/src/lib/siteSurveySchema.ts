/** Canonical Security Site Survey — step order must match guard wizard. */

export const SURVEY_SCHEMA_VERSION = 2;

export type SurveyStepKind =
  | "intro"
  | "section_intro"
  | "text"
  | "number"
  | "single_select"
  | "multi_select"
  | "yes_no"
  | "textarea"
  | "deployment_matrix";

export type SurveyStepDef = {
  id: string;
  sectionId: string;
  kind: SurveyStepKind;
  label: string;
  objective?: string;
  recommendation: string;
  recommendationIfNo?: string;
  options?: { value: string; label: string }[];
  payloadKey: string;
  followUpKey?: string;
  followUpLabel?: string;
  required?: boolean;
};

export const FACILITY_TYPES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "construction", label: "Construction" },
  { value: "retail", label: "Retail" },
  { value: "infrastructure", label: "Infrastructure" },
];

export const OPERATING_HOURS = [
  { value: "24_7", label: "24/7" },
  { value: "limited", label: "Limited hours (e.g. 12/7)" },
];

export const EXTERNAL_THREATS = [
  { value: "unauthorized_access", label: "Unauthorized access" },
  { value: "theft", label: "Theft" },
  { value: "trespassing", label: "Trespassing" },
  { value: "vandalism", label: "Vandalism" },
  { value: "terror", label: "Terror threats" },
  { value: "demonstrations", label: "Demonstrations" },
  { value: "vehicle_attacks", label: "Vehicle attacks" },
  { value: "nearby_high_risk", label: "Nearby high-risk locations" },
];

export const INTERNAL_THREATS = [
  { value: "employee_misconduct", label: "Employee misconduct" },
  { value: "insider_theft", label: "Insider theft" },
  { value: "unauthorized_contractors", label: "Unauthorized contractors" },
  { value: "negligence", label: "Negligence" },
  { value: "information_leakage", label: "Information leakage" },
  { value: "workplace_violence", label: "Workplace violence" },
];

export const SAFETY_RISKS = [
  { value: "fire", label: "Fire hazards" },
  { value: "electrical", label: "Electrical hazards" },
  { value: "gas_chemicals", label: "Gas / chemicals" },
  { value: "slip_trip", label: "Slip / trip hazards" },
  { value: "housekeeping", label: "Poor housekeeping" },
  { value: "unsafe_structures", label: "Unsafe structures" },
  { value: "evacuation", label: "Emergency evacuation issues" },
];

export const PERIMETER_CHECKLIST = [
  { value: "boundary_walls", label: "Boundary walls / fencing" },
  { value: "lighting", label: "Lighting condition" },
  { value: "dark_areas", label: "Dark areas" },
  { value: "broken_fencing", label: "Broken fencing" },
  { value: "open_access", label: "Open access areas" },
  { value: "rooftop", label: "Rooftop access" },
  { value: "basement", label: "Basement access" },
];

export const CCTV_CHECKLIST = [
  { value: "camera_locations", label: "Camera locations" },
  { value: "recording_quality", label: "Recording quality" },
  { value: "storage_duration", label: "Storage duration" },
  { value: "monitoring_room", label: "Monitoring room" },
  { value: "alarm_systems", label: "Alarm systems" },
  { value: "motion_detection", label: "Motion detection" },
  { value: "intercom", label: "Intercom systems" },
  { value: "fire_integration", label: "Fire alarm integration" },
];

export const EMERGENCY_CHECKLIST = [
  { value: "extinguishers", label: "Fire extinguishers" },
  { value: "fire_alarm", label: "Fire alarm system" },
  { value: "emergency_lighting", label: "Emergency lighting" },
  { value: "assembly_points", label: "Assembly points" },
  { value: "evacuation_routes", label: "Evacuation routes" },
  { value: "first_aid", label: "First aid kits" },
  { value: "emergency_contacts", label: "Emergency contact list" },
  { value: "incident_reporting", label: "Incident reporting process" },
];

export const CRITICAL_AREAS = [
  { value: "main_gate", label: "Main gate" },
  { value: "reception", label: "Reception" },
  { value: "loading_bay", label: "Loading bay" },
  { value: "cctv_room", label: "CCTV room" },
  { value: "cash_handling", label: "Cash handling area" },
  { value: "parking", label: "Parking" },
  { value: "emergency_exits", label: "Emergency exits" },
];

export const WEAKNESSES = [
  { value: "blind_spots", label: "Blind spots" },
  { value: "uncontrolled_access", label: "Uncontrolled access" },
  { value: "poor_supervision", label: "Poor supervision" },
  { value: "weak_reporting", label: "Weak reporting system" },
  { value: "lack_training", label: "Lack of training" },
  { value: "communication_gaps", label: "Communication gaps" },
  { value: "poor_lighting", label: "Poor lighting" },
  { value: "delayed_response", label: "Delayed incident response" },
];

export const RECOMMENDATION_ACTIONS = [
  { value: "additional_cctv", label: "Install additional CCTV cameras" },
  { value: "increase_lighting", label: "Increase lighting in parking areas" },
  { value: "access_barriers", label: "Add access control barriers" },
  { value: "peak_guards", label: "Increase guards during peak hours" },
  { value: "fire_drills", label: "Conduct fire drills" },
  { value: "visitor_mgmt", label: "Improve visitor management" },
  { value: "e_patrol", label: "Introduce electronic patrol system" },
  { value: "supervision", label: "Strengthen supervision & reporting" },
];

export const SURVEY_SECTIONS: { id: string; title: string; objective?: string }[] = [
  { id: "intro", title: "Corporate Security Survey" },
  {
    id: "general",
    title: "General Site Information",
    objective: "Capture basic site data for risk context.",
  },
  {
    id: "threats",
    title: "Threat & Risk Assessment",
    objective: "Identify risks, analyse vulnerability, assess impact and prioritise risks.",
  },
  {
    id: "access",
    title: "Access Control Assessment",
    objective:
      "Analyse which access point is most vulnerable, which gates require 24/7 guarding, tailgating risk and blind spots.",
  },
  {
    id: "perimeter",
    title: "Perimeter Security",
    objective: "Assess boundary controls, lighting, and hidden access routes.",
  },
  {
    id: "cctv",
    title: "CCTV & Electronic Security",
    objective: "Evaluate surveillance coverage, alarms, and monitoring response.",
  },
  {
    id: "emergency",
    title: "Emergency Preparedness",
    objective: "Review life-safety equipment, routes, and guard readiness.",
  },
  {
    id: "deployment",
    title: "Guard Deployment Analysis",
    objective: "Plan posts, patrols, and supervision by risk and traffic.",
  },
  {
    id: "manpower",
    title: "Manpower Calculation Factors",
    objective: "Factors for determining required guard count.",
  },
  {
    id: "weaknesses",
    title: "Security Weakness Analysis",
    objective: "Identify specific control failures.",
  },
  {
    id: "close",
    title: "Recommendations & Final Objectives",
    objective: "Summarise actions and deployment decisions.",
  },
];

export const SITE_SURVEY_STEPS: SurveyStepDef[] = [
  {
    id: "intro_mission",
    sectionId: "intro",
    kind: "intro",
    label: "Corporate Security Survey",
    objective:
      "To help identify risks, weaknesses, and the right security deployment to ensure safety and security of people, assets and operations.",
    recommendation:
      "Take photos of vulnerabilities. Walk the site at night. Interview staff on access and emergency procedures.",
    payloadKey: "_intro",
  },
  {
    id: "general_site",
    sectionId: "general",
    kind: "text",
    label: "Site name & location",
    recommendation: "Record GPS or landmark references for follow-up visits and map overlays.",
    payloadKey: "general.siteNameLocation",
    required: true,
  },
  {
    id: "general_facility",
    sectionId: "general",
    kind: "single_select",
    label: "Type of facility",
    options: FACILITY_TYPES,
    recommendation: "Facility type drives typical threat profile and guard skill requirements.",
    payloadKey: "general.facilityType",
    required: true,
  },
  {
    id: "general_area",
    sectionId: "general",
    kind: "text",
    label: "Total area & number of buildings",
    recommendation: "Larger sites need more patrol routes and static posts; note multi-building access paths.",
    payloadKey: "general.totalAreaBuildings",
  },
  {
    id: "general_hours",
    sectionId: "general",
    kind: "single_select",
    label: "Operating hours",
    options: OPERATING_HOURS,
    recommendation: "Limited hours may still need night patrol if assets remain on site.",
    payloadKey: "general.operatingHours",
  },
  {
    id: "general_occupants",
    sectionId: "general",
    kind: "number",
    label: "Number of occupants / visitors",
    recommendation: "Higher footfall increases access-control and crowd-management needs.",
    payloadKey: "general.occupantsVisitors",
  },
  {
    id: "general_provider",
    sectionId: "general",
    kind: "text",
    label: "Existing security provider (if any)",
    recommendation: "Note contract scope gaps before recommending additional manpower or technology.",
    payloadKey: "general.existingProvider",
  },
  {
    id: "threats_external",
    sectionId: "threats",
    kind: "multi_select",
    label: "External threats",
    options: EXTERNAL_THREATS,
    recommendation: "Prioritise controls for the top 2–3 external threats by likelihood and impact.",
    payloadKey: "threats.external",
  },
  {
    id: "threats_internal",
    sectionId: "threats",
    kind: "multi_select",
    label: "Internal threats",
    options: INTERNAL_THREATS,
    recommendation: "Insider risks often need policy, access logs, and supervision—not only guards.",
    payloadKey: "threats.internal",
  },
  {
    id: "threats_safety",
    sectionId: "threats",
    kind: "multi_select",
    label: "Safety risks",
    options: SAFETY_RISKS,
    recommendation: "Coordinate with HSE/fire wardens; guards must know assembly points and alarms.",
    payloadKey: "threats.safety",
  },
  {
    id: "access_entrances",
    sectionId: "access",
    kind: "number",
    label: "Number of entrances / exits",
    recommendation: "Each uncontrolled entrance may need a post, CCTV, or access control.",
    payloadKey: "accessControl.entrancesExits",
  },
  {
    id: "access_emergency",
    sectionId: "access",
    kind: "number",
    label: "Number of emergency exits",
    recommendation: "Emergency exits must be monitored but not obstructed; check alarm linkage.",
    payloadKey: "accessControl.emergencyExits",
  },
  {
    id: "access_vehicle",
    sectionId: "access",
    kind: "number",
    label: "Number of vehicle gates",
    recommendation: "Vehicle gates are high-risk; consider barriers, searches, and 24/7 coverage.",
    payloadKey: "accessControl.vehicleGates",
  },
  {
    id: "access_visitor_mgmt",
    sectionId: "access",
    kind: "yes_no",
    label: "Visitor management system in operation?",
    followUpKey: "accessControl.visitorMgmtName",
    followUpLabel: "System / process name",
    recommendation: "Implement pre-registration, escorts, and visitor logs if not in place.",
    recommendationIfNo: "Recommend a formal visitor management process with sign-in and badges.",
    payloadKey: "accessControl.visitorMgmt",
  },
  {
    id: "access_visitor_id",
    sectionId: "access",
    kind: "yes_no",
    label: "Are visitors issued ID cards and verification done?",
    followUpKey: "accessControl.visitorIdExplain",
    followUpLabel: "Explain verification process",
    recommendation: "Photo ID, pre-approval, and visible visitor badges reduce tailgating risk.",
    recommendationIfNo: "Introduce ID verification and temporary badges at all public entrances.",
    payloadKey: "accessControl.visitorIdVerification",
  },
  {
    id: "access_loading",
    sectionId: "access",
    kind: "number",
    label: "Number of loading / unloading areas",
    recommendation: "Secure loading bays against theft and unauthorised vehicle access.",
    payloadKey: "accessControl.loadingAreas",
  },
  {
    id: "access_delivery",
    sectionId: "access",
    kind: "yes_no",
    label: "Is there delivery control?",
    followUpKey: "accessControl.deliveryExplain",
    followUpLabel: "Explain delivery control",
    recommendation: "Schedule deliveries, inspect seals, and log all carriers.",
    recommendationIfNo: "Add delivery booking, driver ID checks, and escorted access.",
    payloadKey: "accessControl.deliveryControl",
  },
  {
    id: "access_guard_visibility",
    sectionId: "access",
    kind: "yes_no",
    label: "Guard visibility at entrance?",
    recommendation: "Visible guards deter opportunistic crime and assist legitimate visitors.",
    recommendationIfNo: "Place a static guard or clearly marked security presence at main entrance.",
    payloadKey: "accessControl.guardVisibility",
  },
  {
    id: "perimeter_checklist",
    sectionId: "perimeter",
    kind: "multi_select",
    label: "Perimeter checklist",
    options: PERIMETER_CHECKLIST,
    recommendation: "Address broken fencing and dark areas before adding manpower.",
    payloadKey: "perimeter.checklist",
  },
  {
    id: "perimeter_vulnerable",
    sectionId: "perimeter",
    kind: "textarea",
    label: "Which access point is most vulnerable?",
    recommendation: "Harden the weakest point first: lighting, CCTV, barriers, or dedicated post.",
    payloadKey: "perimeter.analysis.mostVulnerable",
  },
  {
    id: "perimeter_24_7_gate",
    sectionId: "perimeter",
    kind: "textarea",
    label: "Which gate requires 24/7 guarding?",
    recommendation: "Assign senior guard or supervisor at high-throughput or high-value gates.",
    payloadKey: "perimeter.analysis.gate24_7",
  },
  {
    id: "perimeter_tailgating",
    sectionId: "perimeter",
    kind: "textarea",
    label: "Is tailgating possible?",
    recommendation: "Use turnstiles, airlocks, or manned doors where tailgating is likely.",
    payloadKey: "perimeter.analysis.tailgating",
  },
  {
    id: "perimeter_blind_spots",
    sectionId: "perimeter",
    kind: "textarea",
    label: "Are there blind spots?",
    recommendation: "Add cameras or patrol checkpoints to cover blind spots.",
    payloadKey: "perimeter.analysis.blindSpots",
  },
  {
    id: "cctv_checklist",
    sectionId: "cctv",
    kind: "multi_select",
    label: "CCTV & electronic security checklist",
    options: CCTV_CHECKLIST,
    recommendation: "Verify recording retention meets policy and incident investigation needs.",
    payloadKey: "cctv.checklist",
  },
  {
    id: "cctv_blind_spots",
    sectionId: "cctv",
    kind: "textarea",
    label: "CCTV blind spots",
    recommendation: "Reposition cameras or add units; document blind spots on site plan.",
    payloadKey: "cctv.analysis.blindSpots",
  },
  {
    id: "cctv_obstructions",
    sectionId: "cctv",
    kind: "textarea",
    label: "Camera obstructions",
    recommendation: "Trim vegetation and relocate obstructed cameras.",
    payloadKey: "cctv.analysis.obstructions",
  },
  {
    id: "cctv_nonfunctional",
    sectionId: "cctv",
    kind: "textarea",
    label: "Non-functional devices",
    recommendation: "Log faults and set SLA for repairs; use temporary patrol until fixed.",
    payloadKey: "cctv.analysis.nonFunctional",
  },
  {
    id: "cctv_monitoring_delay",
    sectionId: "cctv",
    kind: "textarea",
    label: "Delay in monitoring response",
    recommendation: "Define alarm response times and escalation to supervisor/control room.",
    payloadKey: "cctv.analysis.monitoringDelay",
  },
  {
    id: "emergency_checklist",
    sectionId: "emergency",
    kind: "multi_select",
    label: "Emergency preparedness checklist",
    options: EMERGENCY_CHECKLIST,
    recommendation: "Test alarms and evacuation routes quarterly with guards participating.",
    payloadKey: "emergency.checklist",
  },
  {
    id: "emergency_response_time",
    sectionId: "emergency",
    kind: "textarea",
    label: "Emergency response time assessment",
    recommendation: "Measure time to notify supervisor and emergency services; document in SOP.",
    payloadKey: "emergency.assessment.responseTime",
  },
  {
    id: "emergency_guard_knowledge",
    sectionId: "emergency",
    kind: "textarea",
    label: "Guard knowledge during emergencies",
    recommendation: "Conduct drills; post assembly point maps at guard posts.",
    payloadKey: "emergency.assessment.guardKnowledge",
  },
  {
    id: "emergency_communication",
    sectionId: "emergency",
    kind: "textarea",
    label: "Communication efficiency",
    recommendation: "Ensure radios/phones work in basements and parking; backup comms plan.",
    payloadKey: "emergency.assessment.communication",
  },
  {
    id: "deployment_critical",
    sectionId: "deployment",
    kind: "multi_select",
    label: "Identify critical areas",
    options: CRITICAL_AREAS,
    recommendation: "Critical areas need permanent guards and higher supervision.",
    payloadKey: "deployment.criticalAreas",
  },
  {
    id: "deployment_matrix",
    sectionId: "deployment",
    kind: "deployment_matrix",
    label: "Risk level & deployment plan",
    recommendation:
      "High risk: dedicated guards + supervisor. Medium: static + patrol. Low: patrol guard.",
    payloadKey: "deployment.matrix",
  },
  {
    id: "deployment_traffic",
    sectionId: "deployment",
    kind: "textarea",
    label: "Traffic flow analysis",
    recommendation: "More movement = more security presence; staff peak gates and deliveries.",
    payloadKey: "deployment.trafficFlow",
  },
  {
    id: "deployment_shifts",
    sectionId: "deployment",
    kind: "textarea",
    label: "Operational hours (day vs night focus)",
    recommendation: "Day: visitors and access control. Night: patrol and perimeter monitoring.",
    payloadKey: "deployment.shiftFocus",
  },
  {
    id: "deployment_patrol",
    sectionId: "deployment",
    kind: "textarea",
    label: "Patrol planning",
    recommendation: "Cover staircases, roof, basement, mechanical rooms, fire exits; set intervals.",
    payloadKey: "deployment.patrolPlanning",
  },
  {
    id: "manpower_site_size",
    sectionId: "manpower",
    kind: "text",
    label: "Site size factor",
    recommendation: "Larger area increases patrol time and post count.",
    payloadKey: "manpower.siteSize",
  },
  {
    id: "manpower_access_points",
    sectionId: "manpower",
    kind: "text",
    label: "Number of access points",
    recommendation: "Each access point may require dedicated coverage or rotation.",
    payloadKey: "manpower.accessPoints",
  },
  {
    id: "manpower_risk",
    sectionId: "manpower",
    kind: "text",
    label: "Risk level",
    recommendation: "Align headcount with threat assessment and asset value.",
    payloadKey: "manpower.riskLevel",
  },
  {
    id: "manpower_client_reqs",
    sectionId: "manpower",
    kind: "text",
    label: "Client requirements",
    recommendation: "Document contractual SLAs for posts and response times.",
    payloadKey: "manpower.clientRequirements",
  },
  {
    id: "manpower_regulations",
    sectionId: "manpower",
    kind: "text",
    label: "Local regulations",
    recommendation: "Verify licensing and minimum staffing rules for your jurisdiction.",
    payloadKey: "manpower.regulations",
  },
  {
    id: "manpower_crowd",
    sectionId: "manpower",
    kind: "text",
    label: "Crowd volume",
    recommendation: "Events and peak hours may need temporary reinforcement.",
    payloadKey: "manpower.crowdVolume",
  },
  {
    id: "manpower_patrol_freq",
    sectionId: "manpower",
    kind: "text",
    label: "Required patrol frequency",
    recommendation: "Electronic patrol tags help prove interval compliance.",
    payloadKey: "manpower.patrolFrequency",
  },
  {
    id: "manpower_emergency",
    sectionId: "manpower",
    kind: "text",
    label: "Emergency response capability",
    recommendation: "Reserve capacity for simultaneous incident and normal coverage.",
    payloadKey: "manpower.emergencyCapability",
  },
  {
    id: "weaknesses_selected",
    sectionId: "weaknesses",
    kind: "multi_select",
    label: "Security weaknesses identified",
    options: WEAKNESSES,
    recommendation: "Link each weakness to a corrective action in recommendations.",
    payloadKey: "weaknesses.selected",
  },
  {
    id: "recommendations_actions",
    sectionId: "close",
    kind: "multi_select",
    label: "Recommended actions",
    options: RECOMMENDATION_ACTIONS,
    recommendation: "Prioritise quick wins (lighting, signage) alongside structural changes.",
    payloadKey: "recommendations.selected",
  },
  {
    id: "recommendations_notes",
    sectionId: "close",
    kind: "textarea",
    label: "Additional recommendation notes",
    recommendation: "Be specific: location, owner, target date, and estimated cost if known.",
    payloadKey: "recommendations.customNotes",
  },
  {
    id: "final_what_wrong",
    sectionId: "close",
    kind: "textarea",
    label: "What can go wrong?",
    recommendation: "Use RISK = THREAT × VULNERABILITY × IMPACT to prioritise.",
    payloadKey: "finalObjectives.whatCanGoWrong",
  },
  {
    id: "final_likelihood",
    sectionId: "close",
    kind: "textarea",
    label: "How likely is it to happen?",
    recommendation: "Rate likelihood and impact to justify guard numbers to the client.",
    payloadKey: "finalObjectives.likelihood",
  },
  {
    id: "final_guards_needed",
    sectionId: "close",
    kind: "textarea",
    label: "How many guards are actually needed?",
    recommendation: "Summarise posts by shift using the deployment matrix.",
    payloadKey: "finalObjectives.guardsNeeded",
  },
  {
    id: "final_biggest_weakness",
    sectionId: "close",
    kind: "textarea",
    label: "What is the biggest security weakness?",
    recommendation: "Focus client budget on the single highest-risk gap first.",
    payloadKey: "finalObjectives.biggestWeakness",
  },
  {
    id: "final_immediate_actions",
    sectionId: "close",
    kind: "textarea",
    label: "What immediate actions are required?",
    recommendation: "List actions for the next 24–72 hours separately from long-term projects.",
    payloadKey: "finalObjectives.immediateActions",
  },
  {
    id: "final_supervisor",
    sectionId: "close",
    kind: "textarea",
    label: "What supervision structure is recommended?",
    recommendation: "High-risk sites typically need a site supervisor plus shift handover reports.",
    payloadKey: "finalObjectives.supervisionStructure",
  },
  {
    id: "final_reporting",
    sectionId: "close",
    kind: "textarea",
    label: "How should reporting and improvement work?",
    recommendation: "Define daily logs, incident escalation, and monthly client review meetings.",
    payloadKey: "finalObjectives.reportingImprovement",
  },
];

export function getPayloadValue(payload: Record<string, unknown>, key: string): unknown {
  if (key === "_intro") return null;
  const parts = key.split(".");
  let cur: unknown = payload;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function formatPayloadValue(value: unknown, step?: SurveyStepDef): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    const opts = step?.options ?? [];
    return value
      .map((v) => opts.find((o) => o.value === v)?.label ?? String(v))
      .join(", ");
  }
  if (typeof value === "object") {
    const rows = value as { area?: string; riskLevel?: string; deployment?: string }[];
    if (Array.isArray(rows) || (value as { length?: number }).length !== undefined) {
      const list = value as { area?: string; riskLevel?: string; deployment?: string }[];
      return list
        .map((r) => `${r.area ?? "?"} | ${r.riskLevel ?? "?"} | ${r.deployment ?? "?"}`)
        .join("\n");
    }
    return JSON.stringify(value, null, 2);
  }
  const opts = step?.options ?? [];
  const match = opts.find((o) => o.value === value);
  return match?.label ?? String(value);
}

export function stepsForSection(sectionId: string): SurveyStepDef[] {
  return SITE_SURVEY_STEPS.filter((s) => s.sectionId === sectionId);
}

export function emptySurveyPayload(): Record<string, unknown> {
  return {
    schemaVersion: SURVEY_SCHEMA_VERSION,
    general: {},
    threats: { external: [], internal: [], safety: [] },
    accessControl: {},
    perimeter: { checklist: [], analysis: {} },
    cctv: { checklist: [], analysis: {} },
    emergency: { checklist: [], assessment: {} },
    deployment: { criticalAreas: [], matrix: [], trafficFlow: "", shiftFocus: "", patrolPlanning: "" },
    manpower: {},
    weaknesses: { selected: [] },
    recommendations: { selected: [], customNotes: "" },
    finalObjectives: {},
    photoUrls: {} as Record<string, string[]>,
    guardRecommendations: {} as Record<string, string>,
  };
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
