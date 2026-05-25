import { apiDelete, apiDownloadBlob, apiGet, apiPatch, apiPost } from "@/lib/api";

/** Use same-origin /media so Vite proxy serves files in local dev. */
export function resolveComplianceMediaUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const raw = url.trim();
  try {
    const parsed = new URL(raw, window.location.origin);
    if (parsed.pathname.startsWith("/media/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    /* relative path */
  }
  if (raw.startsWith("/media/")) return raw;
  const idx = raw.indexOf("/media/");
  if (idx >= 0) return raw.slice(idx);
  return raw;
}
import type {
  DashboardSummaryResponse,
  ComplianceAuditsSummary,
  OrgComplianceSettings,
  PhysicalComplianceAuditRunRow,
  PhysicalComplianceTemplateRow,
  SiteSecuritySurveyRow,
  SiteSurveyReview,
  OrgTrainingSettings,
  TrainingModuleDetail,
  TrainingModuleRow,
  TrainingProgressDetail,
  TrainingProgressRow,
  TrainingQuizStartResponse,
  TrainingQuizSubmitResponse,
  TrainingTeamResponse,
  VisitorSessionsReportResponse,
} from "@/lib/corporateTypes";

export async function listSiteSurveys(siteId?: string): Promise<SiteSecuritySurveyRow[]> {
  const q = siteId ? `?siteId=${encodeURIComponent(siteId)}` : "";
  return apiGet<SiteSecuritySurveyRow[]>(`/site-surveys/${q}`);
}

export async function getSiteSurvey(id: number): Promise<SiteSecuritySurveyRow> {
  return apiGet<SiteSecuritySurveyRow>(`/site-surveys/${id}/`);
}

export async function createSiteSurvey(siteId: string, payload?: Record<string, unknown>): Promise<SiteSecuritySurveyRow> {
  return apiPost<SiteSecuritySurveyRow>("/site-surveys/", { siteId, payload: payload ?? {} });
}

export async function patchSiteSurvey(
  id: number,
  body: { payload?: Record<string, unknown>; status?: string; review?: SiteSurveyReview },
): Promise<SiteSecuritySurveyRow> {
  return apiPatch<SiteSecuritySurveyRow>(`/site-surveys/${id}/`, body);
}

export async function deleteSiteSurvey(id: number): Promise<void> {
  await apiDelete<{ ok: boolean }>(`/site-surveys/${id}/`);
}

export async function listComplianceTemplates(): Promise<PhysicalComplianceTemplateRow[]> {
  return apiGet<PhysicalComplianceTemplateRow[]>("/compliance-templates/");
}

export async function createComplianceTemplate(body: {
  title: string;
  version?: number;
  schemaJson?: Record<string, unknown>;
}): Promise<PhysicalComplianceTemplateRow> {
  return apiPost<PhysicalComplianceTemplateRow>("/compliance-templates/", body);
}

export async function listComplianceAudits(siteId?: string): Promise<PhysicalComplianceAuditRunRow[]> {
  const q = siteId ? `?siteId=${encodeURIComponent(siteId)}` : "";
  return apiGet<PhysicalComplianceAuditRunRow[]>(`/compliance-audits/${q}`);
}

export async function createComplianceAudit(
  siteId: string,
  templateId: number,
): Promise<PhysicalComplianceAuditRunRow & { reusedExistingDraft?: boolean }> {
  return apiPost<PhysicalComplianceAuditRunRow & { reusedExistingDraft?: boolean }>(
    "/compliance-audits/",
    { siteId, templateId },
  );
}

export async function deleteComplianceAudit(id: number): Promise<void> {
  await apiDelete(`/compliance-audits/${id}/`);
}

export async function getComplianceAudit(id: number): Promise<PhysicalComplianceAuditRunRow> {
  return apiGet<PhysicalComplianceAuditRunRow>(`/compliance-audits/${id}/`);
}

export async function patchComplianceAudit(
  id: number,
  body: {
    answersJson?: Record<string, unknown>;
    reviewJson?: Record<string, unknown>;
    status?: string;
  },
): Promise<PhysicalComplianceAuditRunRow> {
  return apiPatch<PhysicalComplianceAuditRunRow>(`/compliance-audits/${id}/`, body);
}

export async function downloadComplianceAuditReport(id: number): Promise<void> {
  const { blob, filename } = await apiDownloadBlob(
    `/compliance-audits/${id}/report/`,
    `Physical_Security_Compliance_Audit_${id}.pdf`,
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function getComplianceAuditsSummary(): Promise<ComplianceAuditsSummary> {
  return apiGet<ComplianceAuditsSummary>("/compliance-audits/summary/");
}

export async function getCompanyComplianceSettings(): Promise<OrgComplianceSettings> {
  return apiGet<OrgComplianceSettings>("/company-compliance-settings/");
}

export async function saveCompanyComplianceSettings(
  body: OrgComplianceSettings,
): Promise<OrgComplianceSettings> {
  return apiPatch<OrgComplianceSettings>("/company-compliance-settings/", body);
}

export async function listTrainingModules(): Promise<TrainingModuleRow[]> {
  return apiGet<TrainingModuleRow[]>("/training-modules/");
}

export async function getTrainingModule(id: number): Promise<TrainingModuleDetail> {
  return apiGet<TrainingModuleDetail>(`/training-modules/${id}/`);
}

export async function listTrainingProgress(): Promise<TrainingProgressDetail[]> {
  return apiGet<TrainingProgressDetail[]>("/training-progress/");
}

export async function completeTrainingModule(moduleId: number): Promise<TrainingProgressDetail> {
  return apiPost<TrainingProgressDetail>("/training-complete/", { moduleId });
}

export async function listTrainingProgressTeam(): Promise<TrainingTeamResponse> {
  return apiGet<TrainingTeamResponse>("/training-progress/team/");
}

export async function getCompanyTrainingSettings(): Promise<OrgTrainingSettings> {
  return apiGet<OrgTrainingSettings>("/company-training-settings/");
}

export async function saveCompanyTrainingSettings(
  body: OrgTrainingSettings,
): Promise<{ ok: boolean }> {
  return apiPatch<{ ok: boolean }>("/company-training-settings/", body);
}

async function fetchCertificateHtml(path: string): Promise<string> {
  const prefix = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "/api";
  const raw = localStorage.getItem("movara_auth");
  const headers: Record<string, string> = {};
  if (raw) {
    try {
      const { token } = JSON.parse(raw) as { token?: string };
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
  }
  const res = await fetch(`${prefix}${path}`, { headers });
  if (!res.ok) throw new Error("Failed to load certificate");
  return res.text();
}

export async function fetchTrainingCertificateHtml(moduleId: number): Promise<string> {
  return fetchCertificateHtml(`/training-certificate/${moduleId}/`);
}

export async function fetchGuardTrainingCertificateHtml(
  moduleId: number,
  guardId: string,
): Promise<string> {
  return fetchCertificateHtml(`/training-certificate/${moduleId}/guard/${encodeURIComponent(guardId)}/`);
}

export async function visitorSessionsReport(params?: {
  from?: string;
  to?: string;
  siteId?: string;
}): Promise<VisitorSessionsReportResponse> {
  const sp = new URLSearchParams();
  if (params?.from) sp.set("from", params.from);
  if (params?.to) sp.set("to", params.to);
  if (params?.siteId) sp.set("siteId", params.siteId);
  const tail = sp.toString() ? `?${sp.toString()}` : "";
  return apiGet<VisitorSessionsReportResponse>(`/visitor-sessions-report/${tail}`);
}

export async function dashboardSummary(): Promise<DashboardSummaryResponse> {
  return apiGet<DashboardSummaryResponse>("/dashboard/");
}
