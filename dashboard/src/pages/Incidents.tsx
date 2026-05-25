import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { classificationLabel, severityLabel } from "@/components/incidents/incidentDetailShared";
import type { Guard, Incident, Site } from "@/lib/mockData";
import { apiGet, apiPost } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import EmptyState from "@/components/EmptyState";
import { FileWarning } from "lucide-react";

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    (async () => {
      try {
        setLoadState("loading");
        const [i, g, s] = await Promise.all([
          apiGet<Incident[]>("/incidents/"),
          apiGet<Guard[]>("/guards/"),
          apiGet<Site[]>("/sites/"),
        ]);
        setIncidents(i);
        setGuards(g);
        setSites(s);
        const unreadIds = i.filter((row) => (row as Incident & { unread?: boolean }).unread).map((row) => row.id);
        if (unreadIds.length) {
          await apiPost<{ ok: boolean }>("/incidents/mark-read/", { incidentIds: unreadIds });
        }
        setLoadState("ready");
      } catch (e) {
        setLoadState("error");
        toast.error(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  const findGuard = (id: string) => guards.find((g) => g.id === id);
  const findSite = (id: string) => sites.find((x) => x.id === id);

  return (
    <DashboardLayout title="Incident Reports">
      {loadState === "loading" ? (
        <div className="p-4 text-sm text-muted-foreground">Loading incident reports...</div>
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={FileWarning}
          title="No incidents yet"
          description="Incident reports submitted by guards from the mobile app appear here after sync. Once field teams submit a report, you will see full details, media, and status controls in this page."
          actionLabel="Manage guards"
          actionTo="/guards"
        />
      ) : (
        <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {incidents.map((i) => (
            <Link
              key={i.id}
              to={`/incidents/${i.id}`}
              className="overflow-hidden rounded-xl border bg-card text-left shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elegant)]"
            >
              {i.imageUrl && (
                <img src={i.imageUrl} alt="Incident" className="h-40 w-full object-cover" loading="lazy" />
              )}
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{format(new Date(i.timestamp), "MMM d, yyyy · HH:mm")}</div>
                <div className="mt-1 font-medium">{findSite(i.siteId)?.name}</div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{i.title || i.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {classificationLabel(i) && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      {classificationLabel(i)}
                    </Badge>
                  )}
                  {severityLabel(i) && (
                    <Badge variant="secondary" className="text-[10px] font-normal uppercase">
                      {severityLabel(i)}
                    </Badge>
                  )}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Reported by {i.guardName ?? findGuard(i.guardId)?.name}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant={i.status === "closed" ? "secondary" : "destructive"}>
                    {i.status === "closed" ? "Closed" : "Open"}
                  </Badge>
                  {i.investigationNumber && (
                    <Badge variant="outline" className="text-[10px]">
                      {i.investigationNumber}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
