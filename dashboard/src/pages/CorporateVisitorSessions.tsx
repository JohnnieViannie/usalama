import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet } from "@/lib/api";
import { visitorSessionsReport } from "@/lib/corporateApi";
import type { Site } from "@/lib/mockData";
import type { VisitorSessionReportRow } from "@/lib/corporateTypes";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { endOfDay, startOfDay } from "date-fns";

export default function CorporateVisitorSessions() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteFilter, setSiteFilter] = useState<string>("");
  const [sessions, setSessions] = useState<VisitorSessionReportRow[]>([]);
  const [fromTo, setFromTo] = useState<{ from: string; to: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const s = await apiGet<Site[]>("/sites/");
      setSites(s);
      const from = startOfDay(new Date()).toISOString();
      const to = endOfDay(new Date()).toISOString();
      const rep = await visitorSessionsReport({
        from,
        to,
        siteId: siteFilter || undefined,
      });
      setSessions(rep.sessions);
      setFromTo({ from: rep.from, to: rep.to });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const applyFilter = () => {
    void load();
  };

  return (
    <DashboardLayout title="Visitor sessions">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[200px] space-y-1">
          <Label>Site filter</Label>
          <Select value={siteFilter || "__all__"} onValueChange={(v) => setSiteFilter(v === "__all__" ? "" : v)}>
            <SelectTrigger>
              <SelectValue placeholder="All sites" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All sites</SelectItem>
              {sites.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="secondary" size="sm" onClick={() => applyFilter()}>
          Apply
        </Button>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>
      {fromTo ? (
        <p className="mb-2 text-xs text-muted-foreground">
          Window: {fromTo.from} — {fromTo.to}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Checked in</TableHead>
                <TableHead>Checked out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No sessions in this window.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.checkoutCode}</TableCell>
                    <TableCell>{r.siteName || r.siteId || "—"}</TableCell>
                    <TableCell className="text-xs">{r.createdAt}</TableCell>
                    <TableCell className="text-xs">{r.checkedOutAt ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        For visitor QR codes per site, use Sites & Checkpoints → visitor QR on each site.
      </p>
    </DashboardLayout>
  );
}
