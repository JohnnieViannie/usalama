import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  hint?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  actionTo?: string;
  actionOnClick?: () => void;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  hint,
  icon: Icon,
  actionLabel,
  actionTo,
  actionOnClick,
  className,
}: EmptyStateProps) {
  const showAction = Boolean(actionLabel && (actionTo || actionOnClick));

  return (
    <div
      className={[
        "mx-auto max-w-lg rounded-xl border bg-card p-8 text-center shadow-[var(--shadow-card)]",
        className ?? "",
      ].join(" ")}
    >
      {Icon ? (
        <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      {showAction ? (
        <div className="mt-4">
          {actionTo ? (
            <Button asChild size="sm">
              <Link to={actionTo}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={actionOnClick}>
              {actionLabel}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
