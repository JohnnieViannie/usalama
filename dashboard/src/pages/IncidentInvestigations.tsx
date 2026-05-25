import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listIncidentInvestigations } from "@/lib/incidentInvestigationApi";
import type { IncidentInvestigationRow } from "@/lib/incidentInvestigationTypes";
import { format } from "date-fns";
import { ArrowLeft, FileSearch } from "lucide-react";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";

export default function IncidentInvestigations() {
  const [rows, setRows] = useState<IncidentInvestigationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setRows(await listIncidentInvestigations());
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout title="Incident investigations">
      <div className="mx-auto max-w-6xl space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/incidents">
              <ArrowLeft className="mr-1 h-4 w-4" /> Incidents
            </Link>
          </Button>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={FileSearch}
            title="No investigations yet"
            description="Start an investigation from an incident on the Incidents page."
          />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Incident</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.investigationNumber}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.incidentTitle || `#${r.incidentId}`}</TableCell>
                    <TableCell>{r.siteName || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "closed" ? "secondary" : "default"}>
                        {r.status.replace(/_/g, " ")}
                      </Badge>
                      {(r.overdueMeasureCount ?? 0) > 0 && (
                        <Badge variant="destructive" className="ml-1">
                          {r.overdueMeasureCount} overdue
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{r.progress?.percent ?? 0}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.updatedAt ? format(new Date(r.updatedAt), "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/incidents/investigations/${r.id}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
