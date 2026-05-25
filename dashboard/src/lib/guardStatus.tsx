import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Circle } from "lucide-react";
import type { Guard, GuardStatus } from "@/lib/mockData";

export function guardStatusBadge(status: GuardStatus) {
  switch (status) {
    case "on_duty":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15 px-2.5 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <div className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <Clock className="h-3 w-3 relative" />
            </div>
            <span>On Duty</span>
          </div>
        </Badge>
      );
    case "active":
      return (
        <Badge
          variant="secondary"
          className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/15 px-2.5 py-0.5"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3" />
            <span>Off duty</span>
          </div>
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="outline" className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 px-2.5 py-0.5">
          <div className="flex items-center gap-1.5">
            <Circle className="h-3 w-3" />
            <span>Inactive</span>
          </div>
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export type GuardStatusCounts = {
  total: number;
  onDuty: number;
  offDuty: number;
  inactive: number;
};

export function countGuardsByStatus(guards: Guard[]): GuardStatusCounts {
  let onDuty = 0;
  let offDuty = 0;
  let inactive = 0;
  for (const g of guards) {
    if (g.status === "on_duty") onDuty += 1;
    else if (g.status === "inactive") inactive += 1;
    else offDuty += 1;
  }
  return { total: guards.length, onDuty, offDuty, inactive };
}
