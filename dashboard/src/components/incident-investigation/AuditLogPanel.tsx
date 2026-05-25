import { useEffect, useState } from "react";
import { getInvestigationAuditLog } from "@/lib/incidentInvestigationApi";
import type { AuditLogEntry } from "@/lib/incidentInvestigationTypes";
import { format } from "date-fns";

export default function AuditLogPanel({ investigationId }: { investigationId: number }) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getInvestigationAuditLog(investigationId);
        if (active) setEntries(data);
      } catch {
        if (active) setEntries([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [investigationId]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading audit log…</p>;
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">No audit entries yet.</p>;

  return (
    <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
      {entries.map((e) => (
        <li key={e.id} className="rounded border px-2 py-1.5">
          <div className="flex justify-between gap-2">
            <span className="font-medium capitalize">{e.action.replace(/_/g, " ")}</span>
            <span className="text-xs text-muted-foreground">
              {e.createdAt ? format(new Date(e.createdAt), "dd MMM yyyy HH:mm") : ""}
            </span>
          </div>
          {e.detail && <p className="text-muted-foreground">{e.detail}</p>}
          {e.userEmail && <p className="text-xs">{e.userEmail}</p>}
        </li>
      ))}
    </ul>
  );
}
