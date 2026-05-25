import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { Incident, IncidentPayload } from "@/lib/mockData";

export function classificationLabel(i: Incident): string | undefined {
  return i.classification?.trim() || i.payload?.classification?.trim();
}

export function severityLabel(i: Incident): string | undefined {
  return i.severity?.trim() || i.payload?.severity?.trim();
}

export function humanize(value?: string): string {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function yesNo(value?: boolean): string {
  if (value == null) return "—";
  return value ? "Yes" : "No";
}

export function clientFacingSummary(i: Incident): string {
  const p = i.payload;
  if (!p || typeof p !== "object") return i.description;

  const lines: string[] = [];
  const cls = classificationLabel(i);
  if (cls) lines.push(`Incident type: ${cls}.`);
  const sev = severityLabel(i);
  if (sev) lines.push(`Severity: ${sev}.`);
  if (p.what_happened) lines.push(String(p.what_happened));
  if (p.timeline_notes) lines.push(`Timeline: ${String(p.timeline_notes)}`);
  if (p.outcome) lines.push(`Outcome: ${String(p.outcome)}`);
  if (p.exact_location) lines.push(`Location: ${String(p.exact_location)}`);

  const joined = lines.join(" ").trim();
  return joined || i.description;
}

export function incidentMediaUrls(incident: Incident): string[] {
  const extra = incident.mediaUrls ?? [];
  const m = incident.payload?.media;
  const fromPayload: string[] = [];
  if (m?.photos?.length) fromPayload.push(...m.photos);
  if (m?.video) fromPayload.push(m.video);
  if (m?.voice_note) fromPayload.push(m.voice_note);
  if (m?.signature) fromPayload.push(m.signature);
  return [...new Set([...extra, ...fromPayload])].filter(Boolean);
}

export function MediaGallery({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {urls.map((url) => {
        const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(url);
        return isVideo ? (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-md border bg-muted/40 px-2 py-4 text-center text-xs text-primary underline"
          >
            Open video
          </a>
        ) : (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            <img src={url} alt="" className="h-24 w-full rounded-md object-cover md:h-32" loading="lazy" />
          </a>
        );
      })}
    </div>
  );
}

export function IncidentBadges({ incident }: { incident: Incident }) {
  return (
    <div className="flex flex-wrap gap-2">
      {classificationLabel(incident) && (
        <Badge variant="outline">{classificationLabel(incident)}</Badge>
      )}
      {severityLabel(incident) && (
        <Badge variant="secondary" className="uppercase">{severityLabel(incident)}</Badge>
      )}
      {(incident.shift_type || incident.payload?.shift_type) && (
        <Badge variant="outline">Shift: {incident.shift_type ?? incident.payload?.shift_type}</Badge>
      )}
      <Badge variant={incident.status === "closed" ? "secondary" : "destructive"}>
        {incident.status === "closed" ? "Closed" : "Open"}
      </Badge>
      {incident.investigationNumber && (
        <Badge variant="outline">{incident.investigationNumber}</Badge>
      )}
    </div>
  );
}

export function PayloadSections({
  payload,
  fallbackDescription,
}: {
  payload?: IncidentPayload | null;
  fallbackDescription: string;
}) {
  if (!payload || typeof payload !== "object") {
    return (
      <div>
        <div className="text-xs text-muted-foreground">Description</div>
        <p className="mt-1 text-sm">{fallbackDescription}</p>
      </div>
    );
  }

  const blocks: ReactNode[] = [];

  blocks.push(
    <div key="wizard-core" className="rounded-lg border bg-muted/20 p-3">
      <div className="mb-2 text-xs font-semibold text-muted-foreground">Submitted report details</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground">Report reference</div>
          <div className="text-sm">{payload.client_report_id || "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Company</div>
          <div className="text-sm">{payload.company_name || "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Incident time</div>
          <div className="text-sm">{payload.time_incident_started || "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Exact location</div>
          <div className="text-sm">{payload.exact_location || "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">People involved</div>
          <div className="text-sm">{payload.people_involved_count ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Property damaged</div>
          <div className="text-sm">{yesNo(payload.property_damaged)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Estimated value</div>
          <div className="text-sm">{payload.estimated_value || "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Damage description</div>
          <div className="text-sm">{payload.damage_description || "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Escalation</div>
          <div className="text-sm">{humanize(payload.escalation_level)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Outcome</div>
          <div className="text-sm">{humanize(payload.outcome)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Supervisor notified</div>
          <div className="text-sm">{yesNo(payload.supervisor_notified)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Police involved</div>
          <div className="text-sm">{yesNo(payload.police_involved)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Emergency services called</div>
          <div className="text-sm">{yesNo(payload.emergency_services_called)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Declaration accepted</div>
          <div className="text-sm">{yesNo(payload.declaration_accepted)}</div>
        </div>
      </div>
    </div>,
  );

  if (payload.what_happened) {
    blocks.push(
      <div key="what">
        <div className="text-xs text-muted-foreground">What happened</div>
        <p className="mt-1 whitespace-pre-wrap text-sm">{String(payload.what_happened)}</p>
      </div>,
    );
  }

  if (payload.detection_method) {
    blocks.push(
      <div key="det">
        <div className="text-xs text-muted-foreground">Detection</div>
        <p className="mt-1 text-sm">{humanize(String(payload.detection_method))}</p>
      </div>,
    );
  }

  const persons = [
    { label: "Suspects", entries: payload.suspects },
    { label: "Victims", entries: payload.victims },
    { label: "Witnesses", entries: payload.witnesses },
  ].filter((item) => Array.isArray(item.entries) && item.entries.length > 0);
  for (const personGroup of persons) {
    const label = personGroup.label;
    const list = (personGroup.entries as unknown[])
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry === "object") {
          const row = entry as Record<string, unknown>;
          return (
            (typeof row.name === "string" && row.name) ||
            (typeof row.role === "string" && row.role) ||
            (typeof row.type === "string" && row.type) ||
            "Person"
          );
        }
        return "";
      })
      .filter(Boolean);
    blocks.push(
      <div key={label}>
        <div className="text-xs text-muted-foreground">{label}</div>
        <ul className="mt-1 list-inside list-disc text-sm">
          {list.map((entry, idx) => (
            <li key={`${label}-${idx}`}>{entry}</li>
          ))}
        </ul>
      </div>,
    );
  }

  if (payload.actions_taken && payload.actions_taken.length) {
    blocks.push(
      <div key="actions">
        <div className="text-xs text-muted-foreground">Actions taken</div>
        <ul className="mt-1 list-inside list-disc text-sm">
          {payload.actions_taken.map((a) => (
            <li key={a}>{a.replace(/_/g, " ")}</li>
          ))}
        </ul>
      </div>,
    );
  }

  if (payload.follow_up_flags && payload.follow_up_flags.length) {
    blocks.push(
      <div key="flags">
        <div className="text-xs text-muted-foreground">Follow-up flags</div>
        <ul className="mt-1 list-inside list-disc text-sm">
          {payload.follow_up_flags.map((flag) => (
            <li key={flag}>{humanize(flag)}</li>
          ))}
        </ul>
      </div>,
    );
  }

  if (payload.follow_up_notes) {
    blocks.push(
      <div key="fu">
        <div className="text-xs text-muted-foreground">Follow-up</div>
        <p className="mt-1 text-sm">{String(payload.follow_up_notes)}</p>
      </div>,
    );
  }

  if (blocks.length === 0) {
    return (
      <div>
        <div className="text-xs text-muted-foreground">Description</div>
        <p className="mt-1 text-sm">{fallbackDescription}</p>
      </div>
    );
  }

  return <div className="space-y-3">{blocks}</div>;
}
