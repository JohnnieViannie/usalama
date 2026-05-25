import type { Alert, DashboardKpis, Incident } from "@/lib/mockData";

/** When GET /dashboard-kpis/ is missing, derive panic + police from list payloads. Visitor counts stay 0. */
export function computeDashboardKpisFromLists(
  alerts: Alert[],
  incidents: Incident[],
  fromIso: string,
  toIso: string,
): DashboardKpis {
  const fromMs = new Date(fromIso).getTime();
  const toMs = new Date(toIso).getTime();
  const inRange = (iso: string) => {
    const t = new Date(iso).getTime();
    return !Number.isNaN(t) && t >= fromMs && t <= toMs;
  };

  const panicAlerts = alerts.filter((a) => a.type === "panic" && inRange(a.timestamp));
  const panicTotal = panicAlerts.length;
  const panicResolved = panicAlerts.filter((a) => a.status === "resolved").length;
  const panicUnresolved = panicAlerts.filter((a) => a.status === "unresolved").length;

  const policeReports = incidents.filter((inc) => {
    const pr = inc.policeReportedAt;
    if (!pr) return false;
    return inRange(pr);
  }).length;

  return {
    from: fromIso,
    to: toIso,
    panicTotal,
    panicResolved,
    panicUnresolved,
    policeReports,
    visitorsIn: 0,
    visitorsOut: 0,
    visitorsOpenInside: 0,
  };
}
