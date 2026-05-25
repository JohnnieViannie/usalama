import { apiDelete, apiDownloadBlob, apiGet, apiPatch, apiPost, apiPrefix } from "@/lib/api";
import type { AuditLogEntry, IncidentInvestigationRow, InvestigationJson } from "@/lib/incidentInvestigationTypes";

export async function listIncidentInvestigations(params?: {
  status?: string;
  incidentId?: string;
}): Promise<IncidentInvestigationRow[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.incidentId) q.set("incidentId", params.incidentId);
  const suffix = q.toString() ? `?${q}` : "";
  return apiGet<IncidentInvestigationRow[]>(`/incident-investigations/${suffix}`);
}

export async function createIncidentInvestigation(
  incidentId: string,
  assignedInvestigatorEmail?: string,
): Promise<IncidentInvestigationRow> {
  return apiPost<IncidentInvestigationRow>("/incident-investigations/", {
    incidentId,
    assignedInvestigatorEmail,
  });
}

export async function getIncidentInvestigation(id: number): Promise<IncidentInvestigationRow> {
  return apiGet<IncidentInvestigationRow>(`/incident-investigations/${id}/`);
}

export async function patchIncidentInvestigation(
  id: number,
  body: {
    investigationJson?: InvestigationJson;
    currentSection?: string;
    status?: string;
    assignedInvestigatorEmail?: string;
  },
): Promise<IncidentInvestigationRow> {
  return apiPatch<IncidentInvestigationRow>(`/incident-investigations/${id}/`, body);
}

export async function closeIncidentInvestigation(id: number): Promise<IncidentInvestigationRow> {
  return apiPost<IncidentInvestigationRow>(`/incident-investigations/${id}/close/`, {});
}

export async function getInvestigationAuditLog(id: number): Promise<AuditLogEntry[]> {
  return apiGet<AuditLogEntry[]>(`/incident-investigations/${id}/audit-log/`);
}

export async function uploadInvestigationAttachment(
  investigationId: number,
  file: File,
  sectionKey: string,
  rowId?: string,
  description?: string,
): Promise<{ id: number; url?: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("sectionKey", sectionKey);
  if (rowId) form.append("rowId", rowId);
  if (description) form.append("description", description);

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
  const res = await fetch(`${apiPrefix}/incident-investigations/${investigationId}/attachments/`, {
    method: "POST",
    headers,
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    let detail = text;
    try {
      detail = JSON.parse(text).detail || text;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

export async function deleteInvestigationAttachment(
  investigationId: number,
  attachmentId: number,
): Promise<void> {
  await apiDelete(`/incident-investigations/${investigationId}/attachments/${attachmentId}/`);
}

export async function recordCustodyTransfer(
  investigationId: number,
  body: {
    evidenceId: string;
    fromName: string;
    toName: string;
    notes?: string;
    transferredAt?: string;
    signatureData?: string;
  },
): Promise<unknown> {
  return apiPost(`/incident-investigations/${investigationId}/custody/`, body);
}

export async function downloadInvestigationReport(id: number, defaultName: string): Promise<void> {
  const { blob, filename } = await apiDownloadBlob(
    `/incident-investigations/${id}/report/`,
    defaultName,
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
