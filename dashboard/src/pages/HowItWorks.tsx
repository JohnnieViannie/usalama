import MarketingLayout from "@/components/MarketingLayout";
import { ArrowRight, Users, QrCode, Activity, FileBarChart, Crosshair } from "lucide-react";

const phases = [
  { n: "STEP 01", icon: Users, t: "Create Company & Guard Accounts", side: "ADMIN", d: "Set up your dashboard account, onboard guards in the mobile app, and approve/link each guard to your company before operations start." },
  { n: "STEP 02", icon: QrCode, t: "Configure Sites & Checkpoints", side: "OPERATIONS", d: "Create sites, assign guards, and set checkpoint QR codes with GPS coordinates and scan radius to enforce location-based verification." },
  { n: "STEP 03", icon: Activity, t: "Run Field Activity", side: "FIELD", d: "Guards start shifts, scan checkpoints, report incidents, and trigger panic alerts. Events are stored offline when needed and synced automatically." },
  { n: "STEP 04", icon: FileBarChart, t: "Monitor & Report", side: "DASHBOARD", d: "Control room tracks on-duty guards, patrol logs, incidents, alerts, and guard last-seen data from one live operations dashboard." },
];

export default function HowItWorks() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 tactical-grid opacity-40" />
        <div className="container relative py-20">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
            <span className="flex items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent">
              <Crosshair className="h-3 w-3" /> DEPLOYMENT DOCTRINE
            </span>
            <span className="text-muted-foreground">FROM GUARD APP TO DASHBOARD</span>
          </div>
          <h1 className="mt-8 text-5xl font-bold uppercase leading-[0.95] md:text-7xl" style={{ fontFamily: "Oswald, sans-serif" }}>
            How MovaraHub Works.<br />
            <span className="text-accent">Step by step in production.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A practical workflow your team can run daily: onboard, verify patrols, handle incidents, and keep clients updated.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <div className="space-y-6">
          {phases.map((p, i) => (
            <div key={p.n} className="group relative panel p-6 md:p-8 corner-bracket hover:border-accent/50 transition-colors">
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 md:col-span-2">
                  <div className="font-mono text-xs text-accent">{p.n}</div>
                  <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">// {p.side}</div>
                </div>
                <div className="col-span-12 md:col-span-1">
                  <div className="grid h-12 w-12 place-items-center border border-accent/30 bg-accent/5 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <p.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                </div>
                <div className="col-span-12 md:col-span-1">
                  <div className="text-4xl font-bold uppercase text-muted-foreground/40" style={{ fontFamily: "Oswald, sans-serif" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div className="col-span-12 md:col-span-7">
                  <h3 className="text-2xl font-bold uppercase md:text-3xl" style={{ fontFamily: "Oswald, sans-serif" }}>
                    {p.t}
                  </h3>
                  <p className="mt-3 max-w-2xl text-muted-foreground leading-relaxed">{p.d}</p>
                </div>
                <div className="col-span-12 hidden md:col-span-1 md:flex md:items-center md:justify-end">
                  <ArrowRight className="h-6 w-6 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
