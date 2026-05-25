import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, X, User, CheckCircle, ShieldCheck, ShieldOff } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Guard, Site } from "@/lib/mockData";
import { apiGet, apiPost } from "@/lib/api";
import { guardStatusBadge } from "@/lib/guardStatus";
import { toast } from "sonner";

const onboardingBadge = (status?: string) => {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/15 px-2.5 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            <span>Pending</span>
          </div>
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15 px-2.5 py-0.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" />
            <span>Approved</span>
          </div>
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/15 px-2.5 py-0.5">
          <div className="flex items-center gap-1.5">
            <ShieldOff className="h-3 w-3" />
            <span>Rejected</span>
          </div>
        </Badge>
      );
    default:
      return (
        <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 hover:bg-slate-500/15 px-2.5 py-0.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3" />
            <span>Approved</span>
          </div>
        </Badge>
      );
  }
};

export default function Guards() {
  const [list, setList] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [q, setQ] = useState("");
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<Guard | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [linking, setLinking] = useState(false);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");
  const [lookupResult, setLookupResult] = useState<Guard | null>(null);
  const [lookupLinkedClientId, setLookupLinkedClientId] = useState<string | null>(null);
  const [selectedSiteByGuard, setSelectedSiteByGuard] = useState<Record<string, string>>({});
  const [fullImageOpen, setFullImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const [g, s] = await Promise.all([apiGet<Guard[]>("/guards/"), apiGet<Site[]>("/sites/")]);
        setList(g);
        setSites(s);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load guards");
      }
    })();
  }, []);

  const findSite = (id: string | null) => (id ? sites.find((s) => s.id === id) : undefined);

  const filtered = useMemo(() => list.filter((g) => g.name.toLowerCase().includes(q.toLowerCase()) || g.phone.includes(q)), [list, q]);

  const refresh = async () => {
    const [g, s] = await Promise.all([apiGet<Guard[]>("/guards/"), apiGet<Site[]>("/sites/")]);
    setList(g);
    setSites(s);
    setSelectedSiteByGuard((prev) => {
      const finalNext: Record<string, string> = { ...prev };
      for (const guard of g) {
        if (!finalNext[guard.id] && guard.siteId) {
          finalNext[guard.id] = guard.siteId;
        }
      }
      return finalNext;
    });
  };

  const lookupGuard = async () => {
    if (!lookupEmail.trim() && !lookupPhone.trim()) return;
    try {
      const data = await apiGet<{
        registered: boolean;
        email?: string;
        name?: string;
        phone?: string;
        companyName?: string;
        onboardingStatus?: "pending" | "approved" | "rejected";
        siteId?: string | null;
        linkedClientId?: string | number | null;
      }>(
        `/guard-registration-status/?${lookupEmail.trim()
          ? `email=${encodeURIComponent(lookupEmail.trim())}`
          : `phone=${encodeURIComponent(lookupPhone.trim())}`
        }`,
      );
      if (!data.registered) {
        setLookupResult(null);
        setLookupLinkedClientId(null);
        toast.error("No guard registration found");
        return;
      }
      const linkedClientId = data.linkedClientId != null ? String(data.linkedClientId) : null;
      setLookupLinkedClientId(linkedClientId);
      setLookupResult({
        id: data.email ?? lookupPhone.trim(),
        name: data.name ?? data.email ?? "Guard",
        phone: data.phone ?? "",
        status: "inactive",
        siteId: data.siteId ?? null,
        email: data.email,
        companyName: data.companyName,
        onboardingStatus: data.onboardingStatus,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Lookup failed");
    }
  };

  const linkGuard = async () => {
    if (!lookupResult) return;
    setLinking(true);
    try {
      await apiPost("/guard-link/", {
        email: lookupResult.email,
        phone: lookupResult.phone,
      });
      toast.success("Guard linked to your company");
      await refresh();
      await lookupGuard();
      setLinkModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to link guard");
    } finally {
      setLinking(false);
    }
  };

  const unlinkGuard = async (payload: { email?: string; phone?: string }) => {
    if (!payload.email && !payload.phone) {
      toast.error("Guard email or phone is required to remove");
      return;
    }
    try {
      await apiPost("/guard-unlink/", payload);
      toast.success("Guard removed from your company");
      await refresh();
      if (lookupResult) await lookupGuard();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove guard");
    }
  };

  const assignSite = async (guard: Guard) => {
    const siteId = selectedSiteByGuard[guard.id] ?? guard.siteId ?? "";
    if (!siteId) {
      toast.error("Select a site first");
      return;
    }
    if (!guard.email && !guard.phone) {
      toast.error("Guard email or phone is required");
      return;
    }
    try {
      await apiPost("/guard-link/", {
        email: guard.email,
        phone: guard.phone,
        siteId,
      });
      toast.success("Guard site assigned");
      await refresh();
      if (lookupResult) await lookupGuard();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign site");
    }
  };

  const openEdit = (guard: Guard) => {
    setEditingGuard(guard);
    setSelectedSiteByGuard((prev) => ({
      ...prev,
      [guard.id]: prev[guard.id] ?? guard.siteId ?? "",
    }));
    setEditModalOpen(true);
  };

  const saveGuardEdit = async () => {
    if (!editingGuard) return;
    setSavingEdit(true);
    try {
      await assignSite(editingGuard);
      setEditModalOpen(false);
      setEditingGuard(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const openFullImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setFullImageOpen(true);
  };

  const handlePassportImageError = (guardId: string) => {
    setList((prev) =>
      prev.map((guard) =>
        guard.id === guardId ? { ...guard, passportImage: null } : guard,
      ),
    );
  };

  const renderPassportFallback = (size: "sm" | "md") => {
    const cls =
      size === "md"
        ? "h-16 w-16 rounded-full bg-muted flex items-center justify-center border-2 border-border"
        : "h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border";
    const iconSize = size === "md" ? "h-8 w-8" : "h-5 w-5";
    return (
      <div className={cls}>
        <User className={`${iconSize} text-muted-foreground`} />
      </div>
    );
  };

  return (
    <DashboardLayout title="Guards">
      <p className="mb-4 text-sm text-muted-foreground">Link registered guards to your company by email or phone.</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guards…" className="pl-9" />
        </div>
        <Button onClick={() => setLinkModalOpen(true)}>Add / Link guard</Button>
      </div>

      <div className="mobile-only-cards mt-4 mobile-card-list">
        {filtered.map((g) => (
          <div key={g.id} className="mobile-data-card">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {g.passportImage ? (
                  <div
                    className="cursor-pointer"
                    onClick={() => openFullImage(g.passportImage!)}
                  >
                    <img
                      src={g.passportImage}
                      alt="Passport"
                      className="h-16 w-16 rounded-full object-cover border-2 border-border hover:border-primary transition-all"
                      onError={() => handlePassportImageError(g.id)}
                    />
                  </div>
                ) : (
                  renderPassportFallback("md")
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{g.name}</div>
                    <div className="mobile-kv mt-1">{g.email ?? "—"}</div>
                    <div className="mobile-kv">{g.phone}</div>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end">
                    {guardStatusBadge(g.status)}
                    {onboardingBadge(g.onboardingStatus)}
                  </div>
                </div>
                <div className="mt-3 mobile-kv">Site: {findSite(g.siteId)?.name ?? "—"}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(g)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unlinkGuard({ email: g.email, phone: g.phone })}
                    disabled={!g.linkedClientId}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground">No guards found</p>}
      </div>

      <div className="desktop-only-table mt-4 rounded-xl border bg-card shadow-[var(--shadow-card)] overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Onboarding</TableHead>
              <TableHead>Assigned Site</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((g) => (
              <TableRow key={g.id}>
                <TableCell>
                  {g.passportImage ? (
                    <div
                      className="cursor-pointer inline-block"
                      onClick={() => openFullImage(g.passportImage!)}
                    >
                      <img
                        src={g.passportImage}
                        alt="Passport"
                        className="h-10 w-10 rounded-full object-cover border border-border hover:border-primary transition-all hover:scale-105"
                        onError={() => handlePassportImageError(g.id)}
                      />
                    </div>
                  ) : (
                    renderPassportFallback("sm")
                  )}
                </TableCell>
                <TableCell className="font-medium">{g.name}</TableCell>
                <TableCell className="text-muted-foreground">{g.email ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">{g.phone}</TableCell>
                <TableCell>{guardStatusBadge(g.status)}</TableCell>
                <TableCell>{onboardingBadge(g.onboardingStatus)}</TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {findSite(g.siteId)?.name ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEdit(g)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unlinkGuard({ email: g.email, phone: g.phone })}
                      disabled={!g.linkedClientId}
                    >
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No guards found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Full Image Dialog */}
      <Dialog open={fullImageOpen} onOpenChange={setFullImageOpen}>
        <DialogContent className="max-w-4xl bg-black/95 border-none">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-white/20 z-10"
            onClick={() => setFullImageOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center justify-center min-h-[60vh]">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Full size passport"
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                onError={() => setSelectedImage("")}
              />
            )}
            {!selectedImage && (
              <div className="h-40 w-40 rounded-full bg-muted/20 border border-white/20 flex items-center justify-center">
                <User className="h-20 w-20 text-white/70" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={linkModalOpen} onOpenChange={setLinkModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add / Link guard</DialogTitle>
            <DialogDescription>Lookup a registered guard by email or phone, then link to your company.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="guard email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              className="max-w-sm"
            />
            <Input
              placeholder="or guard phone"
              value={lookupPhone}
              onChange={(e) => setLookupPhone(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={lookupGuard}>Lookup</Button>
          </div>
          {lookupResult && (
            <div className="text-sm text-muted-foreground">
              {lookupResult.name} ({lookupResult.email}) · status{" "}
              <span className="font-medium text-foreground">{lookupResult.onboardingStatus ?? "unknown"}</span> ·{" "}
              <span className="font-medium text-foreground">
                {lookupLinkedClientId ? "Linked" : "Not linked"}
              </span>
            </div>
          )}
          <DialogFooter>
            {lookupResult && (
              <Button
                variant="outline"
                onClick={() =>
                  unlinkGuard({
                    email: lookupResult.email,
                    phone: lookupResult.phone,
                  })
                }
              >
                Remove from my company
              </Button>
            )}
            <Button variant="secondary" onClick={linkGuard} disabled={!lookupResult || linking}>
              {linking ? "Linking..." : "Link to my company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit guard</DialogTitle>
            <DialogDescription>
              Update assigned site for {editingGuard?.name ?? "guard"}.
            </DialogDescription>
          </DialogHeader>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={editingGuard ? selectedSiteByGuard[editingGuard.id] ?? editingGuard.siteId ?? "" : ""}
            onChange={(e) =>
              editingGuard &&
              setSelectedSiteByGuard((prev) => ({
                ...prev,
                [editingGuard.id]: e.target.value,
              }))
            }
          >
            <option value="">Select site</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button onClick={saveGuardEdit} disabled={!editingGuard || savingEdit}>
              {savingEdit ? "Saving..." : "Save site"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}