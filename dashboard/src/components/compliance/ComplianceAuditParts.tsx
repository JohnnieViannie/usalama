import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { resolveComplianceMediaUrl } from "@/lib/corporateApi";
import { scoreTone, statusLabel, statusTone } from "@/lib/complianceAuditDisplay";
import { cn } from "@/lib/utils";
import { Camera, ChevronDown, ChevronRight, ImageIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

export function AuditStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusTone(status)} className="capitalize shrink-0">
      {statusLabel(status)}
    </Badge>
  );
}

export function FieldScorePill({ score }: { score: number | null }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[2.5rem] justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums",
        scoreTone(score),
      )}
    >
      {score ?? "—"}
    </span>
  );
}

export function EvidenceGallery({
  attachments,
  compact,
}: {
  attachments: { id: number; url?: string; description?: string }[];
  compact?: boolean;
}) {
  if (!attachments.length) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-4 text-xs text-muted-foreground">
        <ImageIcon className="h-4 w-4 shrink-0" />
        No evidence photos for this item
      </div>
    );
  }
  const size = compact ? "h-20 w-20" : "h-28 w-28";
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Camera className="h-3.5 w-3.5" />
        {attachments.length} photo{attachments.length === 1 ? "" : "s"}
      </p>
      <div className="flex flex-wrap gap-2">
        {attachments.map((att) => {
          const src = resolveComplianceMediaUrl(att.url);
          return (
            <a
              key={att.id}
              href={src ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative overflow-hidden rounded-lg border bg-muted shadow-sm transition hover:ring-2 hover:ring-primary/40",
                size,
              )}
            >
              {src ? (
                <img
                  src={src}
                  alt={att.description ?? `Evidence ${att.id}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                  Unavailable
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export function SectionNav({
  sections,
  activeId,
  onSelect,
  sectionProgress,
  auditorProgress,
}: {
  sections: { id: string; title: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  sectionProgress?: Record<string, { done: number; total: number }>;
  auditorProgress?: Record<string, { done: number; total: number }>;
}) {
  return (
    <nav className="space-y-1">
      {sections.map((sec) => {
        const p = sectionProgress?.[sec.id];
        const a = auditorProgress?.[sec.id];
        const pct = p && p.total > 0 ? Math.round((p.done / p.total) * 100) : 0;
        const active = sec.id === activeId;
        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelect(sec.id)}
            className={cn(
              "flex w-full flex-col gap-1 rounded-lg border px-3 py-2 text-left text-sm transition",
              active
                ? "border-primary bg-primary/5 text-foreground"
                : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted",
            )}
          >
            <span className="line-clamp-2 font-medium leading-snug">{sec.title}</span>
            {p && (
              <div className="flex items-center gap-2">
                <Progress value={pct} className="h-1 flex-1" />
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  F {p.done}/{p.total}
                  {a ? ` · A ${a.done}/${a.total}` : ""}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function CollapsibleBlock({
  title,
  subtitle,
  defaultOpen = true,
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  badge?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
        </div>
        {badge}
      </button>
      {open && <div className="border-t px-4 py-4">{children}</div>}
    </div>
  );
}

export function InfoGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-muted/30 px-3 py-2">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-sm font-medium break-words">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
