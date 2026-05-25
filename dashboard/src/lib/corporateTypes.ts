/** Shapes returned by Django corporate serializers (camelCase fields). */

export type SiteSurveyReview = {
  summary?: string;
  actions?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
};

export type SiteSurveyPhoto = {
  id: number;
  sectionId: string;
  fieldId?: string;
  url: string;
  createdAt: string;
};

export type SiteSecuritySurveyRow = {
  id: number;
  siteId: string;
  siteName?: string;
  status: "draft" | "submitted" | string;
  payload: Record<string, unknown>;
  review?: SiteSurveyReview;
  photos?: SiteSurveyPhoto[];
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  createdById: number | null;
  createdByName?: string;
};

export type PhysicalComplianceTemplateRow = {
  id: number;
  title: string;
  version: number;
  schemaJson: Record<string, unknown>;
  isBuiltin: boolean;
  clientId: number | null;
  createdAt: string;
};

export type ComplianceRequirementSchema = {
  id: string;
  label: string;
  evidenceHint?: string;
  maxPoints?: number;
};

export type ComplianceSectionSchema = {
  id: string;
  title: string;
  maxScore: number;
  requirements: ComplianceRequirementSchema[];
};

export type ComplianceSchemaJson = {
  version?: number;
  meta?: { maxScore?: number; title?: string };
  header?: {
    fields?: {
      id: string;
      label: string;
      type: string;
      required?: boolean;
      options?: { id: string; label: string }[];
    }[];
  };
  sections?: ComplianceSectionSchema[];
  signOff?: { roles?: { id: string; label: string }[] };
};

export type ComplianceReviewProgress = {
  requirementsTotal: number;
  qaScored: number;
  qaComplete: boolean;
  mismatchCount: number;
  remarkRequiredPending: number;
};

export type PhysicalComplianceAuditRunRow = {
  id: number;
  siteId: string;
  siteName?: string;
  templateId: number;
  templateTitle?: string;
  status: "draft" | "submitted" | "validated" | "completed" | string;
  answersJson: Record<string, unknown>;
  summaryJson: Record<string, unknown>;
  reviewJson?: Record<string, unknown>;
  validatedSummaryJson?: Record<string, unknown>;
  startedAt: string;
  submittedAt?: string | null;
  completedAt: string | null;
  validatedAt?: string | null;
  revisitAt?: string | null;
  createdById: number | null;
  validatedById?: number | null;
  validatedByEmail?: string | null;
  reviewProgress?: ComplianceReviewProgress;
  schema?: ComplianceSchemaJson;
  attachments?: { id: number; requirementId?: string; description?: string; url?: string }[];
};

export type ComplianceAuditsSummary = {
  statusCounts: Record<string, number>;
  overdueRevisits: number;
  qaAdjustedAudits?: number;
  bySite: {
    siteId: string;
    siteName: string;
    auditCount: number;
    latestPercent: number | null;
    latestStatus: string | null;
  }[];
  totalAudits: number;
};

export type OrgComplianceSettings = {
  organizationDisplayName: string;
  centralSecurityEmail: string;
  ticketingSystemUrl: string;
  updatedAt?: string | null;
};

export type TrainingModuleMeta = {
  passingScore?: number;
  estimatedMinutes?: number;
  certValidityMonths?: number;
};

export type TrainingModuleRow = {
  id: number;
  title: string;
  summary: string;
  bodyMd?: string;
  moduleType?: string;
  durationMinutes: number;
  tags: string[];
  sortOrder: number;
  isActive: boolean;
  isBuiltin?: boolean;
  meta?: TrainingModuleMeta;
  createdAt: string;
};

export type TrainingKnowledgeCheck = {
  question: string;
  options: { id: string; label: string }[];
  correctOptionId: string;
};

export type TrainingSection = {
  id: string;
  title: string;
  contentMd: string;
  takeaways: string[];
  knowledgeCheck?: TrainingKnowledgeCheck;
};

export type TrainingModuleDetail = {
  id: number;
  title: string;
  summary: string;
  moduleType: string;
  durationMinutes: number;
  content: {
    version?: number;
    meta?: TrainingModuleMeta & { title?: string; moduleVersion?: string };
    sections: TrainingSection[];
    finalAssessment?: { passingScore?: number; questions?: TrainingKnowledgeCheck[] };
  };
  progress: TrainingProgressDetail;
  passingScore: number;
};

export type TrainingProgressDetail = {
  id?: number;
  moduleId: number;
  status: string;
  sectionProgress: Record<string, { completedAt?: string }>;
  sectionsCompleted: number;
  sectionsTotal: number;
  progressPercent: number;
  quizScore: number | null;
  quizAttempts: number;
  lastAttemptAt: string | null;
  completedAt: string | null;
  certifiedAt: string | null;
  certExpiresAt: string | null;
};

export type TrainingProgressRow = TrainingProgressDetail;

export type TrainingTeamSummary = {
  totalGuards: number;
  passedCount: number;
  passedPercent: number;
  expiringWithin30Days: number;
  inProgressCount: number;
};

export type TrainingTeamGuardRow = {
  guardId: string;
  name: string;
  email: string;
  siteId: string | null;
  siteName: string | null;
  status: string;
  progressPercent: number;
  quizScore: number | null;
  certifiedAt: string | null;
  certExpiresAt: string | null;
  moduleId: number | null;
};

export type TrainingTeamResponse = {
  summary: TrainingTeamSummary;
  guards: TrainingTeamGuardRow[];
  primaryModuleId: number | null;
};

export type OrgTrainingSettings = {
  organizationDisplayName: string;
  centralSecurityEmail: string;
  ticketingSystemUrl: string;
  anonymousHotline: string;
  dataRetentionDays: number;
  legislationReference: string;
};

export type TrainingQuizQuestion = {
  id: string;
  question: string;
  options: { id: string; label: string }[];
};

export type TrainingQuizStartResponse = {
  moduleId: number;
  passingScore: number;
  questions: TrainingQuizQuestion[];
};

export type TrainingQuizSubmitResponse = {
  passed: boolean;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passingScore: number;
  progress: TrainingProgressDetail;
};

export type VisitorSessionReportRow = {
  id: number;
  checkoutCode: string;
  siteId: string;
  siteName: string;
  createdAt: string;
  checkedOutAt: string | null;
  sourceIn: string;
};

export type VisitorSessionsReportResponse = {
  from: string;
  to: string;
  sessions: VisitorSessionReportRow[];
};

export type DashboardSummaryResponse = {
  guardsOnDuty: number;
  activeSites: number;
  alerts: string;
};
