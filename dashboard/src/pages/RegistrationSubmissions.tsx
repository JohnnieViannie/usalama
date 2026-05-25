import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, startOfDay } from "date-fns";
import DashboardLayout from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { apiGet, apiGetAllow404 } from "@/lib/api";
import type { LinkVisitorStats, RegistrationLink, RegistrationSubmission } from "@/lib/mockData";
import { ClipboardList, LogIn, LogOut, Users } from "lucide-react";
import { toast } from "sonner";

const todayInput = () => format(new Date(), "yyyy-MM-dd");

export default function RegistrationSubmissions() {
  const navigate = useNavigate();
  const { linkId = "" } = useParams();
  const parsedId = Number(linkId);
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [rows, setRows] = useState<RegistrationSubmission[]>([]);
  const [visitorStats, setVisitorStats] = useState<LinkVisitorStats | null>(null);
  const [visitorStatsLoading, setVisitorStatsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState(todayInput);
  const [to, setTo] = useState(todayInput);

  const active = useMemo(
    () => links.find((l) => l.id === parsedId) ?? null,
    [links, parsedId],
  );

  const statsRange = useMemo(() => {
    const kFrom = from
      ? new Date(`${from}T00:00:00`).toISOString()
      : startOfDay(new Date()).toISOString();
    const kTo = to ? new Date(`${to}T23:59:59`).toISOString() : new Date().toISOString();
    return { kFrom, kTo };
  }, [from, to]);

  useEffect(() => {
    (async () => {
      try {
        const [allLinks, submissions] = await Promise.all([
          apiGet<RegistrationLink[]>("/registration-links/"),
          apiGet<RegistrationSubmission[]>(`/registration-links/${parsedId}/submissions/`),
        ]);
        setLinks(allLinks);
        setRows(submissions);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load submissions");
      }
    })();
  }, [parsedId]);

  useEffect(() => {
    if (!parsedId || Number.isNaN(parsedId)) return;
    let cancelled = false;
    setVisitorStatsLoading(true);
    const q = `from=${encodeURIComponent(statsRange.kFrom)}&to=${encodeURIComponent(statsRange.kTo)}`;
    (async () => {
      try {
        const remote = await apiGetAllow404<LinkVisitorStats>(
          `/registration-links/${parsedId}/visitor-stats/?${q}`,
        );
        if (!cancelled) setVisitorStats(remote);
      } catch (e) {
        if (!cancelled) {
          setVisitorStats(null);
          toast.error(e instanceof Error ? e.message : "Failed to load visitor stats");
        }
      } finally {
        if (!cancelled) setVisitorStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [parsedId, statsRange.kFrom, statsRange.kTo]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      const t = new Date(row.submittedAt).getTime();
      if (from) {
        const fromT = new Date(`${from}T00:00:00`).getTime();
        if (t < fromT) return false;
      }
      if (to) {
        const toT = new Date(`${to}T23:59:59`).getTime();
        if (t > toT) return false;
      }
      if (!q) return true;
      const content = Object.values(row.data || {}).join(" ").toLowerCase();
      return content.includes(q);
    });
  }, [rows, query, from, to]);

  const statValue = (n: number | undefined) =>
    visitorStatsLoading ? "…" : (n ?? "—");

  return (
    <DashboardLayout title="Registration link dashboard">
      <div className="mb-4 rounded-xl border bg-card p-4">
        <button className="mb-3 text-xs text-primary underline" onClick={() => navigate("/entrance-analytics")}>
          Back to registration links
        </button>
        <div className="text-lg font-semibold">{active?.title || "Registration link"}</div>
        <div className="text-xs text-muted-foreground">
          {active?.eventName || "No event name"}
          {active?.siteName ? ` · ${active.siteName}` : ""}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Visitors in"
          value={statValue(visitorStats?.visitorsIn)}
          icon={LogIn}
          tone="success"
          hint={visitorStatsLoading ? "Loading…" : "Sign-ins in range"}
        />
        <StatCard
          label="Visitors out"
          value={statValue(visitorStats?.visitorsOut)}
          icon={LogOut}
          hint={visitorStatsLoading ? "Loading…" : "Sign-outs in range"}
        />
        <StatCard
          label="Visitors inside"
          value={statValue(visitorStats?.visitorsOpenInside)}
          icon={Users}
          tone="warning"
          hint="Open check-ins"
        />
        <StatCard
          label="Form submissions"
          value={rows.length}
          icon={ClipboardList}
          hint="All time for this link"
        />
      </div>

      <div className="mb-4 rounded-xl border bg-card p-4">
        <p className="mb-2 text-xs text-muted-foreground">
          Date range applies to visitor KPIs and the submissions table below.
        </p>
        <div className="grid gap-2 md:grid-cols-4">
          <input
            className="rounded-md border bg-background px-3 py-2 text-sm md:col-span-2"
            placeholder="Search by any submitted value"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            className="rounded-md border bg-background px-3 py-2 text-sm"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="From date"
          />
          <input
            className="rounded-md border bg-background px-3 py-2 text-sm"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="To date"
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="px-3 py-2 font-medium">Submitted at</th>
                {(active?.fields || []).map((field) => (
                  <th key={field.key} className="px-3 py-2 font-medium">
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2 align-top text-muted-foreground">
                    {format(new Date(row.submittedAt), "PPpp")}
                  </td>
                  {(active?.fields || []).map((field) => (
                    <td key={`${row.id}-${field.key}`} className="px-3 py-2 align-top">
                      {(row.data?.[field.key] || "").trim() || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="border-t border-dashed p-4 text-sm text-muted-foreground">
            No records match the current filters.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
