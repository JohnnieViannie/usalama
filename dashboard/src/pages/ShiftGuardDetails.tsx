import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import DashboardLayout from "@/layouts/DashboardLayout";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type PerformanceRow = {
  scheduleId: string;
  day: string;
  date: string;
  siteId: string;
  siteName: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: "missed_shift" | "left_before_time" | "completed_well" | "started_no_end";
};

type PerformancePayload = {
  guardId: string;
  guardName: string;
  counts: {
    total: number;
    missed_shift: number;
    left_before_time: number;
    completed_well: number;
    started_no_end: number;
  };
  rows: PerformanceRow[];
};

const statusLabel: Record<PerformanceRow["status"], string> = {
  missed_shift: "Missed shift",
  left_before_time: "Left before time",
  completed_well: "Completed well",
  started_no_end: "Started, no end",
};

export default function ShiftGuardDetails() {
  const navigate = useNavigate();
  const { guardId = "" } = useParams();
  const [data, setData] = useState<PerformancePayload | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const payload = await apiGet<PerformancePayload>(`/shifts-performance/${guardId}/`);
        setData(payload);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load guard shift details");
      }
    })();
  }, [guardId]);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.rows;
    return data.rows.filter((r) => {
      const blob = [
        r.day,
        r.date,
        r.siteName,
        statusLabel[r.status],
        r.actualStart ?? "",
        r.actualEnd ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [data, query]);

  return (
    <DashboardLayout title="Guard Shift Details">
      <div className="mb-4 rounded-xl border bg-card p-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/shifts")}>
          Back to shifts
        </Button>
        <div className="mt-3 text-lg font-semibold">{data?.guardName || "Guard"}</div>
        <div className="text-xs text-muted-foreground">Shift attendance and performance summary</div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Total scheduled</div>
          <div className="text-2xl font-semibold">{data?.counts.total ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Completed well</div>
          <div className="text-2xl font-semibold">{data?.counts.completed_well ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Missed</div>
          <div className="text-2xl font-semibold">{data?.counts.missed_shift ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Left before time</div>
          <div className="text-2xl font-semibold">{data?.counts.left_before_time ?? 0}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-xs text-muted-foreground">Started, no end</div>
          <div className="text-2xl font-semibold">{data?.counts.started_no_end ?? 0}</div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-card p-4">
        <input
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Search by day/site/status"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mt-4 rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-left">
                <th className="px-3 py-2 font-medium">Day</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Site</th>
                <th className="px-3 py-2 font-medium">Scheduled start</th>
                <th className="px-3 py-2 font-medium">Scheduled end</th>
                <th className="px-3 py-2 font-medium">Actual start</th>
                <th className="px-3 py-2 font-medium">Actual end</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.scheduleId}-${r.date}-${r.scheduledStart}`} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{r.day}</td>
                  <td className="px-3 py-2">{format(new Date(`${r.date}T00:00:00`), "PP")}</td>
                  <td className="px-3 py-2">{r.siteName}</td>
                  <td className="px-3 py-2">{format(new Date(r.scheduledStart), "p")}</td>
                  <td className="px-3 py-2">{format(new Date(r.scheduledEnd), "p")}</td>
                  <td className="px-3 py-2">
                    {r.actualStart ? format(new Date(r.actualStart), "PPp") : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {r.actualEnd ? format(new Date(r.actualEnd), "PPp") : "—"}
                  </td>
                  <td className="px-3 py-2">{statusLabel[r.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="border-t border-dashed p-4 text-sm text-muted-foreground">
            No rows matched your filter.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
