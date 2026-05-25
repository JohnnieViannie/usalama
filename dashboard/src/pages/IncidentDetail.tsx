import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  clientFacingSummary,
  IncidentBadges,
  incidentMediaUrls,
  MediaGallery,
  PayloadSections,
} from "@/components/incidents/incidentDetailShared";
import type { Guard, Incident, Site } from "@/lib/mockData";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { createIncidentInvestigation } from "@/lib/incidentInvestigationApi";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft, FileSearch, Loader2 } from "lucide-react";

export default function IncidentDetail() {
  const { incidentId } = useParams<{ incidentId: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [policeEmail, setPoliceEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusAction, setStatusAction] = useState(false);
  const [deleteAction, setDeleteAction] = useState(false);
  const [policeAction, setPoliceAction] = useState<"idle" | "sending" | "sent">("idle");
  const [investigationAction, setInvestigationAction] = useState(false);

  useEffect(() => {
    if (!incidentId) return;
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [incidents, g, s] = await Promise.all([
          apiGet<Incident[]>("/incidents/"),
          apiGet<Guard[]>("/guards/"),
          apiGet<Site[]>("/sites/"),
        ]);
        const row = incidents.find((i) => i.id === incidentId);
        if (!active) return;
        if (!row) {
          setIncident(null);
          setLoading(false);
          return;
        }
        setIncident(row);
        setGuards(g);
        setSites(s);
        if ((row as Incident & { unread?: boolean }).unread) {
          await apiPost("/incidents/mark-read/", { incidentIds: [row.id] });
        }
        try {
          const settings = await apiGet<{ policeEmail?: string }>("/company-settings/");
          setPoliceEmail(settings.policeEmail ?? "");
        } catch {
          setPoliceEmail("");
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load incident");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [incidentId]);

  const mediaList = useMemo(() => (incident ? incidentMediaUrls(incident) : []), [incident]);

  const findGuard = (id: string) => guards.find((g) => g.id === id);
  const findSite = (id: string) => sites.find((x) => x.id === id);

  const setStatus = async (nextStatus: "open" | "closed") => {
    if (!incident) return;
    setStatusAction(true);
    try {
      await apiPost(`/incidents/${incident.id}/status/`, { status: nextStatus });
      setIncident({ ...incident, status: nextStatus });
      toast.success(`Incident marked ${nextStatus}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update incident");
    } finally {
      setStatusAction(false);
    }
  };

  const deleteIncident = async () => {
    if (!incident || !window.confirm("Delete this incident and all attached files?")) return;
    setDeleteAction(true);
    try {
      await apiDelete(`/incidents/${incident.id}/`);
      toast.success("Incident deleted");
      navigate("/incidents");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete incident");
      setDeleteAction(false);
    }
  };

  const startOrOpenInvestigation = async () => {
    if (!incident) return;
    if (incident.investigationId) {
      navigate(`/incidents/investigations/${incident.investigationId}`);
      return;
    }
    setInvestigationAction(true);
    try {
      const inv = await createIncidentInvestigation(incident.id);
      setIncident({
        ...incident,
        investigationId: String(inv.id),
        investigationStatus: inv.status,
        investigationNumber: inv.investigationNumber,
      });
      navigate(`/incidents/investigations/${inv.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start investigation");
    } finally {
      setInvestigationAction(false);
    }
  };

  const reportToPolice = async () => {
    if (!incident) return;
    if (!policeEmail.trim()) {
      toast.error("Set police email first in Settings");
      return;
    }
    setPoliceAction("sending");
    try {
      await apiPost(`/incidents/${incident.id}/report-to-police/`, {
        policeEmail: policeEmail.trim(),
      });
      toast.success("Incident reported to police");
      setPoliceAction("sent");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send police report");
      setPoliceAction("idle");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Incident">
        <div className="flex items-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      </DashboardLayout>
    );
  }

  if (!incident) {
    return (
      <DashboardLayout title="Incident not found">
        <div className="p-4 space-y-4">
          <p className="text-muted-foreground">This incident could not be found.</p>
          <Button variant="outline" asChild>
            <Link to="/incidents"><ArrowLeft className="mr-1 h-4 w-4" /> Back to incidents</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={incident.title || "Incident details"}>
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/incidents">
            <ArrowLeft className="mr-1 h-4 w-4" /> All incidents
          </Link>
        </Button>

        {(incident.imageUrl || mediaList.length > 0) && (
          <div className="space-y-2">
            {incident.imageUrl && (
              <img
                src={incident.imageUrl}
                alt=""
                className="max-h-80 w-full rounded-lg object-cover"
                loading="lazy"
              />
            )}
            <MediaGallery urls={mediaList} />
          </div>
        )}

        <IncidentBadges incident={incident} />

        <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">Guard</div>
            <div className="font-medium">{incident.guardName ?? findGuard(incident.guardId)?.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Site</div>
            <div className="font-medium">{findSite(incident.siteId)?.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Time</div>
            <div className="font-medium">{format(new Date(incident.timestamp), "PPpp")}</div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="text-xs font-medium text-muted-foreground">Client-facing summary</div>
          <p className="mt-2 text-sm leading-relaxed">{clientFacingSummary(incident)}</p>
        </div>

        <PayloadSections payload={incident.payload} fallbackDescription={incident.description} />

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <Button
            variant="secondary"
            onClick={() => void startOrOpenInvestigation()}
            disabled={investigationAction}
          >
            {investigationAction ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <FileSearch className="mr-1 h-4 w-4" />
            )}
            {incident.investigationId ? "Open investigation" : "Start investigation"}
          </Button>
          <Button variant="outline" onClick={() => void reportToPolice()} disabled={policeAction === "sending" || policeAction === "sent"}>
            {policeAction === "sending" ? "Sending…" : policeAction === "sent" ? "Sent to police" : "Report to police"}
          </Button>
          {incident.status !== "closed" ? (
            <Button onClick={() => void setStatus("closed")} disabled={statusAction}>
              {statusAction ? "Updating…" : "Mark closed"}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => void setStatus("open")} disabled={statusAction}>
              {statusAction ? "Updating…" : "Reopen"}
            </Button>
          )}
          <Button variant="destructive" onClick={() => void deleteIncident()} disabled={deleteAction}>
            {deleteAction ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
