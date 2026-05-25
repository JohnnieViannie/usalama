import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  AuditScoreLegend,
  AuditSectionScorecard,
  type ReqCell,
  type ReqReview,
} from "@/components/compliance/AuditScoringMatrix";
import {
  AuditStatusBadge,
  CollapsibleBlock,
  InfoGrid,
  SectionNav,
} from "@/components/compliance/ComplianceAuditParts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auditPercent, auditTimelineLabel } from "@/lib/complianceAuditDisplay";
import {
  collectClientReviewIssues,
  computeLocalReviewProgress,
  fieldPercentFromAnswers,
  fieldScore,
  listChangedControls,
} from "@/lib/complianceQaReview";
import {
  downloadComplianceAuditReport,
  getComplianceAudit,
  patchComplianceAudit,
} from "@/lib/corporateApi";
import type {
  ComplianceSchemaJson,
  PhysicalComplianceAuditRunRow,
} from "@/lib/corporateTypes";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileDown,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

function reqCell(answers: Record<string, unknown>, reqId: string): ReqCell {
  const reqs = answers.requirements as Record<string, ReqCell> | undefined;
  return reqs?.[reqId] ?? {};
}

function formatHeaderValue(
  schema: ComplianceSchemaJson | undefined,
  fieldId: string,
  value: unknown,
): string {
  if (value == null || value === "") return "—";
  const f = schema?.header?.fields?.find((x) => x.id === fieldId);
  if (f?.type === "select" && f.options?.length) {
    const match = f.options.find((o) => o.id === value);
    return match?.label ?? String(value);
  }
  return String(value);
}

function buildReviewFromAudit(audit: PhysicalComplianceAuditRunRow): Record<string, ReqReview> {
  const existing = (audit.reviewJson?.requirements ?? {}) as Record<string, ReqReview>;
  return { ...existing };
}

function computePreviewSummary(
  schema: PhysicalComplianceAuditRunRow["schema"],
  reviewReqs: Record<string, ReqReview>,
) {
  if (!schema?.sections)
    return {
      totalPercent: 0,
      months: 12,
      rows: [] as { title: string; achieved: number; max: number }[],
    };
  let totalMax = 0;
  let totalAchieved = 0;
  const rows: { title: string; achieved: number; max: number }[] = [];
  for (const sec of schema.sections) {
    let achieved = 0;
    const max = sec.maxScore;
    for (const req of sec.requirements) {
      const pts = req.maxPoints ?? 2;
      totalMax += pts;
      const s = reviewReqs[req.id]?.score;
      if (typeof s === "number") {
        achieved += s;
        totalAchieved += s;
      }
    }
    rows.push({ title: sec.title, achieved, max });
  }
  const totalPercent = totalMax > 0 ? Math.round((totalAchieved / totalMax) * 1000) / 10 : 0;
  let months = 12;
  if (totalPercent <= 50) months = 3;
  else if (totalPercent <= 70) months = 6;
  else if (totalPercent <= 90) months = 9;
  return { totalPercent, months, rows };
}

