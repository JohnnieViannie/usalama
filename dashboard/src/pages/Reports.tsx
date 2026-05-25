import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import type { Guard, Incident, PatrolLog, Site } from "@/lib/mockData";
import { apiDelete, apiGet, apiPost, apiPrefix } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

function buildReport(
  period: string,
  guards: Guard[],
  sites: Site[],
  patrolLogs: PatrolLog[],
  incidents: Incident[],
) {
  const findGuard = (id: string) => guards.find((g) => g.id === id);
  const findSite = (id: string | null | undefined) =>
    id ? sites.find((s) => s.id === id) : undefined;

  const lines: string[] = [];
  lines.push(`UsalamaHub — ${period} Report`);
  lines.push(`Generated: ${format(new Date(), "PPpp")}`);
  lines.push("");
  lines.push("ATTENDANCE");
  guards.forEach((g) =>
    lines.push(`  - ${g.name} (${g.status}) → ${findSite(g.siteId)?.name ?? "Unassigned"}`),
  );
  lines.push("");
  lines.push("PATROL LOGS");
  patrolLogs.forEach((p) =>
    lines.push(
      `  - ${format(new Date(p.timestamp), "MMM d HH:mm")} · ${findGuard(p.guardId)?.name ?? p.guardName ?? p.guardId} · ${p.status}`,
    ),
  );
  lines.push("");
  lines.push("INCIDENTS");
  incidents.forEach((i) =>
    lines.push(
      `  - ${format(new Date(i.timestamp), "MMM d HH:mm")} · ${findGuard(i.guardId)?.name ?? i.guardName ?? i.guardId} · ${i.description}`,
    ),
  );
  return lines.join("\n");
}

