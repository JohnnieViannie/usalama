import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { MapPin } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckpointMapPicker } from "@/components/CheckpointMapPicker";
import type { Checkpoint, Site } from "@/lib/mockData";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";

export default function SiteDetails() {
  const { siteId = "" } = useParams();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [codeTouched, setCodeTouched] = useState(false);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const [siteSaving, setSiteSaving] = useState(false);
  const [siteStep, setSiteStep] = useState(0);
  const [siteName, setSiteName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteType, setSiteType] = useState<"building" | "compound" | "open_area" | "residential" | "other">("other");
  const [siteGeofenceEnabled, setSiteGeofenceEnabled] = useState(false);
  const [siteGeofenceLatitude, setSiteGeofenceLatitude] = useState("");
  const [siteGeofenceLongitude, setSiteGeofenceLongitude] = useState("");
  const [siteGeofenceRadiusM, setSiteGeofenceRadiusM] = useState("100");
  const [form, setForm] = useState({
    name: "",
    code: "",
    siteId: "",
    locationMode: "gps" as "gps" | "indoor",
    latitude: "",
    longitude: "",
    verifyRadiusM: "100",
    buildingBlock: "",
    floorLevel: "",
    zoneLabel: "",
  });

  const load = async () => {
    const [c, s] = await Promise.all([apiGet<Checkpoint[]>("/checkpoints/"), apiGet<Site[]>("/sites/")]);
    setCheckpoints(c);
    setSites(s);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const site = useMemo(() => sites.find((s) => s.id === siteId), [siteId, sites]);

  useEffect(() => {
    if (!loading && !site) {
      toast.error("Site not found");
      navigate("/checkpoints");
    }
  }, [loading, site, navigate]);

  const siteCheckpoints = useMemo(
    () =>
      checkpoints.filter((c) => c.siteId === siteId && (c.name.toLowerCase().includes(q.toLowerCase()) || c.code.toLowerCase().includes(q.toLowerCase()))),
    [checkpoints, q, siteId],
  );

  const suggestedCode = useMemo(() => {
    const sitePart = (site?.name || "site")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 20);
    const target = form.locationMode === "indoor" ? (form.zoneLabel || form.name) : form.name;
    const pointPart = (target || "checkpoint")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 28);
    const modePart = form.locationMode === "indoor" ? "indoor" : "gps";
    return `${sitePart}-${modePart}-${pointPart}`.replace(/-+/g, "-").slice(0, 64);
  }, [form.locationMode, form.name, form.zoneLabel, site?.name]);

  useEffect(() => {
    if (editingId) return;
    if (!codeTouched || !form.code.trim()) {
      setForm((prev) => ({ ...prev, code: suggestedCode }));
    }
  }, [suggestedCode, editingId, codeTouched, form.code]);

  const openCreate = () => {
    if (!site) return;
    const mode = site.siteType === "building" || site.siteType === "residential" ? "indoor" : "gps";
    setEditingId(null);
    setCodeTouched(false);
    setForm({
      name: "",
      code: "",
      siteId: site.id,
      locationMode: mode,
      latitude: site.geofenceLatitude != null ? String(site.geofenceLatitude) : "",
      longitude: site.geofenceLongitude != null ? String(site.geofenceLongitude) : "",
      verifyRadiusM: "100",
      buildingBlock: "",
      floorLevel: "",
      zoneLabel: "",
    });
    setModalOpen(true);
  };

  const editCheckpoint = (checkpoint: Checkpoint) => {
    setEditingId(checkpoint.id);
    setCodeTouched(true);
    setForm({
      name: checkpoint.name,
      code: checkpoint.code,
      siteId: checkpoint.siteId,
      locationMode: checkpoint.locationMode ?? "gps",
      latitude: checkpoint.latitude != null ? String(checkpoint.latitude) : "",
      longitude: checkpoint.longitude != null ? String(checkpoint.longitude) : "",
      verifyRadiusM: String(checkpoint.verifyRadiusM ?? 100),
      buildingBlock: checkpoint.buildingBlock ?? "",
      floorLevel: checkpoint.floorLevel ?? "",
      zoneLabel: checkpoint.zoneLabel ?? "",
    });
    setModalOpen(true);
  };

  const parseForm = () => {
    const r = Math.round(Number(form.verifyRadiusM) || 100);
    if (form.locationMode === "gps") {
      const lat = Number(form.latitude);
      const lon = Number(form.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
        return { ok: false as const, message: "Enter valid latitude and longitude." };
      }
      return { ok: true as const, lat, lon, verifyRadiusM: r };
    }
    return { ok: true as const, lat: null, lon: null, verifyRadiusM: r };
  };

  const saveCheckpoint = async () => {
    if (!site) return;
    const parsed = parseForm();
    if (!parsed.ok) {
      toast.error(parsed.message);
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        code: (form.code.trim() || suggestedCode).slice(0, 64),
        siteId: site.id,
        locationMode: form.locationMode,
        latitude: parsed.lat,
        longitude: parsed.lon,
        verifyRadiusM: parsed.verifyRadiusM,
        buildingBlock: form.buildingBlock.trim(),
        floorLevel: form.floorLevel.trim(),
        zoneLabel: form.zoneLabel.trim(),
      };
      if (editingId) {
        await apiPut(`/checkpoints/${editingId}/`, payload);
        toast.success("Checkpoint updated");
      } else {
        await apiPost("/checkpoints-create/", payload);
        toast.success("Checkpoint created");
      }
      setModalOpen(false);
      setEditingId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save checkpoint");
    } finally {
      setSaving(false);
    }
  };

  const removeCheckpoint = async (checkpoint: Checkpoint) => {
    try {
      await apiDelete(`/checkpoints/${checkpoint.id}/`);
      toast.success("Checkpoint deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete checkpoint");
    }
  };

  const downloadQr = (checkpointId: string, checkpointCode: string, checkpointName: string) => {
    const svg = document.getElementById(`qr-${checkpointId}`) as SVGSVGElement | null;
    if (!svg) {
      toast.error("QR code not found");
      return;
    }
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = (checkpointName || checkpointCode || "checkpoint-qr")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    a.href = url;
    a.download = `${safeName || "checkpoint-qr"}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openEditSite = () => {
    if (!site) return;
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
    if (!site) return;
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
      await apiPut(`/sites/${site.id}/`, payload);
      toast.success("Site updated");
      setSiteModalOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update site");
    } finally {
      setSiteSaving(false);
    }
  };

  if (loading || !site) {
    return <DashboardLayout title="Site Details"><div className="text-sm text-muted-foreground">Loading site...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout title={`${site.name} · Site Details`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button variant="outline" onClick={() => navigate("/checkpoints")}>Back to sites</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEditSite}>Edit site</Button>
          <Button onClick={openCreate}>Add checkpoint</Button>
        </div>
      </div>

      <div className="mb-4 rounded-xl border bg-card p-4">
        <div className="font-semibold">{site.name}</div>
        <div className="text-sm text-muted-foreground">{site.location || "No location"}</div>
        <div className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{(site.siteType ?? "other").replace("_", " ")}</div>
        <p className="mt-2 text-sm text-muted-foreground">{site.description || "No description"}</p>
        <div className="mt-1 text-xs text-muted-foreground">
          Shift geofence:{" "}
          {site.geofenceEnabled
            ? `${site.geofenceLatitude?.toFixed?.(5) ?? "—"}, ${site.geofenceLongitude?.toFixed?.(5) ?? "—"} · ${site.geofenceRadiusM ?? 100}m`
            : "Disabled"}
        </div>
      </div>

      <div className="relative mb-4 w-full max-w-sm">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search checkpoints..." />
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>QR</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Radius (m)</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {siteCheckpoints.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="w-[100px]">
                  <div className="flex justify-center rounded-md border bg-white p-1">
                    <QRCodeSVG id={`qr-${c.id}`} value={c.code} size={60} level="M" includeMargin={false} />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="max-w-[160px] font-mono text-xs">{c.code}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {c.locationMode === "indoor"
                    ? [c.buildingBlock, c.floorLevel, c.zoneLabel].filter(Boolean).join(" · ") || "Indoor"
                    : c.latitude != null && c.longitude != null
                      ? `${Number(c.latitude).toFixed(5)}, ${Number(c.longitude).toFixed(5)}`
                      : "—"}
                </TableCell>
                <TableCell>{c.verifyRadiusM ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => downloadQr(c.id, c.code, c.name)}>
                      Download QR
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => editCheckpoint(c)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => removeCheckpoint(c)}>Delete</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit checkpoint" : "Add checkpoint"}</DialogTitle>
            <DialogDescription>Create checkpoint QR for this site.</DialogDescription>
          </DialogHeader>
          <div className="mb-1 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
            <p>GPS checkpoints start from this site geofence center when available; you can refine by clicking the map.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Checkpoint name" />
            <Input
              value={form.code}
              onChange={(e) => {
                setCodeTouched(true);
                setForm((f) => ({ ...f, code: e.target.value }));
              }}
              placeholder="Code (string in QR)"
            />
            <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.locationMode} onChange={(e) => setForm((f) => ({ ...f, locationMode: e.target.value as "gps" | "indoor" }))}>
              <option value="gps">GPS (areas/perimeters)</option>
              <option value="indoor">Indoor (building floors/rooms)</option>
            </select>
            <Input value={form.verifyRadiusM} onChange={(e) => setForm((f) => ({ ...f, verifyRadiusM: e.target.value }))} placeholder="Allowed radius (meters)" type="number" />
            {form.locationMode === "gps" ? (
              <>
                <Input value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} placeholder="Latitude" type="number" step="any" />
                <Input value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} placeholder="Longitude" type="number" step="any" />
              </>
            ) : (
              <>
                <Input value={form.buildingBlock} onChange={(e) => setForm((f) => ({ ...f, buildingBlock: e.target.value }))} placeholder="Building/Block (optional)" />
                <Input value={form.floorLevel} onChange={(e) => setForm((f) => ({ ...f, floorLevel: e.target.value }))} placeholder="Floor (optional)" />
                <Input value={form.zoneLabel} onChange={(e) => setForm((f) => ({ ...f, zoneLabel: e.target.value }))} placeholder="Zone/Room/Area (optional, recommended)" />
              </>
            )}
          </div>
          {form.locationMode === "gps" && (
            <CheckpointMapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onPick={(lat, lng) => setForm((f) => ({ ...f, latitude: String(lat), longitude: String(lng) }))}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveCheckpoint} disabled={saving}>{saving ? "Saving..." : editingId ? "Update checkpoint" : "Create checkpoint"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={siteModalOpen} onOpenChange={setSiteModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit site</DialogTitle>
            <DialogDescription>Manage site details in steps.</DialogDescription>
          </DialogHeader>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Step {siteStep + 1} of 3</div>
          <div className="grid gap-4">
            {siteStep === 0 && (
              <>
                <div className="grid gap-2">
                  <Label>Site name</Label>
                  <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input value={siteLocation} onChange={(e) => setSiteLocation(e.target.value)} />
                </div>
              </>
            )}
            {siteStep === 1 && (
              <>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Site type</Label>
                  <select className="h-10 rounded-md border bg-background px-3 text-sm" value={siteType} onChange={(e) => setSiteType(e.target.value as "building" | "compound" | "open_area" | "residential" | "other")}>
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
                  <Input value={siteGeofenceLatitude} onChange={(e) => setSiteGeofenceLatitude(e.target.value)} placeholder="Geofence latitude" type="number" step="any" />
                  <Input value={siteGeofenceLongitude} onChange={(e) => setSiteGeofenceLongitude(e.target.value)} placeholder="Geofence longitude" type="number" step="any" />
                  <Input value={siteGeofenceRadiusM} onChange={(e) => setSiteGeofenceRadiusM(e.target.value)} placeholder="Radius (m)" type="number" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={siteSaving} onClick={() => setSiteModalOpen(false)}>Cancel</Button>
            {siteStep > 0 && <Button variant="outline" onClick={() => setSiteStep((s) => Math.max(0, s - 1))}>Back</Button>}
            {siteStep < 2 ? (
              <Button onClick={() => setSiteStep((s) => Math.min(2, s + 1))}>Next</Button>
            ) : (
              <Button onClick={saveSite} disabled={siteSaving}>{siteSaving ? "Saving..." : "Update site"}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
