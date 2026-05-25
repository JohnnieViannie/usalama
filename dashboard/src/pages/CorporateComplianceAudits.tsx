import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { AuditStatusBadge } from "@/components/compliance/ComplianceAuditParts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet } from "@/lib/api";
import {
  auditPercent,
  auditTimelineLabel,
} from "@/lib/complianceAuditDisplay";
import {
  createComplianceAudit,
  deleteComplianceAudit,
  downloadComplianceAuditReport,
  listComplianceAudits,
  listComplianceTemplates,
} from "@/lib/corporateApi";
import type { Site } from "@/lib/mockData";
import type { PhysicalComplianceAuditRunRow, PhysicalComplianceTemplateRow } from "@/lib/corporateTypes";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  Clock,
  Plus,
  RefreshCw,
  Settings,
  FileDown,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type FilterKey = "all" | "draft" | "submitted" | "validated";

export default function CorporateComplianceAudits() {
  const [sites, setSites] = useState<Site[]>([]);
  const [templates, setTemplates] = useState<PhysicalComplianceTemplateRow[]>([]);
  const [rows, setRows] = useState<PhysicalComplianceAuditRunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [siteId, setSiteId] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t, r] = await Promise.all([
        apiGet<Site[]>("/sites/"),
        listComplianceTemplates(),
        listComplianceAudits(),
      ]);
      setSites(s);
      setTemplates(t);
      setRows(r);
      if (!siteId && s.length) setSiteId(s[0].id);
      if (!templateId && t.length) setTemplateId(String(t[0].id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const c = { all: rows.length, draft: 0, submitted: 0, validated: 0 };
    for (const r of rows) {
      if (r.status === "draft") c.draft++;
      else if (r.status === "submitted") c.submitted++;
      else if (r.status === "validated" || r.status === "completed") c.validated++;
    }
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    if (filter === "validated")
      return rows.filter((r) => r.status === "validated" || r.status === "completed");
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const draftForSite = (sid: string) =>
    rows.filter((r) => r.status === "draft" && r.siteId === sid);

  const doCreate = async () => {
    const tid = Number(templateId);
    if (!siteId || !tid) {
      toast.error("Select site and template");
      return;
    }
    const existing = draftForSite(siteId).filter((r) => r.templateId === tid);
    if (existing.length > 0) {
      const siteLabel = sites.find((s) => s.id === siteId)?.name ?? siteId;
      const ok = window.confirm(
        `${siteLabel} already has draft #${existing[0].id}. Opening that draft — not creating another.`,
      );
      if (!ok) return;
    }
    try {
      const row = await createComplianceAudit(siteId, tid);
      toast.success(
        row.reusedExistingDraft
          ? `Continued draft #${row.id}`
          : `Started audit #${row.id} — guard fills it on mobile`,
      );
      setCreateOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    }
  };

  const doDeleteDraft = async (id: number) => {
    if (!window.confirm(`Delete draft #${id}? This cannot be undone.`)) return;
    try {
      await deleteComplianceAudit(id);
      toast.success(`Draft #${id} deleted`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "All" },
    { key: "draft", label: "Drafts" },
    { key: "submitted", label: "Needs review" },
    { key: "validated", label: "Validated" },
  ];

  return (
    <DashboardLayout title="Compliance audits">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Physical Security Compliance</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Guards complete PSCA audits on mobile. You review evidence, adjust scores, and validate
              to lock the improvement timeline.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={cn("mr-1.5 h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} disabled={!sites.length}>
              <Plus className="mr-1.5 h-4 w-4" />
              Start audit
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/corporate/compliance-audits/report">
                <BarChart3 className="mr-1.5 h-4 w-4" />
                Report
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/corporate/compliance-audits/settings">
                <Settings className="mr-1.5 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total audits", value: counts.all, icon: ClipboardCheck },
            { label: "Drafts", value: counts.draft, icon: Clock },
            { label: "Awaiting review", value: counts.submitted, icon: Building2 },
            { label: "Validated", value: counts.validated, icon: ClipboardCheck },
          ].map((s) => (
            <Card key={s.label} className="shadow-sm">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="text-2xl font-semibold tabular-nums">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="ml-1.5 rounded-full bg-background/20 px-1.5 text-xs tabular-nums">
                {counts[f.key]}
              </span>
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-xl border bg-card p-12 text-center text-sm text-muted-foreground">
            Loading audits…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
            <p className="font-medium">No audits in this view</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filter === "all"
                ? "Start an audit for a site, or wait for a guard to begin on mobile."
                : "Try another filter or refresh the list."}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((r) => {
              const pct = auditPercent(r);
              const isReview = r.status === "submitted";
              const isValidated =
                r.status === "validated" || r.status === "completed";
              return (
                <Card
                  key={r.id}
                  className={cn(
                    "shadow-sm transition hover:shadow-md",
                    isReview && "border-primary/30 ring-1 ring-primary/10",
                  )}
                >
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-lg">
                          {r.siteName ?? r.siteId}
                        </span>
                        <AuditStatusBadge status={r.status} />
                        <span className="text-xs text-muted-foreground font-mono">
                          #{r.id}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {r.templateTitle ?? "PSCA"} · Score{" "}
                        <span className="font-medium text-foreground">
                          {pct != null ? `${pct}%` : "—"}
                        </span>
                        {" · "}
                        {auditTimelineLabel(r)}
                      </p>
                      {r.submittedAt && (
                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(r.submittedAt).toLocaleString()}
                        </p>
                      )}
                      {isReview && r.reviewProgress && (
                        <p className="text-xs font-medium text-primary">
                          QA: {r.reviewProgress.qaScored}/{r.reviewProgress.requirementsTotal}
                          {r.reviewProgress.mismatchCount > 0 &&
                            ` · ${r.reviewProgress.mismatchCount} to reconcile`}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button size="sm" asChild variant={isReview ? "default" : "outline"}>
                        <Link to={`/corporate/compliance-audits/${r.id}`}>
                          {isReview ? "Review now" : "View"}
                        </Link>
                      </Button>
                      {isValidated && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={downloadingId === r.id}
                          onClick={() => void doDownloadReport(r.id)}
                        >
                          {downloadingId === r.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileDown className="mr-1 h-4 w-4" />
                          )}
                          Report
                        </Button>
                      )}
                      {r.status === "draft" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => void doDeleteDraft(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start compliance audit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Site</Label>
              <Select value={siteId} onValueChange={setSiteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.title} (v{t.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Only one active draft per site. Guards continue the audit on the Movara mobile app.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void doCreate()}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
