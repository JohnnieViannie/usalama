import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAfter, parseISO, startOfWeek } from "date-fns";
import DashboardLayout from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiGet } from "@/lib/api";
import { deleteSiteSurvey, listSiteSurveys } from "@/lib/corporateApi";
import type { Site } from "@/lib/mockData";
import type { SiteSecuritySurveyRow } from "@/lib/corporateTypes";
import { toast } from "sonner";
import { ClipboardList, Eye, FileCheck, FilePen, Pencil, RefreshCw, Trash2 } from "lucide-react";

export default function CorporateSiteSurveys() {
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [rows, setRows] = useState<SiteSecuritySurveyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const siteName = (row: SiteSecuritySurveyRow) =>
    row.siteName ?? sites.find((s) => s.id === row.siteId)?.name ?? row.siteId;

  const stats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    let submitted = 0;
    let draft = 0;
    let submittedThisWeek = 0;
    for (const r of rows) {
      if (r.status === "submitted") {
        submitted += 1;
        if (r.submittedAt && isAfter(parseISO(r.submittedAt), weekStart)) {
          submittedThisWeek += 1;
        }
      } else {
        draft += 1;
      }
    }
    return { total: rows.length, submitted, draft, submittedThisWeek };
  }, [rows]);

  const load = async () => {
    setLoading(true);
    try {
      const [s, r] = await Promise.all([apiGet<Site[]>("/sites/"), listSiteSurveys()]);
      setSites(s);
      setRows(r);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (r: SiteSecuritySurveyRow, e: React.MouseEvent) => {
    e.stopPropagation();
    const label = siteName(r);
    if (!window.confirm(`Delete survey #${r.id} (${label})? This cannot be undone.`)) return;
    try {
      await deleteSiteSurvey(r.id);
      toast.success("Survey deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <DashboardLayout title="Corporate Security Survey">
      <p className="mb-4 text-sm text-muted-foreground">
        Surveys are completed by guards in the Movara app. This page shows submissions after they are saved to the
        server. Use Edit or open a row to change survey data; Delete removes the record permanently.
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {!loading && (
        <div className="mb-6 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total surveys" value={stats.total} icon={ClipboardList} />
          <StatCard label="Submitted" value={stats.submitted} icon={FileCheck} tone="success" hint="Guard completed" />
          <StatCard label="Draft" value={stats.draft} icon={FilePen} tone="warning" hint="In progress on app" />
          <StatCard
            label="Submitted this week"
            value={stats.submittedThisWeek}
            icon={FileCheck}
            hint="Mon–Sun"
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Guard</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No guard submissions yet. Complete a survey in the guard app, then tap Refresh.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/corporate/site-surveys/${r.id}`)}
                  >
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell>{siteName(r)}</TableCell>
                    <TableCell className="text-sm">{r.createdByName ?? "—"}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.submittedAt ?? r.updatedAt}
                    </TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/corporate/site-surveys/${r.id}`)}
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/corporate/site-surveys/${r.id}`)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => void handleDelete(r, e)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
}
