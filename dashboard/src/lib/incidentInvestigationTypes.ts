export type InvestigationStatus = "draft" | "in_progress" | "pending_closure" | "closed";

export type SectionKey =
  | "section_a"
  | "section_b"
  | "section_c"
  | "section_d"
  | "section_e"
  | "section_f"
  | "section_g"
  | "section_h"
  | "section_i"
  | "section_j"
  | "section_k";

export const SECTION_LABELS: Record<SectionKey, string> = {
  section_a: "A — Identification & reporting",
  section_b: "B — Preliminary assessment",
  section_c: "C — Scene preservation",
  section_d: "D — Evidence collection",
  section_e: "E — Documentation log",
  section_f: "F — Interviews",
  section_g: "G — Analysis & correlation",
  section_h: "H — Findings & conclusion",
  section_i: "I — Corrective & preventive measures",
  section_j: "J — Final report",
  section_k: "K — Sign-off & closure",
};

export const SECTION_ORDER: SectionKey[] = [
  "section_a",
  "section_b",
  "section_c",
  "section_d",
  "section_e",
  "section_f",
  "section_g",
  "section_h",
  "section_i",
  "section_j",
  "section_k",
];

export type SignatureValue = {
  signer_name?: string;
  signed_at?: string;
  data_url?: string;
};

export type InvestigationJson = {
  template_version?: string;
  section_a?: Record<string, string>;
  section_b?: Record<string, unknown>;
  section_c?: { checklist?: Array<{ item_id: string; label?: string; yes_no: string; comments: string }> };
  section_d?: {
    physical?: EvidencePhysicalRow[];
    digital?: EvidenceDigitalRow[];
    testimonial?: EvidenceTestimonialRow[];
  };
  section_e?: { documents?: Array<{ doc_type: string; label?: string; attached: string; reference: string; notes: string }> };
  section_f?: { interviews?: InterviewRow[] };
  section_g?: { analysis_rows?: Array<{ activity_id: string; activity?: string; findings: string }> };
  section_h?: Record<string, string>;
  section_i?: { measures?: MeasureRow[] };
  section_j?: Record<string, string>;
  section_k?: {
    sign_offs?: Array<{ role: string; name: string; signature?: SignatureValue; date: string }>;
    investigation_status?: string;
    date_closed?: string;
  };
  principles_acknowledged?: boolean;
  mistakes_checklist?: Record<string, boolean>;
};

export type EvidencePhysicalRow = {
  row_id: string;
  evidence_id?: string;
  description?: string;
  location_found?: string;
  collected_by?: string;
  collected_at?: string;
  custody_notes?: string;
};

export type EvidenceDigitalRow = {
  row_id: string;
  evidence_id?: string;
  description?: string;
  source?: string;
  preserved_by?: string;
  preserved_at?: string;
  hash_or_id?: string;
};

export type EvidenceTestimonialRow = {
  row_id: string;
  witness_id?: string;
  name?: string;
  role?: string;
  interview_date?: string;
  statement_summary?: string;
  recording_available?: string;
};

export type InterviewRow = {
  row_id: string;
  person_id?: string;
  name?: string;
  category?: string;
  date?: string;
  location?: string;
  interviewer?: string;
  questions_notes?: string;
  checklist?: Record<string, boolean>;
};

export type MeasureRow = {
  row_id: string;
  measure_type: string;
  action_required?: string;
  responsible_person?: string;
  deadline?: string;
  status?: string;
};

export type InvestigationAttachment = {
  id: number;
  sectionKey?: string;
  rowId?: string;
  description?: string;
  url?: string;
  createdAt?: string;
};

export type CustodyTransfer = {
  id: number;
  evidenceId?: string;
  fromName?: string;
  toName?: string;
  notes?: string;
  signatureUrl?: string;
  transferredAt?: string;
  recordedByEmail?: string;
};

export type InvestigationProgress = {
  sectionsComplete: number;
  sectionsTotal: number;
  percent: number;
  sectionStatus: Record<string, boolean>;
};

export type IncidentInvestigationRow = {
  id: number;
  incidentId: number;
  investigationNumber: string;
  status: InvestigationStatus;
  currentSection?: string;
  investigationJson: InvestigationJson;
  assignedInvestigatorEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string | null;
  createdByEmail?: string;
  closedByEmail?: string;
  progress?: InvestigationProgress;
  overdueMeasureCount?: number;
  incidentTitle?: string;
  siteName?: string;
  attachments?: InvestigationAttachment[];
  custodyTransfers?: CustodyTransfer[];
};

export type AuditLogEntry = {
  id: number;
  action: string;
  section?: string;
  detail?: string;
  userEmail?: string;
  createdAt?: string;
};
