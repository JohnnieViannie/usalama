import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Guard, Shift, Site } from "@/lib/mockData";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { toast } from "sonner";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function Shifts() {
  const navigate = useNavigate();
  const [list, setList] = useState<Shift[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ guardId: "", siteId: "", day: "Mon", start: "08:00", end: "17:00" });

  const load = async () => {
    const [sh, g, s] = await Promise.all([
      apiGet<Array<{ id: string; guardId: string; siteId: string; day: string; start: string; end: string; lastStartAt?: string | null; lastEndAt?: string | null }>>("/shifts/"),
      apiGet<Guard[]>("/guards/"),
      apiGet<Site[]>("/sites/"),
    ]);
    setList(
      sh.map((x) => ({
        id: x.id,
        guardId: x.guardId,
        siteId: x.siteId,
        day: x.day as Shift["day"],
        start: x.start,
        end: x.end,
        lastStartAt: x.lastStartAt ?? null,
        lastEndAt: x.lastEndAt ?? null,
      })),
    );
    setGuards(g);
    setSites(s);
    if (!form.guardId && g.length) setForm((prev) => ({ ...prev, guardId: g[0].id }));
    if (!form.siteId && s.length) setForm((prev) => ({ ...prev, siteId: s[0].id }));
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load shifts");
      }
    })();
  }, []);

  const findSite = (id: string) => sites.find((x) => x.id === id);
  const findGuard = (id: string) => guards.find((g) => g.id === id);

  const byGuard = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    for (const g of guards) map[g.id] = [];
    for (const sh of list) {
      if (!map[sh.guardId]) map[sh.guardId] = [];
      map[sh.guardId].push(sh);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        const di = days.indexOf(a.day) - days.indexOf(b.day);
        if (di !== 0) return di;
        return a.start.localeCompare(b.start);
      });
    }
    return map;
  }, [guards, list]);

  const save = async () => {
    try {
      setSaving(true);
      const body = {
        guardId: form.guardId,
        siteId: form.siteId,
        day: form.day,
        start: form.start,
        end: form.end,
      };
      if (editingId) {
        await apiPut(`/shifts/${editingId}/`, body);
        toast.success("Shift updated");
      } else {
        await apiPost("/shifts-create/", body);
        toast.success("Shift created");
      }
      setEditingId(null);
      setModalOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save shift");
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      guardId: guards[0]?.id ?? "",
      siteId: sites[0]?.id ?? "",
      day: "Mon",
      start: "08:00",
      end: "17:00",
    });
    setModalOpen(true);
  };

  const edit = (shift: Shift) => {
    setEditingId(shift.id);
    setForm({
      guardId: shift.guardId,
      siteId: shift.siteId,
      day: shift.day,
      start: shift.start,
      end: shift.end,
    });
    setModalOpen(true);
  };

  const remove = async (shift: Shift) => {
    try {
      await apiDelete(`/shifts/${shift.id}/`);
      toast.success("Shift deleted");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete shift");
    }
  };

  return (
    <DashboardLayout title="Shifts">
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>Add shift</Button>
      </div>
      <div className="rounded-xl border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full table-fixed text-xs lg:text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="w-[20%] px-2 py-2 text-left font-semibold text-muted-foreground">Guard</th>
              {days.map((d) => (
                <th key={d} className="w-[11.4%] px-2 py-2 text-left font-semibold text-muted-foreground">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {guards.map((g) => (
              <tr
                key={g.id}
                className="border-t align-top hover:bg-muted/20"
              >
                <td className="px-2 py-2">
                  <button
                    className="group text-left"
                    onClick={() => navigate(`/shifts/${g.id}`)}
                  >
                    <div className="truncate font-semibold group-hover:underline">
                      {g.name} <span className="text-[11px] text-muted-foreground">↗</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {(byGuard[g.id] ?? []).length} shift(s)
                    </div>
                    <div className="text-[10px] text-primary/80">Click to view details</div>
                  </button>
                </td>
                {days.map((d) => {
                  const rows = (byGuard[g.id] ?? []).filter((s) => s.day === d);
                  if (rows.length === 0) {
                    return (
                      <td key={d} className="px-2 py-2 text-[11px] text-muted-foreground">
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={d} className="px-2 py-2">
                      <div className="space-y-1">
                        {rows.slice(0, 2).map((s) => (
                          <button
                            key={s.id}
                            className="block w-full rounded border bg-accent/10 px-2 py-1 text-left text-[11px] font-medium text-accent hover:bg-accent/20"
                            onClick={() => edit(s)}
                            title={`${s.start}-${s.end} · ${findSite(s.siteId)?.name ?? s.siteId}`}
                          >
                            <div className="truncate">{s.start}-{s.end}</div>
                            <div className="truncate text-[10px] text-muted-foreground">
                              {findSite(s.siteId)?.name ?? s.siteId}
                            </div>
                          </button>
                        ))}
                        {rows.length > 2 && (
                          <div className="text-[10px] text-muted-foreground">+{rows.length - 2} more</div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit shift" : "Add shift"}</DialogTitle>
            <DialogDescription>Assign a guard to a site and duty schedule.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={form.guardId}
              onChange={(e) => setForm((f) => ({ ...f, guardId: e.target.value }))}
            >
              {guards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={form.siteId}
              onChange={(e) => setForm((f) => ({ ...f, siteId: e.target.value }))}
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={form.day}
              onChange={(e) => setForm((f) => ({ ...f, day: e.target.value as Shift["day"] }))}
            >
              {days.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <Input type="time" value={form.start} onChange={(e) => setForm((f) => ({ ...f, start: e.target.value }))} />
            <Input type="time" value={form.end} onChange={(e) => setForm((f) => ({ ...f, end: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update shift" : "Add shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
