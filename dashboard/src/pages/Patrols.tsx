import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Checkpoint, Guard, GuardLocationPing, PatrolCompliance, PatrolEvidenceResponse, PatrolLog, Site } from "@/lib/mockData";
import { apiGet } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

export default function Patrols() {
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [locationPings, setLocationPings] = useState<GuardLocationPing[]>([]);
  const [compliance, setCompliance] = useState<PatrolCompliance | null>(null);
  const [guardId, setGuardId] = useState("all");
  const [siteId, setSiteId] = useState("all");
  const [date, setDate] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [evidence, g, s, c] = await Promise.all([
          apiGet<PatrolEvidenceResponse>("/patrol-evidence/"),
          apiGet<Guard[]>("/guards/"),
          apiGet<Site[]>("/sites/"),
          apiGet<Checkpoint[]>("/checkpoints/"),
        ]);
        setPatrolLogs(evidence.patrolLogs ?? []);
        setLocationPings(evidence.locationPings ?? []);
        setCompliance(evidence.compliance ?? null);
        setGuards(g);
        setSites(s);
        setCheckpoints(c);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  const findGuard = (id: string) => guards.find((g) => g.id === id);
  const findCheckpoint = (id: string) => checkpoints.find((c) => c.id === id);
  const findSite = (id: string) => sites.find((s) => s.id === id);

  const filtered = useMemo(() => {
    return patrolLogs.filter((p) => {
      if (guardId !== "all" && p.guardId !== guardId) return false;
      if (siteId !== "all" && p.siteId !== siteId) return false;
      if (date && new Date(p.timestamp).toISOString().slice(0, 10) !== date) return false;
      return true;
    });
  }, [patrolLogs, guardId, siteId, date]);

  const filteredPings = useMemo(() => {
    return locationPings.filter((p) => {
      if (guardId !== "all" && p.guardId !== guardId) return false;
      if (siteId !== "all" && p.siteId !== siteId) return false;
      if (date && new Date(p.timestamp).toISOString().slice(0, 10) !== date) return false;
      return true;
    });
  }, [locationPings, guardId, siteId, date]);
  const filteredComplianceSites = useMemo(() => {
    const list = compliance?.bySite ?? [];
    return list
      .filter((s) => (siteId === "all" ? true : s.siteId === siteId))
      .map((s) => ({
        ...s,
        checkpoints: s.checkpoints.filter((cp) => {
          if (siteId !== "all" && cp.siteId !== siteId) return false;
          return true;
        }),
      }));
  }, [compliance, siteId]);

  return (
    <DashboardLayout title="Patrol Logs">
      <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-[var(--shadow-card)] sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Guard</Label>
          <Select value={guardId} onValueChange={setGuardId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All guards</SelectItem>
              {guards.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Site</Label>
          <Select value={siteId} onValueChange={setSiteId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sites</SelectItem>
              {sites.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      <div className="mobile-only-cards mt-4 mobile-card-list">
        {filtered.map((p) => (
          <div key={p.id} className="mobile-data-card">
            <div className="font-medium">{p.guardName ?? findGuard(p.guardId)?.name}</div>
            <div className="mobile-kv mt-1">Checkpoint: {p.checkpointName ?? findCheckpoint(p.checkpointId)?.name}</div>
            <div className="mobile-kv">Site: {findSite(p.siteId)?.name}</div>
            <div className="mobile-kv">{format(new Date(p.timestamp), "MMM d, HH:mm")}</div>
            <div className="mobile-kv">
              GPS: {p.latitude != null && p.longitude != null ? `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}` : "—"}
            </div>
            <div className="mt-2">
              {p.status === "on_time" && <Badge className="bg-success/15 text-success hover:bg-success/15">On time</Badge>}
              {p.status === "late" && <Badge className="bg-warning/15 text-warning hover:bg-warning/15">Late</Badge>}
              {p.status === "missed" && <Badge variant="destructive">Missed</Badge>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No patrol logs match the filter</p>
        )}
      </div>

      <div className="desktop-only-table mt-4 rounded-xl border bg-card shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guard</TableHead>
              <TableHead>Checkpoint</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>GPS</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.guardName ?? findGuard(p.guardId)?.name}</TableCell>
                <TableCell>{p.checkpointName ?? findCheckpoint(p.checkpointId)?.name}</TableCell>
                <TableCell className="text-muted-foreground">{findSite(p.siteId)?.name}</TableCell>
                <TableCell>{format(new Date(p.timestamp), "MMM d, HH:mm")}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {p.latitude != null && p.longitude != null ? `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}` : "—"}
                </TableCell>
                <TableCell>
                  {p.status === "on_time" && <Badge className="bg-success/15 text-success hover:bg-success/15">On time</Badge>}
                  {p.status === "late" && <Badge className="bg-warning/15 text-warning hover:bg-warning/15">Late</Badge>}
                  {p.status === "missed" && <Badge variant="destructive">Missed</Badge>}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No patrol logs match the filter
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mobile-only-cards mt-6 mobile-card-list">
        {filteredPings.slice(0, 300).map((p) => (
          <div key={p.id} className="mobile-data-card">
            <div className="font-medium">{findGuard(p.guardId)?.name ?? p.guardId}</div>
            <div className="mobile-kv mt-1">Source: {p.source}</div>
            <div className="mobile-kv">
              Checkpoint: {p.checkpointName ?? findCheckpoint(p.checkpointId ?? "")?.name ?? "—"}
            </div>
            <div className="mobile-kv">{format(new Date(p.timestamp), "MMM d, HH:mm:ss")}</div>
            <div className="mobile-kv">
              {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}
            </div>
          </div>
        ))}
        {filteredPings.length === 0 && (
          <p className="text-sm text-muted-foreground">No route pings for this filter</p>
        )}
      </div>

      <div className="desktop-only-table mt-6 rounded-xl border bg-card shadow-[var(--shadow-card)]">
        <div className="border-b px-4 py-3 text-sm font-medium">Route pings ({filteredPings.length})</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guard</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Checkpoint</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Coordinates</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPings.slice(0, 300).map((p) => (
              <TableRow key={p.id}>
                <TableCell>{findGuard(p.guardId)?.name ?? p.guardId}</TableCell>
                <TableCell className="uppercase text-xs text-muted-foreground">{p.source}</TableCell>
                <TableCell>{p.checkpointName ?? findCheckpoint(p.checkpointId ?? "")?.name ?? "—"}</TableCell>
                <TableCell>{format(new Date(p.timestamp), "MMM d, HH:mm:ss")}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)}
                </TableCell>
              </TableRow>
            ))}
            {filteredPings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No route pings for this filter
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-6 rounded-xl border bg-card p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-semibold">Patrol compliance by site</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Shows which checkpoints were scanned and which are still pending in the selected patrol data.
        </p>
        {filteredComplianceSites.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No compliance data yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {filteredComplianceSites.map((site) => (
              <div key={site.siteId} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{site.siteName}</div>
                  <div className="text-xs text-muted-foreground">
                    Coverage {site.coveragePct}% · {site.scannedCheckpoints}/{site.totalCheckpoints} scanned · {site.missedCheckpoints} pending
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {site.checkpoints.map((cp) => (
                    <div key={cp.checkpointId} className={`rounded-md border p-2 ${cp.scanned ? "border-success/40" : "border-destructive/40"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium">{cp.checkpointName}</div>
                        {cp.scanned ? (
                          <Badge className="bg-success/15 text-success hover:bg-success/15">Scanned</Badge>
                        ) : (
                          <Badge variant="destructive">Not scanned</Badge>
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Scans: {cp.scanCount} · Last scan: {cp.lastScanAt ? format(new Date(cp.lastScanAt), "MMM d, HH:mm") : "Never"}
                      </div>
                      {cp.locationMode === "indoor" && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          Indoor: {[cp.buildingBlock, cp.floorLevel, cp.zoneLabel].filter(Boolean).join(" · ") || "Zone checkpoint"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
