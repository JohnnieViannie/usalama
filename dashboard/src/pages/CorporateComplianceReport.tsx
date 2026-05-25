import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getComplianceAuditsSummary } from "@/lib/corporateApi";
import type { ComplianceAuditsSummary } from "@/lib/corporateTypes";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function CorporateComplianceReport() {
  const [data, setData] = useState<ComplianceAuditsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setData(await getComplianceAuditsSummary());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sc = data?.statusCounts ?? {};

  return (
    <DashboardLayout title="Compliance reporting">
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/corporate/compliance-audits">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Audits
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : data ? (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard title="Total audits" value={String(data.totalAudits)} />
            <StatCard title="Awaiting review" value={String(sc.submitted ?? 0)} />
            <StatCard title="Validated" value={String((sc.validated ?? 0) + (sc.completed ?? 0))} />
            <StatCard title="Overdue revisits" value={String(data.overdueRevisits)} />
            <StatCard
              title="QA adjusted scores"
              value={String(data.qaAdjustedAudits ?? 0)}
            />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compliance by site</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Audits</TableHead>
                    <TableHead>Latest %</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.bySite.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        No site data yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.bySite.map((s) => (
                      <TableRow key={s.siteId}>
                        <TableCell>{s.siteName}</TableCell>
                        <TableCell>{s.auditCount}</TableCell>
                        <TableCell>
                          {s.latestPercent != null ? `${s.latestPercent}%` : "—"}
                        </TableCell>
                        <TableCell>{s.latestStatus ?? "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </DashboardLayout>
  );
}