export default function CorporateComplianceAuditReview() {
  const { auditId } = useParams<{ auditId: string }>();
  const navigate = useNavigate();
  const id = Number(auditId);
  const [audit, setAudit] = useState<PhysicalComplianceAuditRunRow | null>(null);
  const [reviewReqs, setReviewReqs] = useState<Record<string, ReqReview>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [showDisagreementsOnly, setShowDisagreementsOnly] = useState(false);
  const [validateOpen, setValidateOpen] = useState(false);
  const [reporting, setReporting] = useState(false);

  const attachmentsByReq = useMemo(() => {
    const map = new Map<string, { id: number; url?: string; description?: string }[]>();
    for (const att of audit?.attachments ?? []) {
      const rid = att.requirementId?.trim();
      if (!rid) continue;
      const list = map.get(rid) ?? [];
      list.push(att);
      map.set(rid, list);
    }
    return map;
  }, [audit?.attachments]);

  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) return;
    setLoading(true);
    try {
      const row = await getComplianceAudit(id);
      setAudit(row);
      setReviewReqs(buildReviewFromAudit(row));
      const first = row.schema?.sections?.[0]?.id;
      if (first) setActiveSectionId(first);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load audit");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const preview = useMemo(
    () => computePreviewSummary(audit?.schema, reviewReqs),
    [audit?.schema, reviewReqs],
  );

  const answers = audit?.answersJson ?? {};

  const qaProgress = useMemo(
    () =>
      computeLocalReviewProgress(audit?.schema, reviewReqs, answers),
    [audit?.schema, reviewReqs, answers],
  );

  const fieldPctPreview = useMemo(
    () => fieldPercentFromAnswers(audit?.schema, answers),
    [audit?.schema, answers],
  );

  const changedControls = useMemo(
    () => listChangedControls(audit?.schema, reviewReqs, answers),
    [audit?.schema, reviewReqs, answers],
  );

  const reviewIssues = useMemo(
    () => collectClientReviewIssues(audit?.schema, reviewReqs, answers),
    [audit?.schema, reviewReqs, answers],
  );

  const canValidate =
    qaProgress.qaComplete && qaProgress.remarkRequiredPending === 0 && reviewIssues.length === 0;

  const sectionProgress = useMemo(() => {
    const answers = audit?.answersJson ?? {};
    const out: Record<string, { done: number; total: number }> = {};
    for (const sec of audit?.schema?.sections ?? []) {
      let done = 0;
      for (const req of sec.requirements) {
        if (fieldScore(answers, req.id) !== null) done++;
      }
      out[sec.id] = { done, total: sec.requirements.length };
    }
    return out;
  }, [audit]);

  const auditorProgress = useMemo(() => {
    const out: Record<string, { done: number; total: number }> = {};
    for (const sec of audit?.schema?.sections ?? []) {
      let done = 0;
      for (const req of sec.requirements) {
        if (reviewReqs[req.id]?.score !== undefined) done++;
      }
      out[sec.id] = { done, total: sec.requirements.length };
    }
    return out;
  }, [audit?.schema?.sections, reviewReqs]);

  const copyFieldScoresToAuditor = (sectionId: string) => {
    if (!audit?.schema?.sections) return;
    const sec = audit.schema.sections.find((s) => s.id === sectionId);
    if (!sec) return;
    const answers = audit.answersJson ?? {};
    setReviewReqs((prev) => {
      const next = { ...prev };
      for (const req of sec.requirements) {
        const fs = fieldScore(answers, req.id);
        if (fs !== null) next[req.id] = { ...next[req.id], score: fs };
      }
      return next;
    });
    toast.success(
      "Field scores copied to QA column — review each line and confirm official scores.",
    );
  };

  const updateReq = (reqId: string, patch: Partial<ReqReview>) => {
    setReviewReqs((prev) => ({
      ...prev,
      [reqId]: { ...prev[reqId], ...patch },
    }));
  };

  const saveReview = async () => {
    if (!audit) return;
    setSaving(true);
    try {
      const updated = await patchComplianceAudit(audit.id, {
        reviewJson: { requirements: reviewReqs },
      });
      setAudit(updated);
      toast.success("Review saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const validateAudit = async () => {
    if (!audit) return;
    if (!canValidate) {
      toast.error(reviewIssues[0] ?? "Complete QA on every control before validating");
      return;
    }
    setSaving(true);
    try {
      await patchComplianceAudit(audit.id, {
        reviewJson: { requirements: reviewReqs },
        status: "validated",
      });
      toast.success("Audit validated and locked");
      setValidateOpen(false);
      navigate("/corporate/compliance-audits");
    } catch (e) {
      const err = e as Error & { issues?: string[] };
      const msg = err.issues?.length
        ? `${err.message}: ${err.issues.slice(0, 3).join("; ")}`
        : err instanceof Error
          ? err.message
          : "Validation failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const downloadReport = async () => {
    if (!audit) return;
    setReporting(true);
    try {
      await downloadComplianceAuditReport(audit.id);
      toast.success("PDF report downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Report download failed");
    } finally {
      setReporting(false);
    }
  };

  const locked = audit?.status === "validated" || audit?.status === "completed";
  const canReview = audit?.status === "submitted" && !locked;
  const summary = audit?.validatedSummaryJson ?? audit?.summaryJson ?? {};
  const header = (answers.header as Record<string, unknown>) ?? {};
  const signOff = (answers.signOff as Record<string, { name?: string; signedAt?: string }>) ?? {};
  const pct = audit ? auditPercent(audit) : null;
  const totalPhotos = audit?.attachments?.length ?? 0;
  const activeSection = audit?.schema?.sections?.find((s) => s.id === activeSectionId);

  return (
    <DashboardLayout title={`Audit #${auditId}`}>
      <div className="mx-auto max-w-7xl space-y-6 pb-24">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" size="sm" className="w-fit -ml-2" asChild>
            <Link to="/corporate/compliance-audits">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              All audits
            </Link>
          </Button>
          {(canReview || locked) && (
            <div className="flex flex-wrap gap-2">
              {locked && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void downloadReport()}
                  disabled={reporting}
                >
                  {reporting ? (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-1.5 h-4 w-4" />
                  )}
                  Download PDF report
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => void saveReview()} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                Save review
              </Button>
              <Button
                size="sm"
                onClick={() => setValidateOpen(true)}
                disabled={saving || !canValidate}
                title={
                  !canValidate
                    ? reviewIssues[0] ?? "Score every control and add remarks where scores differ"
                    : undefined
                }
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Validate & lock
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading audit…
          </div>
        ) : !audit ? (
          <div className="rounded-xl border py-16 text-center text-muted-foreground">
            Audit not found
          </div>
        ) : (
          <>
            <div className="rounded-2xl border bg-gradient-to-br from-card to-muted/30 p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                      {audit.siteName ?? audit.siteId}
                    </h1>
                    <AuditStatusBadge status={audit.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {audit.templateTitle ?? "PSCA"} · Audit #{audit.id}
                    {audit.submittedAt &&
                      ` · Submitted ${new Date(audit.submittedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Score</p>
                    <p className="text-2xl font-semibold tabular-nums">
                      {pct != null ? `${pct}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Evidence
                    </p>
                    <p className="text-2xl font-semibold tabular-nums">{totalPhotos}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Improvement window
                    </p>
                    <p className="text-lg font-semibold">{auditTimelineLabel(audit)}</p>
                  </div>
                </div>
              </div>
              {audit.status === "draft" && (
                <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
                  Still in progress on the guard&apos;s phone — data refreshes when you reload.
                </p>
              )}
              {audit.status === "submitted" && (
                <div className="mt-4 space-y-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 text-sm">
                  <p>
                    Audit-the-audit: verify each control&apos;s points against evidence, set the
                    official QA score (0–2), and add a remark when you change the guard&apos;s field
                    score.
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>
                        QA progress: {qaProgress.qaScored}/{qaProgress.requirementsTotal} controls
                      </span>
                      {qaProgress.mismatchCount > 0 && (
                        <span className="text-amber-700 dark:text-amber-400">
                          {qaProgress.mismatchCount} disagreement
                          {qaProgress.mismatchCount !== 1 ? "s" : ""}
                          {qaProgress.remarkRequiredPending > 0 &&
                            ` · ${qaProgress.remarkRequiredPending} need remark`}
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width:
                            qaProgress.requirementsTotal > 0
                              ? `${(qaProgress.qaScored / qaProgress.requirementsTotal) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
              {locked && audit.validatedByEmail && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Validated by {audit.validatedByEmail}
                  {audit.validatedAt &&
                    ` · ${new Date(audit.validatedAt).toLocaleString()}`}
                </p>
              )}
            </div>

            <Tabs defaultValue="scorecard" className="space-y-4">
              <TabsList className="grid w-full max-w-lg grid-cols-2">
                <TabsTrigger value="scorecard" className="gap-1.5">
                  <ClipboardList className="h-4 w-4" />
                  Scorecard
                </TabsTrigger>
                <TabsTrigger value="overview" className="gap-1.5">
                  <FileText className="h-4 w-4" />
                  Overview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-0">
                <div className="grid gap-4 lg:grid-cols-2">
                  <CollapsibleBlock title="Score summary" defaultOpen>
                    <div className="space-y-2">
                      {(locked
                        ? (summary.sections as {
                            title: string;
                            scoreAchieved: number;
                            scoreRequired: number;
                          }[])
                        : preview.rows
                      ).map((r) => (
                        <div
                          key={r.title}
                          className="flex items-center justify-between text-sm border-b border-dashed py-2 last:border-0"
                        >
                          <span className="text-muted-foreground line-clamp-1 pr-2">
                            {r.title}
                          </span>
                          <span className="font-medium tabular-nums shrink-0">
                            {"scoreAchieved" in r
                              ? `${r.scoreAchieved}/${r.scoreRequired}`
                              : `${r.achieved}/${r.max}`}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 font-semibold text-sm">
                        <span>Total</span>
                        <span>
                          {locked ? summary.totalPercent : preview.totalPercent}%
                        </span>
                      </div>
                    </div>
                  </CollapsibleBlock>

                  <CollapsibleBlock title="Site & audit details" defaultOpen>
                    <InfoGrid
                      items={
                        audit.schema?.header?.fields?.map((f) => ({
                          label: f.label,
                          value: formatHeaderValue(audit.schema, f.id, header[f.id]),
                        })) ?? []
                      }
                    />
                  </CollapsibleBlock>
                </div>

                {(audit.schema?.signOff?.roles?.length ?? 0) > 0 && (
                  <CollapsibleBlock title="Sign-off" defaultOpen>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {audit.schema!.signOff!.roles!.map((role) => {
                        const entry = signOff[role.id];
                        return (
                          <div key={role.id} className="rounded-lg border bg-muted/30 p-3">
                            <p className="text-xs text-muted-foreground">{role.label}</p>
                            <p className="font-medium">{entry?.name?.trim() || "—"}</p>
                            {entry?.signedAt && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {entry.signedAt}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleBlock>
                )}
              </TabsContent>

              <TabsContent value="scorecard" className="mt-0 space-y-4">
                <AuditScoreLegend />
                {canReview && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant={showDisagreementsOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowDisagreementsOnly((v) => !v)}
                      disabled={qaProgress.mismatchCount === 0}
                    >
                      {showDisagreementsOnly ? "Show all controls" : "Disagreements only"}
                    </Button>
                    {qaProgress.mismatchCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {qaProgress.mismatchCount} field vs QA mismatch
                        {qaProgress.mismatchCount !== 1 ? "es" : ""}
                      </span>
                    )}
                  </div>
                )}
                <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                  <div className="lg:sticky lg:top-4 lg:self-start">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
                      Jump to section
                    </p>
                    <SectionNav
                      sections={
                        audit.schema?.sections?.map((s) => ({
                          id: s.id,
                          title: s.title,
                        })) ?? []
                      }
                      activeId={activeSectionId}
                      onSelect={setActiveSectionId}
                      sectionProgress={sectionProgress}
                      auditorProgress={auditorProgress}
                    />
                  </div>

                  <div className="min-w-0">
                    {activeSection ? (
                      <AuditSectionScorecard
                        section={activeSection}
                        answers={answers}
                        reviewReqs={reviewReqs}
                        attachmentsByReq={attachmentsByReq}
                        locked={locked}
                        canEditAuditor={canReview}
                        onUpdateReview={updateReq}
                        onCopyFieldToAuditor={
                          canReview
                            ? () => copyFieldScoresToAuditor(activeSection.id)
                            : undefined
                        }
                        fieldScoreFn={fieldScore}
                        reqCellFn={reqCell}
                        showDisagreementsOnly={showDisagreementsOnly}
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">Select a section</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
        <Dialog open={validateOpen} onOpenChange={setValidateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Validate audit & lock scores</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-3">
                <div>
                  <p className="text-xs text-muted-foreground">Field score (guard)</p>
                  <p className="text-xl font-semibold tabular-nums">{fieldPctPreview}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Official QA score</p>
                  <p className="text-xl font-semibold tabular-nums text-primary">
                    {preview.totalPercent}%
                  </p>
                </div>
              </div>
              <p>
                Improvement window after lock:{" "}
                <span className="font-medium">{preview.months} months</span>
              </p>
              {changedControls.length > 0 ? (
                <div>
                  <p className="font-medium mb-2">
                    {changedControls.length} control
                    {changedControls.length !== 1 ? "s" : ""} adjusted vs field
                  </p>
                  <ul className="max-h-40 overflow-y-auto space-y-1 text-xs text-muted-foreground">
                    {changedControls.slice(0, 12).map((c) => (
                      <li key={c.id}>
                        <span className="font-mono">{c.id}</span>: field {c.fieldScore} → QA{" "}
                        {c.qaScore}
                      </li>
                    ))}
                    {changedControls.length > 12 && (
                      <li>…and {changedControls.length - 12} more</li>
                    )}
                  </ul>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  All official QA scores match field scores.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setValidateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void validateAudit()} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1.5 h-4 w-4" />
                )}
                Confirm & lock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
