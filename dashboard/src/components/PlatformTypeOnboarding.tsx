import { Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrganizationType } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Props = {
  value: OrganizationType | null;
  onChange: (value: OrganizationType) => void;
  onContinue: () => void;
  loading?: boolean;
  continueLabel?: string;
};

const options: {
  id: OrganizationType;
  title: string;
  description: string;
  icon: typeof Shield;
}[] = [
  {
    id: "guard_company",
    title: "Guard company",
    description: "Manage guards, sites, shifts, patrols, and incidents for contracted security work.",
    icon: Shield,
  },
  {
    id: "corporate_security",
    title: "Corporate security",
    description: "Run site surveys, compliance audits, training, and visitor reporting for your organization.",
    icon: Building2,
  },
];

export default function PlatformTypeOnboarding({
  value,
  onChange,
  onContinue,
  loading = false,
  continueLabel = "Continue",
}: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Choose how your organization will use MovaraHub. You can manage guard operations, corporate security tools, or
        both depending on your selection.
      </p>
      <div className="grid gap-3">
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                selected
                  ? "border-accent bg-accent/10 ring-1 ring-accent"
                  : "border-border bg-card hover:border-accent/50",
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", selected ? "text-accent" : "text-muted-foreground")} />
              <div>
                <div className="font-medium">{opt.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{opt.description}</div>
              </div>
            </button>
          );
        })}
      </div>
      <Button type="button" className="w-full" disabled={!value || loading} onClick={onContinue}>
        {loading ? "Saving..." : continueLabel}
      </Button>
    </div>
  );
}
