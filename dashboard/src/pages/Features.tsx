import {
  FileBarChart, AlertTriangle, QrCode, Radio,
  Smartphone, Lock, Calendar, Bell, Crosshair, Siren,
} from "lucide-react";
import MarketingLayout from "@/components/MarketingLayout";

const capabilities = [
  { icon: Radio, code: "CAP-01", title: "Live Guard Status", text: "Track who is on duty, where guards were last seen, and which teams are active per site in real time." },
  { icon: QrCode, code: "CAP-02", title: "Checkpoint Scan Verification", text: "Checkpoint scans are matched to assigned points and validated with location radius before being accepted." },
  { icon: Siren, code: "CAP-03", title: "Panic & Incident Workflows", text: "Guards can send panic alerts and incident reports with location context and optional photo evidence from the field app." },
  { icon: FileBarChart, code: "CAP-04", title: "Operational Reporting", text: "Review patrol logs, incidents, alerts, and report history from one dashboard view for clients and supervisors." },
  { icon: Calendar, code: "CAP-05", title: "Shift Events Visibility", text: "Shift start/end events are captured from mobile and reflected in dashboard metrics like guards on duty." },
  { icon: Smartphone, code: "CAP-06", title: "Offline-First Guard App", text: "Shifts, scans, incidents, and alerts are saved locally when offline and synced automatically when connectivity returns." },
  { icon: Bell, code: "CAP-07", title: "Alert Monitoring", text: "See unresolved alerts and incident states in one command view, with status updates tracked over time." },
  { icon: Lock, code: "CAP-08", title: "Controlled Guard Onboarding", text: "Guard access is gated through signup verification and admin linking, ensuring only approved staff feed company data." },
];

export default function Features() {
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 tactical-grid opacity-40" />
        <div className="container relative py-20">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
            <span className="flex items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent">
              <Crosshair className="h-3 w-3" /> CAPABILITY MATRIX
            </span>
            <span className="text-muted-foreground">APP + DASHBOARD WORKFLOWS</span>
          </div>
          <h1 className="mt-8 text-5xl font-bold uppercase leading-[0.95] md:text-7xl" style={{ fontFamily: "Oswald, sans-serif" }}>
            Built for Daily Guard Operations.<br />
            <span className="text-accent">Visible from One Dashboard.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            These capabilities reflect actual workflows in the guard app and dashboard:
            capture in the field, sync to backend, monitor in real time.
          </p>
        </div>
      </section>

      <section className="border-b border-border py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((c) => (
              <div key={c.code} className="group relative panel p-6 corner-bracket hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center border border-accent/30 bg-accent/5 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    <c.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{c.code}</span>
                </div>
                <h3 className="mt-8 text-base font-semibold uppercase leading-snug" style={{ fontFamily: "Oswald, sans-serif" }}>
                  {c.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
