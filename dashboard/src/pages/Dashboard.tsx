import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Shield, ShieldCheck, AlertTriangle, Footprints, Bell, BellRing, Scale, CheckCircle, Circle } from "lucide-react";
import { countGuardsByStatus, guardStatusBadge } from "@/lib/guardStatus";
import { formatDistanceToNow, startOfDay } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { apiGet, apiGetAllow404 } from "@/lib/api";
import { computeDashboardKpisFromLists } from "@/lib/dashboardKpis";
import type {
  Alert as AlertT,
  Checkpoint,
  Guard,
  GuardLocationPing,
  Incident,
  PatrolCompliance,
  PatrolEvidenceResponse,
  PatrolLog,
  DashboardKpis,
} from "@/lib/mockData";

export default function Dashboard() {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [patrolLogs, setPatrolLogs] = useState<PatrolLog[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [alerts, setAlerts] = useState<AlertT[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [locationPings, setLocationPings] = useState<GuardLocationPing[]>([]);
  const [compliance, setCompliance] = useState<PatrolCompliance | null>(null);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboardData = async (cancelledRef?: { cancelled: boolean }) => {
    try {
      const to = new Date();
      const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
      const kFrom = startOfDay(new Date()).toISOString();
      const kTo = new Date().toISOString();
      const [g, pl, inc, al, cp, lp, ev] = await Promise.all([
        apiGet<Guard[]>("/guards/"),
        apiGet<PatrolLog[]>("/patrol-logs/"),
        apiGet<Incident[]>("/incidents/"),
        apiGet<AlertT[]>("/alerts/"),
        apiGet<Checkpoint[]>("/checkpoints/"),
        apiGet<GuardLocationPing[]>("/location-pings/"),
        apiGet<PatrolEvidenceResponse>(
          `/patrol-evidence/?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
        ),
      ]);
      const kpiPath = `/dashboard-kpis/?from=${encodeURIComponent(kFrom)}&to=${encodeURIComponent(kTo)}`;
      const kpiRemote = await apiGetAllow404<DashboardKpis>(kpiPath);
      const kpi = kpiRemote ?? computeDashboardKpisFromLists(al, inc, kFrom, kTo);
      if (!cancelledRef?.cancelled) {
        setGuards(g);
        setPatrolLogs(pl);
        setIncidents(inc);
        setAlerts(al);
        setCheckpoints(cp);
        setLocationPings(lp);
        setCompliance(ev.compliance ?? null);
        setKpis(kpi);
        setLoadError(null);
      }
    } catch (e) {
      if (!cancelledRef?.cancelled) {
        setLoadError(e instanceof Error ? e.message : "Failed to load");
        setKpis(null);
      }
    }
  };

  useEffect(() => {
    const cancelledRef = { cancelled: false };
    void loadDashboardData(cancelledRef);
    const pollId = window.setInterval(() => {
      void loadDashboardData(cancelledRef);
    }, 10000);
    return () => {
      cancelledRef.cancelled = true;
      window.clearInterval(pollId);
    };
  }, []);

  const findGuard = (id: string) => guards.find((g) => g.id === id);
  const findCheckpoint = (id: string) => checkpoints.find((c) => c.id === id);

  const guardCounts = useMemo(() => countGuardsByStatus(guards), [guards]);
  const missed = compliance?.overall.missedCheckpoints ?? patrolLogs.filter((p) => p.status === "missed").length;
  const today = new Date().toDateString();
  const incToday = incidents.filter((i) => new Date(i.timestamp).toDateString() === today).length;

  const chartData = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const buckets = Array.from({ length: 12 }, (_, i) => {
      const bucketStart = new Date(start.getTime() + i * 2 * 60 * 60 * 1000);
      const hour = bucketStart.getHours().toString().padStart(2, "0");
      return {
        h: `${hour}:00`,
        scans: 0,
      };
    });
    for (const log of patrolLogs) {
      const ts = new Date(log.timestamp);
      if (Number.isNaN(ts.getTime()) || ts < start || ts > now) continue;
      const idx = Math.min(11, Math.floor((ts.getTime() - start.getTime()) / (2 * 60 * 60 * 1000)));
      buckets[idx].scans += 1;
    }
    return buckets;
  }, [patrolLogs]);

  const latestPingsByGuard = useMemo(() => {
    const latest = new Map<string, GuardLocationPing>();
    for (const ping of locationPings) {
      const current = latest.get(ping.guardId);
      if (!current || new Date(ping.timestamp) > new Date(current.timestamp)) {
        latest.set(ping.guardId, ping);
      }
    }
    return Array.from(latest.values()).sort(
      (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp),
    );
  }, [locationPings]);

  const mapPoints = useMemo(() => {
    if (latestPingsByGuard.length === 0) return [];
    const lats = latestPingsByGuard.map((p) => p.latitude);
    const lngs = latestPingsByGuard.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = Math.max(0.0001, maxLat - minLat);
    const lngSpan = Math.max(0.0001, maxLng - minLng);
    return latestPingsByGuard.map((p) => ({
      ...p,
      guardName: findGuard(p.guardId)?.name ?? p.guardId,
      x: ((p.longitude - minLng) / lngSpan) * 100,
      y: 100 - ((p.latitude - minLat) / latSpan) * 100,
    }));
  }, [latestPingsByGuard, guards]);

  const feed = [
    ...patrolLogs.map((p) => ({
      id: p.id,
      kind: "patrol" as const,
      ts: p.timestamp,
      text: `${findGuard(p.guardId)?.name ?? p.guardId} scanned ${findCheckpoint(p.checkpointId)?.name ?? p.checkpointId}`,
      status: p.status,
    })),
    ...incidents.map((i) => ({
      id: i.id,
      kind: "incident" as const,
      ts: i.timestamp,
      text: `Incident reported by ${findGuard(i.guardId)?.name ?? i.guardId}`,
      status: "incident",
    })),
    ...alerts.map((a) => ({
      id: a.id,
      kind: "alert" as const,
      ts: a.timestamp,
      text: `${a.type.replace("_", " ")} — ${findGuard(a.guardId)?.name ?? a.guardId}`,
      status: a.status,
    })),
  ]
    .sort((a, b) => +new Date(b.ts) - +new Date(a.ts))
    .slice(0, 10);

  return (
    <DashboardLayout title="Dashboard">
      {loadError && <p className="mb-4 text-sm text-destructive">{loadError}</p>}
      <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Guards" value={guardCounts.total} icon={Shield} hint="Linked to your company" />
        <StatCard label="On Duty" value={guardCounts.onDuty} icon={ShieldCheck} tone="success" hint="Live shift" />
        <StatCard label="Off Duty" value={guardCounts.offDuty} icon={CheckCircle} hint="Approved, not on shift" />
        <StatCard label="Inactive" value={guardCounts.inactive} icon={Circle} hint="Pending or disabled" />
      </div>

      <div className="mt-2 grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Missed Checkpoints" value={missed} icon={Footprints} tone="warning" />
        <StatCard label="Incidents Today" value={incToday} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="mt-2 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Panic alerts"
          value={kpis?.panicTotal ?? "—"}
          icon={Bell}
          tone="destructive"
          hint="Today"
        />
        <StatCard label="Panic resolved" value={kpis?.panicResolved ?? "—"} icon={BellRing} tone="success" hint="Today" />
        <StatCard
          label="Panic unresolved"
          value={kpis?.panicUnresolved ?? "—"}
          icon={Bell}
          tone="warning"
          hint="Today"
        />
        <StatCard label="Police reports" value={kpis?.policeReports ?? "—"} icon={Scale} hint="Emailed today" />
      </div>

      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-3">
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Patrol scans · last 24h</h3>
            <span className="text-xs text-muted-foreground">Live data</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="h" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="scans" stroke="hsl(var(--accent))" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="text-sm font-semibold">Activity feed</h3>
          <ul className="mt-4 space-y-3">
            {feed.map((f) => (
              <li key={`${f.kind}-${f.id}`} className="flex items-start gap-3 text-sm">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    f.kind === "incident"
                      ? "bg-destructive"
                      : f.kind === "alert"
                        ? "bg-warning"
                        : f.status === "missed"
                          ? "bg-destructive"
                          : f.status === "late"
                            ? "bg-warning"
                            : "bg-success"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{f.text}</div>
                  <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(f.ts), { addSuffix: true })}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Checkpoint compliance · last 24h</h3>
            <span className="text-xs text-muted-foreground">{compliance?.overall.coveragePct ?? 0}% coverage</span>
          </div>
          {!compliance || compliance.bySite.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No compliance data yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {compliance.bySite.slice(0, 8).map((site) => (
                <li key={site.siteId} className="rounded-lg border p-2">
                  <div className="font-medium">{site.siteName}</div>
                  <div className="text-xs text-muted-foreground">
                    {site.scannedCheckpoints}/{site.totalCheckpoints} scanned · {site.missedCheckpoints} pending · {site.coveragePct}%
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Guard last seen</h3>
            <span className="text-xs text-muted-foreground">Live every 10s</span>
          </div>
          {latestPingsByGuard.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No location pings yet.</p>
          ) : (
            <ul className="mt-4 space-y-2 text-sm">
              {latestPingsByGuard.slice(0, 12).map((p) => {
                const guard = findGuard(p.guardId);
                return (
                <li key={`${p.guardId}-${p.timestamp}`} className="rounded-lg border p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{guard?.name ?? p.guardId}</div>
                    {guard ? guardStatusBadge(guard.status) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(p.timestamp), { addSuffix: true })} ·{" "}
                    {p.latitude.toFixed(5)}, {p.longitude.toFixed(5)} · {p.source}
                  </div>
                </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="min-w-0 rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Live guard map</h3>
            <span className="text-xs text-muted-foreground">Latest location per guard</span>
          </div>
          <div className="mt-4 h-72 rounded-lg border bg-muted/20 p-2">
            {mapPoints.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Waiting for guard location pings
              </div>
            ) : (
              <div className="relative h-full w-full overflow-hidden rounded bg-background">
                {mapPoints.map((p) => (
                  <div
                    key={`${p.guardId}-${p.timestamp}`}
                    className="absolute max-w-[min(120px,45vw)] -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    title={`${p.guardName} (${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)})`}
                  >
                    <div className="h-3 w-3 rounded-full bg-accent" />
                    <div className="mt-1 truncate text-center text-[10px] text-muted-foreground">
                      {p.guardName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
