import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuditLogPanel from "@/components/incident-investigation/AuditLogPanel";
import CustodyDialog from "@/components/incident-investigation/CustodyDialog";
import { PrinciplesPanel, renderSection } from "@/components/incident-investigation/InvestigationSectionForms";
import {
  closeIncidentInvestigation,
  deleteInvestigationAttachment,
  downloadInvestigationReport,
  getIncidentInvestigation,
  patchIncidentInvestigation,
  uploadInvestigationAttachment,
} from "@/lib/incidentInvestigationApi";
import {
  SECTION_LABELS,
  SECTION_ORDER,
  type IncidentInvestigationRow,
  type InvestigationJson,
  type SectionKey,
} from "@/lib/incidentInvestigationTypes";
import { ArrowLeft, CheckCircle2, FileDown, Link2, Loader2, Save, ScrollText } from "lucide-react";
import { toast } from "sonner";

export default function IncidentInvestigationWizard() {
  const { id } = useParams<{ id: string }>();
  const invId = Number(id);
  const [row, setRow] = useState<IncidentInvestigationRow | null>(null);
  const [json, setJson] = useState<InvestigationJson>({});
  const [section, setSection] = useState<SectionKey>("section_a");
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [custodyOpen, setCustodyOpen] = useState(false);
  const [investigatorEmail, setInvestigatorEmail] = useState("");

  const load = useCallback(async () => {
    const data = await getIncidentInvestigation(invId);
    setRow(data);
    setJson(data.investigationJson || {});
    setInvestigatorEmail(data.assignedInvestigatorEmail || "");
    const cs = (data.currentSection || "section_a") as SectionKey;
    if (SECTION_ORDER.includes(cs)) setSection(cs);
  }, [invId]);

  useEffect(() => {
    if (!Number.isFinite(invId)) return;
    load().catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load"));
  }, [invId, load]);

  const closed = row?.status === "closed";
  const progress = row?.progress?.percent ?? 0;

  const save = async (nextSection?: SectionKey) => {
    if (!row || closed) return;
    setSaving(true);
    try {
      const updated = await patchIncidentInvestigation(row.id, {
        investigationJson: json,
        currentSection: nextSection || section,
        assignedInvestigatorEmail: investigatorEmail,
        status: row.status === "draft" ? "in_progress" : row.status,
      });
      setRow(updated);
      setJson(updated.investigationJson || json);
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = async () => {
    if (!row) return;
    await save();
    setClosing(true);
    try {
      const updated = await closeIncidentInvestigation(row.id);
      setRow(updated);
      setJson(updated.investigationJson || {});
      toast.success("Investigation closed");
    } catch (e) {
      const err = e as Error & { message?: string };
      toast.error(err.message || "Cannot close — complete required sections");
    } finally {
      setClosing(false);
    }
  };

  const handleReport = async () => {
    if (!row) return;
    setReporting(true);
    try {
      await downloadInvestigationReport(row.id, `${row.investigationNumber}-report.pdf`);
      toast.success("Report downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Report download failed");
    } finally {
      setReporting(false);
    }
  };

  const onUpload = async (file: File, rowId?: string) => {
    if (!row) return;
    try {
      await uploadInvestigationAttachment(row.id, file, section, rowId);
      await load();
      toast.success("File uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    }
  };

  if (!row) {
    return (
      <DashboardLayout title="Investigation">
        <div className="flex items-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Investigation ${row.investigationNumber}`}>
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/incidents/investigations">
              <ArrowLeft className="mr-1 h-4 w-4" /> Investigations
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/incidents">
              <Link2 className="mr-1 h-4 w-4" /> Incidents
            </Link>
          </Button>
          <Badge variant={closed ? "secondary" : "default"}>{row.status.replace(/_/g, " ")}</Badge>
          {row.overdueMeasureCount ? (
            <Badge variant="destructive">{row.overdueMeasureCount} overdue actions</Badge>
          ) : null}
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">{row.investigationNumber}</h2>
              <p className="text-sm text-muted-foreground">
                Incident #{row.incidentId} · {row.siteName} · {row.incidentTitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ScrollText className="mr-1 h-4 w-4" /> Audit log
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Audit log</SheetTitle>
                  </SheetHeader>
                  <AuditLogPanel investigationId={row.id} />
                </SheetContent>
              </Sheet>
              {section === "section_d" && !closed && (
                <Button variant="outline" size="sm" onClick={() => setCustodyOpen(true)}>
                  Chain of custody
                </Button>
              )}
              {closed && (
                <Button size="sm" onClick={handleReport} disabled={reporting}>
                  {reporting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <FileDown className="mr-1 h-4 w-4" />}
                  PDF report
                </Button>
              )}
              {!closed && (
                <>
                  <Button size="sm" variant="outline" onClick={() => save()} disabled={saving}>
                    {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                    Save
                  </Button>
                  <Button size="sm" onClick={handleClose} disabled={closing || saving}>
                    {closing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
                    Close investigation
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
          {!closed && (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div>
                <Label className="text-xs">Assigned investigator email (notifications)</Label>
                <Input
                  type="email"
                  value={investigatorEmail}
                  onChange={(e) => setInvestigatorEmail(e.target.value)}
                  onBlur={() => save()}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
          <nav className="space-y-1 rounded-lg border bg-card p-2">
            {SECTION_ORDER.map((key) => {
              const done = row.progress?.sectionStatus?.[key];
              return (
                <button
                  key={key}
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-xs ${
                    section === key ? "bg-primary/10 font-medium" : "hover:bg-muted"
                  }`}
                  onClick={() => setSection(key)}
                >
                  {done ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> : <span className="h-3.5 w-3.5 rounded-full border" />}
                  <span>{SECTION_LABELS[key]}</span>
                </button>
              );
            })}
          </nav>

          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="mb-4 font-semibold">{SECTION_LABELS[section]}</h3>
              {renderSection(section, {
                data: json,
                onChange: setJson,
                disabled: closed,
              })}
              {section === "section_c" && !closed && (
                <div className="mt-4">
                  <Label className="text-xs">Attach scene photographs</Label>
                  <Input
                    type="file"
                    accept="image/*,video/*,.pdf"
                    className="mt-1"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void onUpload(f, "scene");
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
              {section === "section_d" && !closed && (
                <div className="mt-4">
                  <Label className="text-xs">Attach evidence file (links to current section)</Label>
                  <Input
                    type="file"
                    accept="image/*,video/*,.pdf"
                    className="mt-1"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void onUpload(f);
                      e.target.value = "";
                    }}
                  />
                </div>
              )}
              {(row.attachments?.length ?? 0) > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Attachments</p>
                  <ul className="space-y-1 text-sm">
                    {row.attachments?.map((a) => (
                      <li key={a.id} className="flex items-center gap-2">
                        <a href={a.url} target="_blank" rel="noreferrer" className="text-primary underline truncate">
                          {a.description || a.sectionKey || `File ${a.id}`}
                        </a>
                        {!closed && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive h-7"
                            onClick={async () => {
                              await deleteInvestigationAttachment(row.id, a.id);
                              await load();
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(row.custodyTransfers?.length ?? 0) > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Chain of custody</p>
                  <ul className="text-sm space-y-1">
                    {row.custodyTransfers?.map((c) => (
                      <li key={c.id}>
                        {c.evidenceId}: {c.fromName} → {c.toName} ({c.transferredAt?.slice(0, 10)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <PrinciplesPanel data={json} onChange={setJson} disabled={closed} />
            {!closed && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  disabled={section === "section_a"}
                  onClick={() => {
                    const idx = SECTION_ORDER.indexOf(section);
                    if (idx > 0) setSection(SECTION_ORDER[idx - 1]);
                  }}
                >
                  Previous
                </Button>
                <Button
                  onClick={async () => {
                    await save();
                    const idx = SECTION_ORDER.indexOf(section);
                    if (idx < SECTION_ORDER.length - 1) setSection(SECTION_ORDER[idx + 1]);
                  }}
                >
                  Save & next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <CustodyDialog
        investigationId={row.id}
        open={custodyOpen}
        onOpenChange={setCustodyOpen}
        onRecorded={load}
      />
    </DashboardLayout>
  );
}
