import { EvidenceGallery, FieldScorePill } from "@/components/compliance/ComplianceAuditParts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { scoreTone } from "@/lib/complianceAuditDisplay";
import type { ComplianceSectionSchema } from "@/lib/corporateTypes";
import { cn } from "@/lib/utils";
import { AlertTriangle, Camera, ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";

export type ReqCell = {
  score?: number;
  managerComments?: string;
  evidenceProvided?: boolean;
  attachmentIds?: number[];
};

export type ReqReview = {
  score?: number;
  qaRemark?: string;
  auditorRecommendations?: string;
  closeOutDate?: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

/** Standard PSCA 0–2 scale (matches mobile + template). */
export function AuditScoreLegend({ className }: { className?: string }) {
  const items = [
    { score: 0, label: "Does not meet standard" },
    { score: 1, label: "Partially meets" },
    { score: 2, label: "Meets standard" },
  ] as const;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card px-4 py-3 text-xs",
        className,
      )}
    >
      <span className="font-semibold text-foreground">Scoring (each control)</span>
      {items.map((item) => (
        <span key={item.score} className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className={cn(
              "inline-flex h-6 w-6 items-center justify-center rounded font-bold tabular-nums",
              scoreTone(item.score),
            )}
          >
            {item.score}
          </span>
          {item.label}
        </span>
      ))}
      <span className="text-muted-foreground border-l pl-4 ml-auto hidden sm:inline">
        Field score (guard) · QA score (official, counts for final %)
      </span>
    </div>
  );
}

export function AuditorScorePicker({
  value,
  onChange,
  disabled,
}: {
  value: number | undefined;
  onChange: (score: number) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-lg border bg-muted/30 p-0.5",
        disabled && "opacity-50 pointer-events-none",
      )}
      role="group"
      aria-label="QA score"
    >
      {([0, 1, 2] as const).map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onChange(s)}
          className={cn(
            "min-w-[2.5rem] rounded-md px-2.5 py-1.5 text-sm font-bold tabular-nums transition",
            value === s
              ? cn(scoreTone(s), "shadow-sm")
              : "text-muted-foreground hover:bg-background",
          )}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function sectionTotals(
  section: ComplianceSectionSchema,
  answers: Record<string, unknown>,
  reviewReqs: Record<string, ReqReview>,
  fieldScoreFn: (a: Record<string, unknown>, id: string) => number | null,
) {
  let fieldPts = 0;
  let auditorPts = 0;
  let max = 0;
  let fieldScored = 0;
  let auditorScored = 0;
  for (const req of section.requirements) {
    const pts = req.maxPoints ?? 2;
    max += pts;
    const fs = fieldScoreFn(answers, req.id);
    if (fs !== null) {
      fieldPts += fs;
      fieldScored++;
    }
    const aud = reviewReqs[req.id]?.score;
    if (typeof aud === "number") {
      auditorPts += aud;
      auditorScored++;
    }
  }
  return { fieldPts, auditorPts, max, fieldScored, auditorScored, total: section.requirements.length };
}

function pointsLabel(score: number | null, maxPts: number): string {
  if (score === null) return "—";
  return `${score}/${maxPts}`;
}

