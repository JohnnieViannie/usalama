// Shared in-memory mock data store for UsalamaHub MVP.
// Replace with Lovable Cloud queries when backend is wired.

export type GuardStatus = "active" | "inactive" | "on_duty";
export type Guard = {
  id: string;
  name: string;
  phone: string;
  status: GuardStatus;
  siteId: string | null;
  email?: string;
  companyName?: string;
  onboardingStatus?: "pending" | "approved" | "rejected";
  linkedClientId?: string | number | null;
  passportImage?: string | null;
};

export type Site = {
  id: string;
  name: string;
  location: string;
  description: string;
  siteType?: "building" | "compound" | "open_area" | "residential" | "other";
  geofenceEnabled?: boolean;
  geofenceLatitude?: number | null;
  geofenceLongitude?: number | null;
  geofenceRadiusM?: number;
};

export type VisitorQrBundle = {
  siteId: string | number;
  siteName: string;
  checkInToken: string;
  checkOutToken: string;
};

export type Checkpoint = {
  id: string;
  name: string;
  siteId: string;
  code: string; // payload encoded into the QR; print & place at the GPS you set
  locationMode?: "gps" | "indoor";
  latitude?: number | null;
  longitude?: number | null;
  verifyRadiusM?: number;
  buildingBlock?: string;
  floorLevel?: string;
  zoneLabel?: string;
};

export type Shift = {
  id: string;
  guardId: string;
  siteId: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  start: string; // HH:mm
  end: string;
  lastStartAt?: string | null;
  lastEndAt?: string | null;
};

