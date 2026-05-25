import { Link } from "react-router-dom";
import { Check, ArrowRight, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";

const tiers = [
  {
    name: "PATROL",
    code: "TIER-01",
    price: "$49",
    per: "/month",
    blurb: "For teams replacing paper or WhatsApp patrol tracking with verified digital workflows.",
    features: ["Up to 10 officers", "5 client sites", "Shift start/end tracking", "QR + GPS checkpoint scans", "Incident and panic logging"],
    cta: "Start Patrol",
  },
  {
    name: "COMMAND",
    code: "TIER-02",
    price: "$149",
    per: "/month",
    blurb: "For growing firms managing multiple sites and supervisors from one control dashboard.",
    features: ["Up to 50 officers", "Unlimited client sites", "Live dashboard monitoring", "Guard last-seen visibility", "Report history and exports", "Priority support"],
    cta: "Scale Operations",
    featured: true,
  },
  {
    name: "SOVEREIGN",
    code: "TIER-03",
    price: "Custom",
    per: "",
    blurb: "For enterprise operations needing custom rollout, governance, and long-term deployment support.",
    features: ["Unlimited officers & sites", "Dedicated success engineer", "Custom onboarding plan", "Advanced support SLAs", "Integration assistance", "24/7 operations contact"],
    cta: "Talk to Team",
  },
];

export default function Pricing() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 tactical-grid opacity-40" />
        <div className="container relative py-20">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
            <span className="flex items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent">
              <Crosshair className="h-3 w-3" /> OPERATIONAL TIERS
            </span>
            <span className="text-muted-foreground">PLANS BY ACTIVE TEAM SIZE</span>
          </div>
          <h1 className="mt-8 text-5xl font-bold uppercase leading-[0.95] md:text-7xl" style={{ fontFamily: "Oswald, sans-serif" }}>
            Pick The Plan That Fits<br />
            <span className="text-accent">Your Guard Operations.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Start small, run live operations, and expand by sites and officers as your client portfolio grows.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col panel p-7 corner-bracket ${
                t.featured ? "panel-glow border-accent/50 md:scale-[1.03] md:z-10" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-[10px] uppercase tracking-[0.22em] ${t.featured ? "text-accent" : "text-muted-foreground"}`}>
                  {t.code}
                </span>
                {t.featured && (
                  <span className="bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-foreground">
                    ★ Recommended
                  </span>
                )}
              </div>
              <h3 className="mt-6 text-3xl font-bold uppercase tracking-tight" style={{ fontFamily: "Oswald, sans-serif" }}>
                {t.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.blurb}</p>

              <div className="mt-6 flex items-baseline gap-1.5 border-y border-border py-5">
                <span className="text-5xl font-bold tracking-tight" style={{ fontFamily: "Oswald, sans-serif" }}>
                  {t.price}
                </span>
                <span className="text-sm text-muted-foreground">{t.per}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${t.featured ? "text-accent" : "text-success"}`} strokeWidth={2.5} />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`mt-8 w-full font-mono text-xs uppercase tracking-[0.22em] ${
                  t.featured
                    ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_-4px_hsl(var(--accent)/0.6)]"
                    : "bg-secondary text-foreground hover:bg-secondary/80 border border-border"
                }`}
              >
                <Link to={t.name === "SOVEREIGN" ? "/contact" : "/login"}>
                  {t.cta} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 relative panel p-6 corner-bracket panel-glow">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">// PILOT_PROGRAM</div>
              <p className="mt-2 text-lg font-semibold">Need help deciding? Share your current setup and we will recommend the right rollout path.</p>
            </div>
            <Button asChild className="bg-accent font-mono text-xs uppercase tracking-[0.22em] text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_-4px_hsl(var(--accent)/0.6)]">
              <Link to="/contact">Request Plan Review <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
