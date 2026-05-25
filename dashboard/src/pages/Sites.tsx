import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, QrCode, Search } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Site, VisitorQrBundle } from "@/lib/mockData";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";

export default function Sites() {
  const [list, setList] = useState<Site[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrSite, setQrSite] = useState<Site | null>(null);
  const [qrBundle, setQrBundle] = useState<VisitorQrBundle | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrErr, setQrErr] = useState("");

  const loadSites = async () => {
    setList(await apiGet<Site[]>("/sites/"));
  };

  useEffect(() => {
    (async () => {
      try {
        await loadSites();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load sites");
      }
    })();
  }, []);

  const filtered = useMemo(() => list.filter((s) => s.name.toLowerCase().includes(q.toLowerCase())), [list, q]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setLocation("");
    setDescription("");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (site: Site) => {
    setEditingId(site.id);
    setName(site.name ?? "");
    setLocation(site.location ?? "");
    setDescription(site.description ?? "");
    setOpen(true);
  };

  const saveSite = async () => {
    if (!name.trim()) {
      toast.error("Site name is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
      };
      if (editingId) {
        await apiPut(`/sites/${editingId}/`, payload);
      } else {
        await apiPost("/sites-create/", payload);
      }
      await loadSites();
      setOpen(false);
      resetForm();
      toast.success(editingId ? "Site updated" : "Site created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save site");
    } finally {
      setSaving(false);
    }
  };

  const openVisitorQr = async (site: Site) => {
    setQrSite(site);
    setQrOpen(true);
    setQrErr("");
    setQrBundle(null);
    setQrLoading(true);
    try {
      const b = await apiGet<VisitorQrBundle>(`/sites/${site.id}/visitor-qr-bundle/`);
      setQrBundle(b);
    } catch (e) {
      setQrErr(e instanceof Error ? e.message : "Could not load QR bundle");
    } finally {
      setQrLoading(false);
    }
  };

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const signInUrl =
    qrBundle && origin ? `${origin}/v/check-in?t=${encodeURIComponent(qrBundle.checkInToken)}` : "";
  const signOutUrl =
    qrBundle && origin ? `${origin}/v/check-out?t=${encodeURIComponent(qrBundle.checkOutToken)}` : "";

  return (
    <DashboardLayout title="Sites">
      <p className="mb-4 text-sm text-muted-foreground">Create and manage sites from API.</p>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>Add site</Button>
      </div>
      <div className="relative mb-6 w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sites…" className="pl-9" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-muted-foreground">{s.location}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void openVisitorQr(s)}>
                    <QrCode className="mr-1 h-4 w-4" />
                    Site walk-in QR
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground">No sites found</p>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit site" : "Add site"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update site details." : "Create a new site for guard assignments and patrols."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 md:grid-cols-2">
            <Input placeholder="Site name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveSite} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update site" : "Create site"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Site walk-in visitor QR — {qrSite?.name ?? ""}</DialogTitle>
            <DialogDescription>
              For ad-hoc visitors at this site only (not tied to a registration link). For events, use{" "}
              <strong>Entrance Registration</strong> so each link gets its own sign-in and scan-out QRs. Print{" "}
              <strong>Sign in</strong> at the entrance and <strong>Visitors out</strong> at the exit; visitors receive a
              checkout code and enter it on the exit page (no cookies required).
            </DialogDescription>
          </DialogHeader>
          {qrLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {qrErr && <p className="text-sm text-destructive">{qrErr}</p>}
          {qrBundle && !qrLoading && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
                <div className="text-sm font-medium">Sign in</div>
                <QRCodeSVG value={signInUrl} size={180} level="M" includeMargin />
                <Button size="sm" variant="outline" onClick={() => void copyText("Sign-in URL", signInUrl)}>
                  Copy URL
                </Button>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-lg border p-4">
                <div className="text-sm font-medium">Visitors out</div>
                <QRCodeSVG value={signOutUrl} size={180} level="M" includeMargin />
                <Button size="sm" variant="outline" onClick={() => void copyText("Sign-out URL", signOutUrl)}>
                  Copy URL
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
