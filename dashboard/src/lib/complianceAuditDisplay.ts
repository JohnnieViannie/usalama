import type { PhysicalComplianceAuditRunRow } from "@/lib/corporateTypes";

export type AuditStatus = "draft" | "submitted" | "validated" | "completed" | string;

export function auditPercent(r: PhysicalComplianceAuditRunRow): number | null {
  const s = r.validatedSummaryJson?.totalPercent ?? r.summaryJson?.totalPercent;
  return typeof s === "number" ? s : null;
}

export function auditTimelineLabel(r: PhysicalComplianceAuditRunRow): string {
  const months =
    r.validatedSummaryJson?.improvementTimelineMonths ??
    (r.status !== "draft" ? r.summaryJson?.improvementTimelineMonths : undefined);
  if (months == null) return r.status === "draft" ? "Set after submit" : "—";
  const revisit = r.revisitAt ? ` · revisit ${r.revisitAt.slice(0, 10)}` : "";
  return `${months} months${revisit}`;
}

export function statusLabel(status: string): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "submitted":
      return "Awaiting review";
    case "validated":
    case "completed":
      return "Validated";
    default:
      return status;
  }
}

export function statusTone(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "submitted":
      return "default";
    case "validated":
    case "completed":
      return "secondary";
    case "draft":
      return "outline";
    default:
      return "outline";
  }
}

export function scoreTone(score: number | null): string {
  if (score === null) return "bg-muted text-muted-foreground";
  if (score >= 2) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (score === 1) return "bg-amber-500/15 text-amber-800 dark:text-amber-400";
  return "bg-red-500/15 text-red-700 dark:text-red-400";
}
