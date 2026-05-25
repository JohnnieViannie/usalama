import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Alert as AlertT, Guard } from "@/lib/mockData";
import { apiGet, apiPost } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { Siren, AlertTriangle, Clock } from "lucide-react";

const typeMeta: Record<AlertT["type"], { label: string; icon: typeof Siren; cls: string }> = {
  panic: { label: "Panic alert", icon: Siren, cls: "text-destructive bg-destructive/10" },
  missed_checkpoint: { label: "Missed checkpoint", icon: AlertTriangle, cls: "text-warning bg-warning/10" },
  late_shift: { label: "Late shift", icon: Clock, cls: "text-muted-foreground bg-muted" },
};

export default function Alerts() {
  const [list, setList] = useState<AlertT[]>([]);
  const [guards, setGuards] = useState<Guard[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [a, g] = await Promise.all([apiGet<AlertT[]>("/alerts/"), apiGet<Guard[]>("/guards/")]);
        setList(a);
        setGuards(g);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  const findGuard = (id: string) => guards.find((x) => x.id === id);

  const resolve = async (a: AlertT) => {
    try {
      await apiPost(`/alerts/${a.id}/status/`, { status: "resolved" });
      setList((l) => l.map((x) => (x.id === a.id ? { ...x, status: "resolved" as const } : x)));
      toast.success("Alert resolved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to resolve alert");
    }
  };

  return (
    <DashboardLayout title="Alerts">
      <div className="mobile-only-cards mobile-card-list">
        {list.map((a) => {
          const meta = typeMeta[a.type];
          const Icon = meta.icon;
          return (
            <div key={a.id} className="mobile-data-card">
              <div className="flex items-center gap-2">
                <span className={`grid h-7 w-7 place-items-center rounded-md ${meta.cls}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium">{meta.label}</span>
              </div>
              <div className="mobile-kv mt-2">
                Guard: {a.guardName ?? findGuard(a.guardId)?.name}
              </div>
              <div className="mobile-kv">{format(new Date(a.timestamp), "MMM d, HH:mm")}</div>
              <div className="mt-2">
                {a.status === "resolved" ? (
                  <Badge className="bg-success/15 text-success hover:bg-success/15">Resolved</Badge>
                ) : (
                  <Badge variant="destructive">Unresolved</Badge>
                )}
              </div>
              {a.status === "unresolved" && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" onClick={() => void resolve(a)}>
                    Resolve
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="desktop-only-table rounded-xl border bg-card shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Guard</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((a) => {
              const meta = typeMeta[a.type];
              const Icon = meta.icon;
              return (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`grid h-7 w-7 place-items-center rounded-md ${meta.cls}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-medium">{meta.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>{a.guardName ?? findGuard(a.guardId)?.name}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(a.timestamp), "MMM d, HH:mm")}</TableCell>
                  <TableCell>
                    {a.status === "resolved" ? (
                      <Badge className="bg-success/15 text-success hover:bg-success/15">Resolved</Badge>
                    ) : (
                      <Badge variant="destructive">Unresolved</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {a.status === "unresolved" && (
                      <Button size="sm" variant="outline" onClick={() => void resolve(a)}>
                        Resolve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