export function AuditSectionScorecard({
  section,
  answers,
  reviewReqs,
  attachmentsByReq,
  locked,
  canEditAuditor,
  onUpdateReview,
  onCopyFieldToAuditor,
  fieldScoreFn,
  reqCellFn,
  showDisagreementsOnly = false,
}: {
  section: ComplianceSectionSchema;
  answers: Record<string, unknown>;
  reviewReqs: Record<string, ReqReview>;
  attachmentsByReq: Map<string, { id: number; url?: string; description?: string }[]>;
  locked: boolean;
  canEditAuditor: boolean;
  onUpdateReview: (reqId: string, patch: Partial<ReqReview>) => void;
  onCopyFieldToAuditor?: () => void;
  fieldScoreFn: (a: Record<string, unknown>, id: string) => number | null;
  reqCellFn: (a: Record<string, unknown>, id: string) => ReqCell;
  showDisagreementsOnly?: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totals = sectionTotals(section, answers, reviewReqs, fieldScoreFn);

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 border-b bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{section.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totals.total} controls · Field {totals.fieldScored}/{totals.total} scored
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Field pts</p>
            <p className="font-bold tabular-nums">
              {totals.fieldPts}/{totals.max}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wide text-primary">QA pts</p>
            <p className="font-bold tabular-nums text-primary">
              {totals.auditorPts}/{totals.max}
            </p>
          </div>
          {canEditAuditor && onCopyFieldToAuditor && (
            <Button type="button" variant="outline" size="sm" onClick={onCopyFieldToAuditor}>
              Copy field → QA
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm border-collapse">
          <thead>
            <tr className="border-b bg-muted/20 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="w-10 px-2 py-2" />
              <th className="w-14 px-2 py-2">ID</th>
              <th className="min-w-[200px] px-3 py-2">Control</th>
              <th className="w-24 px-2 py-2 text-center">Field pts</th>
              <th className="w-36 px-2 py-2 text-center">QA score</th>
              <th className="w-16 px-2 py-2 text-center">Evid.</th>
            </tr>
          </thead>
          <tbody>
            {section.requirements.map((req) => {
              const fs = fieldScoreFn(answers, req.id);
              const cell = reqCellFn(answers, req.id);
              const rev = reviewReqs[req.id] ?? {};
              const aud = rev.score;
              const maxPts = req.maxPoints ?? 2;
              const photos = attachmentsByReq.get(req.id) ?? [];
              const mismatch =
                fs !== null && typeof aud === "number" && fs !== aud;
              const isOpen = expanded.has(req.id);
              const audValue = typeof aud === "number" ? aud : undefined;
              const needsRemark =
                mismatch &&
                !(rev.qaRemark?.trim() || rev.auditorRecommendations?.trim());

              if (showDisagreementsOnly && !mismatch) return null;

              return (
                <Fragment key={req.id}>
                  <tr
                    className={cn(
                      "border-b hover:bg-muted/20",
                      mismatch && "bg-amber-500/5",
                      isOpen && "bg-muted/10",
                    )}
                  >
                    <td className="px-2 py-2 align-middle">
                      <button
                        type="button"
                        className="rounded p-1 hover:bg-muted"
                        onClick={() => toggleRow(req.id)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-2 py-2 font-mono text-xs text-muted-foreground align-middle">
                      {req.id}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <p className="font-medium leading-snug line-clamp-2">{req.label}</p>
                    </td>
                    <td className="px-2 py-2 text-center align-middle">
                      <div className="flex flex-col items-center gap-0.5">
                        <FieldScorePill score={fs} />
                        <span className="text-[10px] tabular-nums text-muted-foreground">
                          {pointsLabel(fs, maxPts)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center align-middle">
                      <div className="flex flex-col items-center gap-0.5">
                        {canEditAuditor ? (
                          <AuditorScorePicker
                            value={audValue}
                            onChange={(s) => onUpdateReview(req.id, { score: s })}
                          />
                        ) : locked && typeof audValue === "number" ? (
                          <FieldScorePill score={audValue} />
                        ) : (
                          <AuditorScorePicker
                            value={audValue}
                            disabled
                            onChange={() => {}}
                          />
                        )}
                        <span className="text-[10px] tabular-nums text-primary font-medium">
                          {pointsLabel(audValue ?? null, maxPts)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => toggleRow(req.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                          photos.length > 0
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground",
                        )}
                      >
                        <Camera className="h-3.5 w-3.5" />
                        {photos.length || (cell.evidenceProvided ? "Y" : "—")}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr key={`${req.id}-detail`} className="border-b bg-muted/5">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-3">
                            {mismatch && (
                              <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Field {fs}/{maxPts} vs QA {aud}/{maxPts} — add a QA remark
                                explaining the official score.
                              </p>
                            )}
                            {req.evidenceHint && (
                              <p className="text-xs text-muted-foreground">{req.evidenceHint}</p>
                            )}
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                Manager comments (field)
                              </p>
                              <p className="text-sm rounded-md border bg-background px-3 py-2">
                                {cell.managerComments?.trim() || "—"}
                              </p>
                            </div>
                            <EvidenceGallery attachments={photos} compact />
                          </div>
                          {!locked && canEditAuditor && (
                            <div className="space-y-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                              <p className="text-xs font-semibold uppercase text-primary">
                                QA findings (official)
                              </p>
                              <div className="space-y-1.5">
                                <Label className={needsRemark ? "text-amber-700 dark:text-amber-400" : ""}>
                                  QA remark{needsRemark ? " (required — scores differ)" : ""}
                                </Label>
                                <Textarea
                                  rows={2}
                                  className={cn(
                                    "bg-background resize-y",
                                    needsRemark && "border-amber-500/50",
                                  )}
                                  placeholder="Why this QA score vs the guard's field score…"
                                  value={rev.qaRemark ?? ""}
                                  onChange={(e) =>
                                    onUpdateReview(req.id, { qaRemark: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label>Close-out date</Label>
                                <Input
                                  type="date"
                                  value={rev.closeOutDate ?? ""}
                                  onChange={(e) =>
                                    onUpdateReview(req.id, { closeOutDate: e.target.value })
                                  }
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label>Corrective actions (optional)</Label>
                                <Textarea
                                  rows={3}
                                  className="bg-background resize-y"
                                  value={rev.auditorRecommendations ?? ""}
                                  onChange={(e) =>
                                    onUpdateReview(req.id, {
                                      auditorRecommendations: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          )}
                          {locked && (rev.qaRemark || rev.auditorRecommendations) && (
                            <div className="space-y-2">
                              {rev.qaRemark && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">QA remark</p>
                                  <p className="text-sm mt-1">{rev.qaRemark}</p>
                                </div>
                              )}
                              {rev.auditorRecommendations && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">
                                    Corrective actions
                                  </p>
                                  <p className="text-sm mt-1">{rev.auditorRecommendations}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