function download(
  period: string,
  guards: Guard[],
  sites: Site[],
  patrolLogs: PatrolLog[],
  incidents: Incident[],
) {
  const content = buildReport(period, guards, sites, patrolLogs, incidents);
  const blob = new Blob([content], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `usalamahub-${period.toLowerCase()}-report.pdf`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${period} report exported`);
}

type ReportEntry = {
  id: string;
  label: string;
  periodStart: string;
  periodEnd: string;
  downloadUrl: string;
};

type IncidentMedia = {
  photos?: string[];
  video?: string;
  voice_note?: string;
  signature?: string;
  legacy_image?: string;
};

function ReportPreview({
  period,
  guards,
  sites,
  patrolLogs,
  incidents,
}: {
  period: string;
  guards: Guard[];
  sites: Site[];
  patrolLogs: PatrolLog[];
  incidents: Incident[];
}) {
  const findGuard = (id: string) => guards.find((g) => g.id === id);

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{period} report</div>
          <h3 className="mt-1 text-xl font-semibold">Sentinel Security Ltd</h3>
          <div className="text-sm text-muted-foreground">{format(new Date(), "PPP")}</div>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => download(period, guards, sites, patrolLogs, incidents)}>
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="text-xs text-muted-foreground">Patrol scans</div>
          <div className="mt-1 text-2xl font-semibold">{patrolLogs.length}</div>
        </div>
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="text-xs text-muted-foreground">Incidents</div>
          <div className="mt-1 text-2xl font-semibold">{incidents.length}</div>
        </div>
        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="text-xs text-muted-foreground">Active guards</div>
          <div className="mt-1 text-2xl font-semibold">{guards.filter((g) => g.status !== "inactive").length}</div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold">Recent patrol activity</h4>
        <ul className="mt-2 divide-y border-t text-sm">
          {patrolLogs.slice(0, 6).map((p) => (
            <li key={p.id} className="flex flex-col items-start justify-between gap-1 py-2 sm:flex-row sm:items-center">
              <span>{findGuard(p.guardId)?.name ?? p.guardName}</span>
              <span className="text-muted-foreground">
                {format(new Date(p.timestamp), "MMM d HH:mm")} · {p.status}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState("daily");
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [savedReports, setSavedReports] = useState<ReportEntry[]>([]);
  const [policeEmail, setPoliceEmail] = useState("");

  const load = async () => {
    const [g, s, pl, inc, reports] = await Promise.all([
      apiGet<Guard[]>("/guards/"),
      apiGet<Site[]>("/sites/"),
      apiGet<PatrolLog[]>("/patrol-logs/"),
      apiGet<Incident[]>("/incidents/"),
      apiGet<ReportEntry[]>("/reports/"),
    ]);
    setGuards(g);
    setSites(s);
    setPatrolLogs(pl);
    setIncidents(inc);
    const unreadIds = inc.filter((row) => (row as Incident & { unread?: boolean }).unread).map((row) => row.id);
    if (unreadIds.length) {
      await apiPost<{ ok: boolean }>("/incidents/mark-read/", { incidentIds: unreadIds });
    }
    setSavedReports(reports);
    try {
      const settings = await apiGet<{ policeEmail?: string }>("/company-settings/");
      setPoliceEmail(settings.policeEmail ?? "");
    } catch {
      // optional load
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load report data");
      }
    })();
  }, []);

  const generate = async (period: "Daily" | "Weekly") => {
    const now = new Date();
    const start = new Date(now);
    if (period === "Daily") {
      start.setDate(start.getDate() - 1);
    } else {
      start.setDate(start.getDate() - 7);
    }
    try {
      await apiPost<ReportEntry>("/reports-generate/", {
        label: `${period} report`,
        periodStart: start.toISOString(),
        periodEnd: now.toISOString(),
        filters: { period },
      });
      toast.success(`${period} report saved`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save report");
    }
  };

  const deleteIncident = async (incidentId: string) => {
    if (!window.confirm("Delete this incident and all attached files?")) return;
    try {
      await apiDelete<{ ok: boolean }>(`/incidents/${incidentId}/`);
      setIncidents((prev) => prev.filter((i) => i.id !== incidentId));
      toast.success("Incident deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete incident");
    }
  };

  const reportToPolice = async (incidentId: string) => {
    const target = window.prompt("Police email", policeEmail || "");
    if (!target) return;
    try {
      await apiPost<{ ok: boolean; sentTo: string }>(`/incidents/${incidentId}/report-to-police/`, {
        policeEmail: target.trim(),
      });
      setPoliceEmail(target.trim());
      toast.success("Incident reported to police");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send police report");
    }
  };

  const mediaFromIncident = (incident: Incident): IncidentMedia => {
    const fromPayload = (incident.payload?.media as IncidentMedia | undefined) ?? {};
    const fromApiMedia = (incident as Incident & { media?: IncidentMedia }).media ?? {};
    return {
      photos: fromApiMedia.photos ?? fromPayload.photos ?? [],
      video: fromApiMedia.video ?? fromPayload.video ?? "",
      voice_note: fromApiMedia.voice_note ?? fromPayload.voice_note ?? "",
      signature: fromApiMedia.signature ?? fromPayload.signature ?? "",
      legacy_image: fromApiMedia.legacy_image ?? fromPayload.legacy_image ?? "",
    };
  };

  return (
    <DashboardLayout title="Reports">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-4">
          <div className="mb-3 flex justify-end">
            <Button className="w-full sm:w-auto" onClick={() => void generate("Daily")}>Save daily report</Button>
          </div>
          <ReportPreview
            period="Daily"
            guards={guards}
            sites={sites}
            patrolLogs={patrolLogs}
            incidents={incidents}
          />
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <div className="mb-3 flex justify-end">
            <Button className="w-full sm:w-auto" onClick={() => void generate("Weekly")}>Save weekly report</Button>
          </div>
          <ReportPreview
            period="Weekly"
            guards={guards}
            sites={sites}
            patrolLogs={patrolLogs}
            incidents={incidents}
          />
        </TabsContent>
      </Tabs>
      <div className="mt-6 rounded-xl border bg-card p-4 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 text-sm font-semibold">Saved reports</h3>
        <ul className="space-y-2 text-sm">
          {savedReports.map((r) => (
            <li key={r.id} className="flex flex-col items-start justify-between gap-1 rounded-md border px-3 py-2 sm:flex-row sm:items-center">
              <span>
                {r.label} · {format(new Date(r.periodStart), "PP")} - {format(new Date(r.periodEnd), "PP")}
              </span>
              <a
                className="text-accent underline"
                href={`${apiPrefix}${r.downloadUrl.replace(/^\/api/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 rounded-xl border bg-card p-4 shadow-[var(--shadow-card)]">
        <h3 className="mb-3 text-sm font-semibold">Submitted incidents (full details)</h3>
        <div className="space-y-4">
          {incidents.map((incident) => {
            const media = mediaFromIncident(incident);
            const photos = media.photos ?? [];
            const details = incident.payload ?? {};
            return (
              <div key={incident.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold">{incident.title || "Incident report"}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(incident.timestamp), "PPpp")} · {incident.guardName || incident.guardId}
                    </div>
                    {(() => {
                      const guard = guards.find((g) => g.id === incident.guardId);
                      if (!guard?.passportImage) return null;
                      return (
                        <a
                          className="mt-1 inline-block text-xs text-accent underline"
                          href={guard.passportImage}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View guard passport image
                        </a>
                      );
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => void reportToPolice(incident.id)}>
                      Report to police
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => void deleteIncident(incident.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-sm whitespace-pre-wrap">{incident.description}</div>
                <div className="mt-3 text-xs text-muted-foreground">
                  <pre className="overflow-auto rounded bg-muted p-2">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="font-medium">Attachments</div>
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {photos.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noreferrer" className="block">
                          <img src={url} alt="incident evidence" className="h-24 w-full rounded border object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  {media.video && (
                    <a className="block text-accent underline" href={media.video} target="_blank" rel="noreferrer">
                      Video evidence
                    </a>
                  )}
                  {media.voice_note && (
                    <a className="block text-accent underline" href={media.voice_note} target="_blank" rel="noreferrer">
                      Voice note
                    </a>
                  )}
                  {media.signature && (
                    <a className="block text-accent underline" href={media.signature} target="_blank" rel="noreferrer">
                      Signature
                    </a>
                  )}
                  {media.legacy_image && (
                    <a className="block text-accent underline" href={media.legacy_image} target="_blank" rel="noreferrer">
                      Legacy image
                    </a>
                  )}
                  {!photos.length && !media.video && !media.voice_note && !media.signature && !media.legacy_image && (
                    <div className="text-muted-foreground">No attachments</div>
                  )}
                </div>
              </div>
            );
          })}
          {incidents.length === 0 && <div className="text-sm text-muted-foreground">No incidents found.</div>}
        </div>
      </div>
    </DashboardLayout>
  );
}