export type PatrolLog = {
  id: string;
  guardId: string;
  checkpointId: string;
  siteId: string;
  timestamp: string; // ISO
  status: "on_time" | "missed" | "late";
  guardName?: string;
  checkpointName?: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type GuardLocationPing = {
  id: string;
  guardId: string;
  siteId: string;
  checkpointId?: string | null;
  checkpointName?: string | null;
  timestamp: string;
  latitude: number;
  longitude: number;
  source: "scan" | "background" | "shift";
  accuracy_m?: number | null;
};

export type PatrolComplianceCheckpoint = {
  checkpointId: string;
  checkpointName: string;
  siteId: string;
  scanCount: number;
  lastScanAt: string | null;
  scanned: boolean;
  verifyRadiusM?: number;
  locationMode?: "gps" | "indoor";
  buildingBlock?: string;
  floorLevel?: string;
  zoneLabel?: string;
};

export type PatrolComplianceSite = {
  siteId: string;
  siteName: string;
  totalCheckpoints: number;
  scannedCheckpoints: number;
  missedCheckpoints: number;
  coveragePct: number;
  checkpoints: PatrolComplianceCheckpoint[];
};

export type PatrolComplianceGuard = {
  guardId: string;
  guardName: string;
  scannedCheckpoints: number;
  totalCheckpoints: number;
  coveragePct: number;
};

export type PatrolCompliance = {
  overall: {
    totalCheckpoints: number;
    scannedCheckpoints: number;
    missedCheckpoints: number;
    coveragePct: number;
  };
  bySite: PatrolComplianceSite[];
  byGuard: PatrolComplianceGuard[];
};

export type PatrolEvidenceResponse = {
  patrolLogs: PatrolLog[];
  locationPings: GuardLocationPing[];
  compliance: PatrolCompliance;
};

/** Nested media URLs from guard multipart upload (Django merges into payload_json.media). */
export type IncidentPayloadMedia = {
  photos?: string[];
  video?: string;
  voice_note?: string;
  signature?: string;
  legacy_image?: string;
};

/** Structured guard report body (snake_case, matches Django payload_json). */
export type IncidentPayload = {
  client_report_id?: string;
  company_name?: string;
  site_name_manual?: string;
  classification?: string;
  classification_other?: string;
  severity?: string;
  shift_type?: string;
  what_happened?: string;
  detection_method?: string;
  time_incident_started?: string;
  exact_location?: string;
  people_involved_count?: number;
  escalation_level?: string;
  supervisor_notified?: boolean;
  police_involved?: boolean;
  emergency_services_called?: boolean;
  property_damaged?: boolean;
  estimated_value?: string;
  damage_description?: string;
  follow_up_flags?: string[];
  suspects?: unknown[];
  victims?: unknown[];
  witnesses?: unknown[];
  actions_taken?: string[];
  outcome?: string;
  follow_up_notes?: string;
  declaration_accepted?: boolean;
  media?: IncidentPayloadMedia;
  legacy?: boolean;
  [key: string]: unknown;
};

export type Incident = {
  id: string;
  guardId: string;
  siteId: string;
  title?: string;
  description: string;
  timestamp: string;
  status?: "open" | "closed";
  imageUrl?: string;
  guardName?: string;
  /** Full structured report when present (from API `payload` / payload_json). */
  payload?: IncidentPayload | null;
  classification?: string;
  severity?: string;
  shift_type?: string;
  /** Convenience list from serializer (photos + video + voice + signature URLs). */
  mediaUrls?: string[];
  policeReportedAt?: string | null;
  investigationId?: string | null;
  investigationStatus?: string | null;
  investigationNumber?: string | null;
};

export type DashboardKpis = {
  from: string;
  to: string;
  panicTotal: number;
  panicResolved: number;
  panicUnresolved: number;
  policeReports: number;
  visitorsIn: number;
  visitorsOut: number;
  visitorsOpenInside: number;
};

/** Per registration link; same shape as slice of dashboard KPIs for visitors. */
export type LinkVisitorStats = {
  from: string;
  to: string;
  visitorsIn: number;
  visitorsOut: number;
  visitorsOpenInside: number;
};

export type RegistrationFieldType = "text" | "textarea" | "email" | "phone" | "number" | "datetime";

export type RegistrationField = {
  key: string;
  label: string;
  type: RegistrationFieldType;
  required?: boolean;
};

export type RegistrationLink = {
  id: number;
  title: string;
  eventName?: string;
  siteId?: string | null;
  siteName?: string;
  token: string;
  fields: RegistrationField[];
  submissionCount?: number;
  created_at: string;
  publicUrl?: string;
};

export type RegistrationSubmission = {
  id: number;
  linkId: number;
  submittedAt: string;
  data: Record<string, string>;
};

export type Alert = {
  id: string;
  type: "panic" | "missed_checkpoint" | "late_shift";
  guardId: string;
  timestamp: string;
  status: "resolved" | "unresolved";
  guardName?: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const sites: Site[] = [
  { id: "s1", name: "Equity Bank HQ", location: "Upper Hill, Nairobi", description: "Tier-1 banking facility" },
  { id: "s2", name: "Westgate Mall", location: "Westlands, Nairobi", description: "Mixed-use retail complex" },
  { id: "s3", name: "Garden City Plaza", location: "Thika Road, Nairobi", description: "Office park" },
];

export const guards: Guard[] = [
  { id: "g1", name: "James Kamau", phone: "+254 712 345 678", status: "on_duty", siteId: "s1" },
  { id: "g2", name: "Mary Wanjiru", phone: "+254 722 111 222", status: "on_duty", siteId: "s2" },
  { id: "g3", name: "Peter Otieno", phone: "+254 733 444 555", status: "active", siteId: "s1" },
  { id: "g4", name: "Grace Akinyi", phone: "+254 701 999 888", status: "on_duty", siteId: "s3" },
  { id: "g5", name: "Samuel Kiprop", phone: "+254 720 333 444", status: "inactive", siteId: null },
];

export const checkpoints: Checkpoint[] = [
  { id: "c1", name: "Main Gate", siteId: "s1", code: "USH-c1-MAIN" },
  { id: "c2", name: "Vault Door", siteId: "s1", code: "USH-c2-VAULT" },
  { id: "c3", name: "Parking B2", siteId: "s2", code: "USH-c3-B2" },
  { id: "c4", name: "Rooftop", siteId: "s2", code: "USH-c4-ROOF" },
  { id: "c5", name: "East Entrance", siteId: "s3", code: "USH-c5-EAST" },
];

export const shifts: Shift[] = [
  { id: uid(), guardId: "g1", siteId: "s1", day: "Mon", start: "06:00", end: "18:00" },
  { id: uid(), guardId: "g2", siteId: "s2", day: "Mon", start: "18:00", end: "06:00" },
  { id: uid(), guardId: "g3", siteId: "s1", day: "Tue", start: "06:00", end: "18:00" },
  { id: uid(), guardId: "g4", siteId: "s3", day: "Wed", start: "06:00", end: "18:00" },
];

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

export const patrolLogs: PatrolLog[] = [
  { id: uid(), guardId: "g1", checkpointId: "c1", siteId: "s1", timestamp: hoursAgo(0.3), status: "on_time" },
  { id: uid(), guardId: "g1", checkpointId: "c2", siteId: "s1", timestamp: hoursAgo(1.5), status: "on_time" },
  { id: uid(), guardId: "g2", checkpointId: "c3", siteId: "s2", timestamp: hoursAgo(2), status: "late" },
  { id: uid(), guardId: "g2", checkpointId: "c4", siteId: "s2", timestamp: hoursAgo(3), status: "missed" },
  { id: uid(), guardId: "g4", checkpointId: "c5", siteId: "s3", timestamp: hoursAgo(0.8), status: "on_time" },
  { id: uid(), guardId: "g3", checkpointId: "c1", siteId: "s1", timestamp: hoursAgo(5), status: "on_time" },
];

export const incidents: Incident[] = [
  {
    id: uid(),
    guardId: "g1",
    siteId: "s1",
    description: "Suspicious vehicle parked near main gate. Plates recorded.",
    timestamp: hoursAgo(2),
    imageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
  },
  {
    id: uid(),
    guardId: "g2",
    siteId: "s2",
    description: "Broken window on B2 service door. Maintenance notified.",
    timestamp: hoursAgo(6),
    imageUrl: "https://images.unsplash.com/photo-1520637836862-4d197d17c55a?w=800",
  },
];

export const alerts: Alert[] = [
  { id: uid(), type: "panic", guardId: "g2", timestamp: hoursAgo(0.5), status: "unresolved" },
  { id: uid(), type: "missed_checkpoint", guardId: "g2", timestamp: hoursAgo(3), status: "unresolved" },
  { id: uid(), type: "late_shift", guardId: "g5", timestamp: hoursAgo(8), status: "resolved" },
];

export const findGuard = (id: string) => guards.find((g) => g.id === id);
export const findSite = (id: string | null) => (id ? sites.find((s) => s.id === id) : undefined);
export const findCheckpoint = (id: string) => checkpoints.find((c) => c.id === id);
