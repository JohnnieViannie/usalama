import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Checkpoint, Site } from "@/lib/mockData";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";
import { Search } from "lucide-react";

export default function Checkpoints() {
  const navigate = useNavigate();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [q, setQ] = useState("");
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteEditingId, setSiteEditingId] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteType, setSiteType] = useState<"building" | "compound" | "open_area" | "residential" | "other">("other");
  const [siteGeofenceEnabled, setSiteGeofenceEnabled] = useState(false);
  const [siteGeofenceLatitude, setSiteGeofenceLatitude] = useState("");
  const [siteGeofenceLongitude, setSiteGeofenceLongitude] = useState("");
  const [siteGeofenceRadiusM, setSiteGeofenceRadiusM] = useState("100");
  const [siteStep, setSiteStep] = useState(0);

  const load = async () => {
    const [c, s] = await Promise.all([apiGet<Checkpoint[]>("/checkpoints/"), apiGet<Site[]>("/sites/")]);
    setCheckpoints(c);
    setSites(s);
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  const filteredSites = useMemo(
    () => sites.filter((s) => `${s.name} ${s.location}`.toLowerCase().includes(q.toLowerCase())),
    [sites, q],
  );

  const openCreateSite = () => {
    setSiteEditingId(null);
    setSiteName("");
    setSiteLocation("");
    setSiteDescription("");
    setSiteType("other");
    setSiteGeofenceEnabled(false);
    setSiteGeofenceLatitude("");
    setSiteGeofenceLongitude("");
    setSiteGeofenceRadiusM("100");
    setSiteStep(0);
    setSiteModalOpen(true);
  };

  const openEditSite = (site: Site) => {
    setSiteEditingId(site.id);
    setSiteName(site.name ?? "");
    setSiteLocation(site.location ?? "");
    setSiteDescription(site.description ?? "");
    setSiteType(site.siteType ?? "other");
    setSiteGeofenceEnabled(Boolean(site.geofenceEnabled));
    setSiteGeofenceLatitude(site.geofenceLatitude != null ? String(site.geofenceLatitude) : "");
    setSiteGeofenceLongitude(site.geofenceLongitude != null ? String(site.geofenceLongitude) : "");
    setSiteGeofenceRadiusM(String(site.geofenceRadiusM ?? 100));
    setSiteStep(0);
    setSiteModalOpen(true);
  };

  const saveSite = async () => {
    if (!siteName.trim()) {
      toast.error("Site name is required");
      return;
    }
    try {
      setSiteSaving(true);
      const payload = {
        name: siteName.trim(),
        location: siteLocation.trim(),
        description: siteDescription.trim(),
        siteType,
        geofenceEnabled: siteGeofenceEnabled,
        geofenceLatitude: siteGeofenceEnabled ? Number(siteGeofenceLatitude) : null,
        geofenceLongitude: siteGeofenceEnabled ? Number(siteGeofenceLongitude) : null,
        geofenceRadiusM: Math.round(Number(siteGeofenceRadiusM) || 100),
      };
      if (siteEditingId) {
        await apiPut(`/sites/${siteEditingId}/`, payload);
        toast.success("Site updated");
      } else {
        await apiPost("/sites-create/", payload);
        toast.success("Site created");
      }
      setSiteModalOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save site");
    } finally {
      setSiteSaving(false);
    }
  };

  return (
    <DashboardLayout title="Sites">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Open a site to manage all checkpoint QR points in one place.</p>
        <Button onClick={openCreateSite}>Add site</Button>
      </div>

      <div className="relative mb-4 w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sites..." className="pl-9" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredSites.map((s) => (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] transition hover:border-primary/40"
            onClick={() => navigate(`/checkpoints/${s.id}`)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate(`/checkpoints/${s.id}`);
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.location || "No location"}</div>
                <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {(s.siteType ?? "other").replace("_", " ")}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description || "No description"}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  {checkpoints.filter((c) => c.siteId === s.id).length} checkpoints
                </div>
                <div className="mt-1 text-xs text-primary/80">Click card to view site details →</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditSite(s);
                }}
              >
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={siteModalOpen} onOpenChange={setSiteModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{siteEditingId ? "Edit site" : "Add site"}</DialogTitle>
            <DialogDescription>Manage site details in steps. Two inputs per step for easier setup.</DialogDescription>
          </DialogHeader>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Step {siteStep + 1} of 3
          </div>
          <div className="grid gap-4">
            {siteStep === 0 && (
              <>
                <div className="grid gap-2">
                  <Label>Site name</Label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="Site name" />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input value={siteLocation} onChange={(e) => setSiteLocation(e.target.value)} placeholder="Location" />
                </div>
              </>
            )}
            {siteStep === 1 && (
              <>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} placeholder="Description" />
                </div>
                <div className="grid gap-2">
                  <Label>Site type</Label>
                  <select
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={siteType}
                    onChange={(e) =>
                      setSiteType(e.target.value as "building" | "compound" | "open_area" | "residential" | "other")
                    }
                  >
                    <option value="building">Building</option>
                    <option value="compound">Compound/Campus</option>
                    <option value="open_area">Open area/perimeter</option>
                    <option value="residential">Residential estate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}
            {siteStep === 2 && (
              <div className="rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Label>Start Shift Validation Area</Label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={siteGeofenceEnabled} onChange={(e) => setSiteGeofenceEnabled(e.target.checked)} />
                    Enabled
                  </label>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    value={siteGeofenceLatitude}
                    onChange={(e) => setSiteGeofenceLatitude(e.target.value)}
                    placeholder="Geofence latitude"
                    type="number"
                    step="any"
                  />
                  <Input
                    value={siteGeofenceLongitude}
                    onChange={(e) => setSiteGeofenceLongitude(e.target.value)}
                    placeholder="Geofence longitude"
                    type="number"
                    step="any"
                  />
                  <Input
                    value={siteGeofenceRadiusM}
                    onChange={(e) => setSiteGeofenceRadiusM(e.target.value)}
                    placeholder="Radius (m)"
                    type="number"
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={siteSaving}
              onClick={() => {
                setSiteModalOpen(false);
                setSiteStep(0);
              }}
            >
              Cancel
            </Button>
            {siteStep > 0 && (
              <Button variant="outline" disabled={siteSaving} onClick={() => setSiteStep((s) => Math.max(0, s - 1))}>
                Back
              </Button>
            )}
            {siteStep < 2 ? (
              <Button disabled={siteSaving} onClick={() => setSiteStep((s) => Math.min(2, s + 1))}>
                Next
              </Button>
            ) : (
              <Button disabled={siteSaving} onClick={saveSite}>
                {siteSaving ? "Saving..." : siteEditingId ? "Update site" : "Create site"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
