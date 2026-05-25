import { useEffect, useMemo, useState } from "react";
import { format, startOfDay } from "date-fns";
import DashboardLayout from "@/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { apiDelete, apiGet, apiGetAllow404, apiPost, apiPut } from "@/lib/api";
import type { LinkVisitorStats, RegistrationField, RegistrationLink, Site } from "@/lib/mockData";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, Link2 } from "lucide-react";

type EditableField = RegistrationField & { localId: string };

export default function EntranceAnalytics() {
  const navigate = useNavigate();
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [error, setError] = useState<string>("");
  const [title, setTitle] = useState("");
  const [eventName, setEventName] = useState("");
  const [siteId, setSiteId] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fields, setFields] = useState<EditableField[]>([
    { localId: crypto.randomUUID(), key: "full_name", label: "Full Name", type: "text", required: true },
    { localId: crypto.randomUUID(), key: "phone", label: "Phone", type: "phone", required: false },
  ]);
  const [linkVisitorStats, setLinkVisitorStats] = useState<Record<number, LinkVisitorStats | null>>({});
  const [visitorStatsLoading, setVisitorStatsLoading] = useState(false);

  const loadLinks = async () => {
    try {
      const [rows, allSites] = await Promise.all([
        apiGet<RegistrationLink[]>("/registration-links/"),
        apiGet<Site[]>("/sites/"),
      ]);
      setLinks(rows);
      setSites(allSites);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load registration links");
    }
  };

  useEffect(() => {
    void loadLinks();
  }, []);

  useEffect(() => {
    if (links.length === 0) {
      setLinkVisitorStats({});
      setVisitorStatsLoading(false);
      return;
    }
    let cancelled = false;
    setVisitorStatsLoading(true);
    const kFrom = startOfDay(new Date()).toISOString();
    const kTo = new Date().toISOString();
    const q = `from=${encodeURIComponent(kFrom)}&to=${encodeURIComponent(kTo)}`;
    (async () => {
      const entries = await Promise.all(
        links.map(async (l) => {
          const path = `/registration-links/${l.id}/visitor-stats/?${q}`;
          const remote = await apiGetAllow404<LinkVisitorStats>(path);
          return [l.id, remote] as const;
        }),
      );
      if (cancelled) return;
      setLinkVisitorStats(Object.fromEntries(entries) as Record<number, LinkVisitorStats | null>);
      setVisitorStatsLoading(false);
    })();
    return () => {
      cancelled = true;
      setVisitorStatsLoading(false);
    };
  }, [links]);

  const totalSubmissions = useMemo(
    () => links.reduce((sum, l) => sum + (l.submissionCount ?? 0), 0),
    [links],
  );

  const addField = () => {
    setFields((prev) => [
      ...prev,
      {
        localId: crypto.randomUUID(),
        key: `field_${prev.length + 1}`,
        label: `Field ${prev.length + 1}`,
        type: "text",
        required: false,
      },
    ]);
  };

  const setField = (idx: number, patch: Partial<RegistrationField>) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };

  const removeField = (idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const createLink = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (fields.length === 0) {
      toast.error("Add at least one field");
      return;
    }
    setSaving(true);
    try {
      await apiPost<RegistrationLink>("/registration-links/", {
        title: title.trim(),
        eventName: eventName.trim(),
        siteId: siteId.trim(),
        fields: fields.map(({ key, label, type, required }) => ({ key, label, type, required })),
      });
      resetForm();
      await loadLinks();
      toast.success("Registration link created");
      setShowModal(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create link");
    } finally {
      setSaving(false);
    }
  };

  const updateLink = async () => {
    if (!editingId) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (fields.length === 0) {
      toast.error("Add at least one field");
      return;
    }
    setSaving(true);
    try {
      await apiPut<RegistrationLink>(`/registration-links/${editingId}/update/`, {
        title: title.trim(),
        eventName: eventName.trim(),
        siteId: siteId.trim(),
        fields: fields.map(({ key, label, type, required }) => ({ key, label, type, required })),
      });
      await loadLinks();
      toast.success("Registration link updated");
      setShowModal(false);
      resetForm();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update link");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setEventName("");
    setSiteId("");
    setFields([
      { localId: crypto.randomUUID(), key: "full_name", label: "Full Name", type: "text", required: true },
      { localId: crypto.randomUUID(), key: "phone", label: "Phone", type: "phone", required: false },
    ]);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (link: RegistrationLink) => {
    setEditingId(link.id);
    setTitle(link.title ?? "");
    setEventName(link.eventName ?? "");
    setSiteId(link.siteId ?? "");
    setFields(
      (link.fields || []).map((f) => ({
        ...f,
        localId: crypto.randomUUID(),
      })),
    );
    setShowModal(true);
  };

  const deleteLink = async (linkId: number) => {
    if (!window.confirm("Delete this registration link and all submitted data?")) return;
    try {
      await apiDelete<{ ok: boolean }>(`/registration-links/${linkId}/`);
      await loadLinks();
      toast.success("Registration link deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete link");
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Registration link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const registrationUrl = (link: RegistrationLink) =>
    `${window.location.origin}/register/${link.token}`;

  const visitorInUrl = (link: RegistrationLink) =>
    `${window.location.origin}/register/${link.token}/visitor-in`;

  const visitorOutUrl = (link: RegistrationLink) =>
    `${window.location.origin}/register/${link.token}/visitor-out`;

  const shareLink = async (link: RegistrationLink) => {
    const url = registrationUrl(link);
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.title,
          text: link.eventName || "Registration link",
          url,
        });
        return;
      } catch {
        // fall through to copy fallback
      }
    }
    await copyLink(url);
  };

  const downloadQr = async (elementId: string, filenameBase: string) => {
    try {
      const svgEl = document.getElementById(elementId)?.querySelector("svg");
      if (!svgEl) throw new Error("QR not found");
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgEl);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          toast.error("Failed to create QR image");
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 128, 128, 768, 768);
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${filenameBase.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("QR code downloaded");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error("Failed to generate QR image");
      };
      img.src = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to download QR");
    }
  };

  return (
    <DashboardLayout title="Entrance Registration">
      <p className="mb-4 text-sm text-muted-foreground">
        Each registration link has its own form QR, visitor sign-in QR, and scan-out QR. Visitor in / out / still
        inside counts below are <span className="font-medium text-foreground">per link</span> (today). Optional
        site-wide walk-in QRs live under{" "}
        <Link to="/sites" className="font-medium text-primary underline-offset-2 hover:underline">
          Sites → Site walk-in QR
        </Link>
        .
      </p>

      <div className="mb-6 grid min-w-0 gap-4 sm:grid-cols-2">
        <StatCard label="Active links" value={links.length} icon={Link2} hint="Registration URLs" />
        <StatCard label="Form submissions" value={totalSubmissions} icon={ClipboardList} hint="All links" />
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Registration links</h3>
          <button
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            onClick={openCreate}
          >
            Create custom link
          </button>
        </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          <div className="mt-3 space-y-3">
            {links.map((link) => {
              const vs = linkVisitorStats[link.id];
              return (
              <div key={link.id} className="rounded-lg border p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{link.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {link.eventName || "No event name"}{link.siteName ? ` · ${link.siteName}` : ""}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {link.submissionCount ?? 0} submissions · {format(new Date(link.created_at), "PPpp")}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {visitorStatsLoading ? (
                        <>Visitor stats: loading…</>
                      ) : vs ? (
                        <>
                          Visitors today: <span className="font-medium text-foreground">{vs.visitorsIn}</span> in ·{" "}
                          <span className="font-medium text-foreground">{vs.visitorsOut}</span> out ·{" "}
                          <span className="font-medium text-foreground">{vs.visitorsOpenInside}</span> still inside
                        </>
                      ) : (
                        <>
                          Visitor stats: — (deploy the per-link{" "}
                          <code className="rounded bg-muted px-1">visitor-stats</code> API for registration links)
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 border-t pt-3 lg:border-t-0 lg:pt-0">
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-center text-[10px] font-medium uppercase text-muted-foreground">Form</div>
                      <div id={`qr-form-${link.id}`}>
                        <QRCodeSVG value={registrationUrl(link)} size={72} />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-center text-[10px] font-medium uppercase text-muted-foreground">Sign in</div>
                      <div id={`qr-vin-${link.id}`}>
                        <QRCodeSVG value={visitorInUrl(link)} size={72} />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-center text-[10px] font-medium uppercase text-muted-foreground">Scan out</div>
                      <div id={`qr-vout-${link.id}`}>
                        <QRCodeSVG value={visitorOutUrl(link)} size={72} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => void copyLink(registrationUrl(link))}
                  >
                    Copy form URL
                  </button>
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => void copyLink(visitorInUrl(link))}
                  >
                    Copy sign-in URL
                  </button>
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => void copyLink(visitorOutUrl(link))}
                  >
                    Copy scan-out URL
                  </button>
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => void shareLink(link)}
                  >
                    Share form
                  </button>
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => void downloadQr(`qr-form-${link.id}`, `${link.title || "form"}-form`)}
                  >
                    Download form QR
                  </button>
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => void downloadQr(`qr-vin-${link.id}`, `${link.title || "link"}-visitor-in`)}
                  >
                    Download sign-in QR
                  </button>
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => void downloadQr(`qr-vout-${link.id}`, `${link.title || "link"}-visitor-out`)}
                  >
                    Download scan-out QR
                  </button>
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => navigate(`/registration-links/${link.id}/submissions`)}
                  >
                    View  data
                  </button>
                  <button
                    className="rounded-md border px-2 py-1 text-xs"
                    onClick={() => openEdit(link)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-md border border-destructive px-2 py-1 text-xs text-destructive"
                    onClick={() => void deleteLink(link.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              );
            })}
            {links.length === 0 && (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No registration links yet.
              </div>
            )}
          </div>
      </div>

      <Dialog open={showModal} onOpenChange={(open) => { setShowModal(open); if (!open) resetForm(); }}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit registration link" : "Create registration link"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Link title (e.g. AGM Visitors)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Event name (optional)"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
            >
              <option value="">Company-wide (no specific site)</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            <div className="rounded-lg border p-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Custom fields</div>
              <div className="space-y-2">
                {fields.map((field, idx) => (
                  <div key={field.localId} className="grid gap-2 rounded-md border p-2 md:grid-cols-[1.2fr_1.2fr_0.9fr_auto_auto]">
                    <input
                      className="rounded border bg-background px-2 py-1 text-xs"
                      placeholder="Key (e.g. full_name)"
                      value={field.key}
                      onChange={(e) => setField(idx, { key: e.target.value })}
                    />
                    <input
                      className="rounded border bg-background px-2 py-1 text-xs"
                      placeholder="Label"
                      value={field.label}
                      onChange={(e) => setField(idx, { label: e.target.value })}
                    />
                    <select
                      className="rounded border bg-background px-2 py-1 text-xs"
                      value={field.type}
                      onChange={(e) => setField(idx, { type: e.target.value as RegistrationField["type"] })}
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Long text</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="number">Number</option>
                      <option value="datetime">Date/Time</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={Boolean(field.required)}
                        onChange={(e) => setField(idx, { required: e.target.checked })}
                      />
                      Required
                    </label>
                    <button className="text-xs text-destructive underline" onClick={() => removeField(idx)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button className="mt-2 text-xs text-primary underline" onClick={addField}>
                + Add field
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="rounded-md border px-3 py-2 text-sm"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-60"
                disabled={saving}
                onClick={() => void (editingId ? updateLink() : createLink())}
              >
                {saving ? (editingId ? "Saving..." : "Creating...") : (editingId ? "Save changes" : "Create link + QR")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
