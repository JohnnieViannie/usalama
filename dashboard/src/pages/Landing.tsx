import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MarketingLayout from "@/components/MarketingLayout";
import PhoneMockup from "@/components/PhoneMockup";
import {
  ShieldCheck, Radio, AlertTriangle, FileBarChart, MapPin, QrCode,
  Users, Lock, Activity, ArrowRight, Eye, Crosshair, Siren, Radar,
} from "lucide-react";
import { useEffect, useState } from "react";

const tickerItems = [
  "SHIFT START · GUARD-0142 · SITE S1 · SYNCED",
  "CHECKPOINT SCAN · GATE-A · VERIFIED WITH GPS",
  "INCIDENT REPORT · PHOTO + LOCATION ATTACHED",
  "PANIC ALERT · ESCALATED TO CONTROL ROOM",
  "ROUTE PING · ON-DUTY HEARTBEAT RECEIVED",
  "OFFLINE QUEUE · EVENTS SYNCED WHEN ONLINE",
  "GUARD LINKED · ADMIN APPROVAL COMPLETE",
  "CLIENT DASHBOARD · MORNING BRIEF GENERATED",
];

const capabilities = [
  { icon: Radio, title: "Live Guard Visibility", text: "See who is on duty, where they were last seen, and how patrol activity is changing across each assigned site." },
  { icon: QrCode, title: "Verified Checkpoint Scans", text: "Guard scans are validated against assigned checkpoints and location radius, then recorded with timestamp and site context." },
  { icon: Siren, title: "Incident & Panic Response", text: "From one tap, guards can submit panic alerts and incident reports with optional photo and location evidence." },
  { icon: FileBarChart, title: "Operational Dashboard & Reports", text: "Track shifts, patrol logs, incidents, alerts, and guard status in one dashboard with downloadable report history." },
];

const stats = [
  { v: "Live", l: "Shift status updates" },
  { v: "GPS", l: "Route ping evidence" },
  { v: "QR", l: "Checkpoint verification" },
  { v: "Offline", l: "Queue + sync workflow" },
];

const trustedBy = ["SECURITY FIRMS", "COMMERCIAL SITES", "MALL OPERATIONS", "INDUSTRIAL PARKS", "OFFICE CAMPUSES", "ESTATE SECURITY"];

const testimonials = [
  { name: "John Mwangi", role: "Director of Operations", org: "SecureGuard Ltd · Nairobi", text: "Our supervisors now see shifts, scans, and incidents in one place. The dashboard finally matches what guards do on the ground." },
  { name: "Sarah Kimathi", role: "Security Manager", org: "Premier Properties · Mombasa", text: "The checkpoint trail and guard last-seen view removed most of our daily follow-up calls. We move from guessing to confirming." },
  { name: "David Ochieng", role: "Chief Executive Officer", org: "Shield Security Services · Kisumu", text: "Offline-first logging changed field reliability for us. Even in poor network areas, events sync later and nothing gets lost." },
];

export default function Landing() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " EAT");
    };
    update();
    const i = setInterval(update, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <MarketingLayout>
      {/* HERO — Command center */}
      <section className="relative min-w-0 overflow-hidden border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 tactical-grid opacity-40" />
        <div className="absolute inset-0 scanline pointer-events-none" />

        {/* Radar in background */}
        <div className="pointer-events-none absolute -right-32 top-1/2 hidden -translate-y-1/2 lg:block">
          <div className="relative h-[600px] w-[600px] radar-grid rounded-full">
            <div className="absolute inset-0 radar-sweep rounded-full opacity-50" />
            <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_20px_4px_hsl(var(--accent)/0.6)]" />
          </div>
        </div>

        <div className="container relative py-14 sm:py-20 md:py-28">
          {/* Mission tag */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
            <span className="flex items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent">
              <Crosshair className="h-3 w-3" />
              MISSION-CRITICAL
            </span>
            <span className="text-muted-foreground">CLASS-A · LICENSED</span>
            <span className="hidden text-muted-foreground sm:inline">|</span>
            <span className="hidden text-muted-foreground sm:inline">{time}</span>
          </div>

          {/* Headline */}
          <div className="mt-8 grid gap-10 md:mt-14 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-8">
              <h1 className="text-4xl font-bold leading-[0.95] uppercase sm:text-5xl md:text-7xl lg:text-8xl" style={{ fontFamily: "Oswald, sans-serif" }}>
                Guard Ops.<br />
                <span className="text-accent">Live Dashboard.</span><br />
                <span className="text-muted-foreground">Verified Evidence.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg">
                MovaraHub connects your guard mobile app and control-room dashboard.
                Capture shifts, checkpoint scans, incidents, panic alerts, and route pings in the field, then monitor all activity in real time.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
                <Button asChild size="lg" className="w-full bg-accent font-mono text-xs uppercase tracking-[0.2em] text-accent-foreground hover:bg-accent/90 shadow-[0_0_30px_-4px_hsl(var(--accent)/0.6)] sm:w-auto">
                  <Link to="/login">Open Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full border-border bg-card/50 font-mono text-xs uppercase tracking-[0.2em] hover:border-accent hover:text-white sm:w-auto">
                  <Link to="/how-it-works">See How It Works</Link>
                </Button>
              </div>

              {/* Mini stats */}
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Offline-first guard app</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success" /> QR + GPS checkpoint verification</div>
                <div className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Live dashboard monitoring</div>
              </div>
            </div>

            {/* Live console mock */}
            <div className="md:col-span-4">
              <div className="relative panel p-0 overflow-hidden corner-bracket">
                <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em]">
                  <span className="flex items-center gap-2 text-accent">
                    <Eye className="h-3 w-3" /> LIVE OPS FEED
                  </span>
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  </span>
                </div>
                <div className="space-y-3 p-4 font-mono text-[11px]">
                  {[
                    { t: "03:42:17", l: "GUARD-0142 · checkpoint scanned @ GATE-A", c: "text-success" },
                    { t: "03:41:55", l: "route_ping · location heartbeat synced", c: "text-success" },
                    { t: "03:41:02", l: "incident_4521 · photo report submitted", c: "text-muted-foreground" },
                    { t: "03:40:18", l: "WARN · missed checkpoint window", c: "text-warning" },
                    { t: "03:39:44", l: "GUARD-0098 · shift started @ SITE-S2", c: "text-success" },
                    { t: "03:38:22", l: "panic_alert · acknowledged by control room", c: "text-muted-foreground" },
                  ].map((row, i) => (
                    <div key={i} className="flex min-w-0 items-start gap-3">
                      <span className="shrink-0 text-muted-foreground/60">{row.t}</span>
                      <span className={`min-w-0 break-words ${row.c}`}>{row.l}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border bg-card/60 px-4 py-3">
                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px] uppercase tracking-[0.18em]">
                    <div>
                      <div className="text-muted-foreground">On Duty</div>
                      <div className="mt-0.5 text-base text-accent">Live</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Patrol Logs</div>
                      <div className="mt-0.5 text-base text-foreground">Synced</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Alerts</div>
                      <div className="mt-0.5 text-base text-warning">Tracked</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <section className="min-w-0 overflow-x-clip border-b border-border bg-card/40 py-3">
        <div className="marquee-fade flex w-full min-w-0 overflow-hidden">
          <div className="ticker flex shrink-0 items-center gap-10 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.22em]">
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                <span className="text-accent">▸</span>
                <span className="text-muted-foreground">{t}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="border-b border-border py-10">
        <div className="container">
          <div className="text-center font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            ◆ Built for real guard teams and control-room supervisors ◆
          </div>
          <div className="mt-6 grid grid-cols-2 items-center gap-6 sm:grid-cols-3 sm:gap-8 md:grid-cols-6">
            {trustedBy.map((b) => (
              <div key={b} className="text-center font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 hover:text-foreground transition-colors">
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHONE MOCKUP — scroll-driven field sim */}
      <PhoneMockup />

      {/* STATS — operational metrics */}
      <section className="border-b border-border bg-card/30">
        <div className="container py-16">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">// OPERATIONAL_METRICS</div>
          <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="relative panel p-6 corner-bracket">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  METRIC {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-3 text-5xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Oswald, sans-serif" }}>
                  {s.v}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="border-b border-border py-20">
        <div className="container">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">// CAPABILITY_MATRIX</div>
              <h2 className="mt-4 text-4xl font-bold uppercase leading-[0.95] md:text-5xl" style={{ fontFamily: "Oswald, sans-serif" }}>
                Built for the<br />Guard + Control Room loop.
              </h2>
              <p className="mt-6 max-w-sm text-muted-foreground leading-relaxed">
                Every capability maps to a real workflow: guard action in the app, synced evidence in the dashboard, and clear operational follow-up.
              </p>
              <Link to="/features" className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-accent hover:underline">
                Full capability matrix <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-6 md:col-span-8 md:grid-cols-2">
              {capabilities.map((c, i) => (
                <div key={i} className="group relative panel p-6 hover:border-accent/50 transition-colors corner-bracket">
                  <div className="flex items-start justify-between">
                    <div className="grid h-10 w-10 place-items-center border border-accent/30 bg-accent/5 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <c.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      CAP-{String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold uppercase tracking-tight" style={{ fontFamily: "Oswald, sans-serif" }}>
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DEPLOYMENT TIMELINE */}
      <section className="relative min-w-0 overflow-hidden border-b border-border bg-card/40 py-20">
        <div className="absolute inset-0 tactical-grid opacity-30" />
        <div className="container relative">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">// DEPLOYMENT_PROTOCOL</div>
              <h2 className="mt-4 text-4xl font-bold uppercase leading-[0.95] md:text-5xl" style={{ fontFamily: "Oswald, sans-serif" }}>
                Start with your team.<br />
                <span className="text-accent">Scale by site.</span>
              </h2>
            </div>
            <Link to="/how-it-works" className="font-mono text-xs uppercase tracking-[0.22em] text-accent hover:underline">
              Full deployment doctrine →
            </Link>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { t: "STEP 01", icon: Users, h: "Onboard Company & Guards", d: "Create your dashboard account, register guards, and link each guard to your company and assigned site." },
              { t: "STEP 02", icon: QrCode, h: "Set Sites & Checkpoints", d: "Create sites, place checkpoint QR codes, and set checkpoint GPS coordinates and scan radius for verification." },
              { t: "STEP 03", icon: Activity, h: "Run Daily Operations", d: "Guards start shifts, scan checkpoints, report incidents, and send route pings while control room watches activity live." },
            ].map((s, i) => (
              <div key={i} className="relative panel p-6 corner-bracket">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-accent">{s.t}</span>
                  <span className="grid h-7 w-7 place-items-center border border-border font-mono text-[11px]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <s.icon className="mt-6 h-7 w-7 text-accent" strokeWidth={1.5} />
                <h3 className="mt-4 text-lg font-semibold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>{s.h}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — field reports */}
      <section className="border-b border-border py-20">
        <div className="container">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">// FIELD_REPORTS</div>
          <h2 className="mt-4 max-w-3xl text-4xl font-bold uppercase leading-[0.95] md:text-5xl" style={{ fontFamily: "Oswald, sans-serif" }}>
            Trusted by teams running<br />real patrol operations.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="relative panel p-6 corner-bracket">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                  <span className="text-accent">★★★★★</span>
                  <span className="text-muted-foreground">REPORT-{String(i + 1).padStart(3, "0")}</span>
                </div>
                <p className="mt-5 text-base leading-relaxed text-foreground">"{t.text}"</p>
                <div className="mt-6 border-t border-border pt-4">
                  <div className="font-semibold">{t.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{t.role}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{t.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative min-w-0 overflow-hidden border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 tactical-grid opacity-40" />
        <div className="absolute left-0 top-0 h-1.5 w-full stencil-stripe opacity-80" />
        <div className="container relative py-20">
          <div className="grid gap-12 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">◆ READY · SET · DEPLOY</div>
              <h2 className="mt-4 text-5xl font-bold uppercase leading-[0.92] md:text-7xl" style={{ fontFamily: "Oswald, sans-serif" }}>
                Stop chasing updates.<br />
                <span className="text-accent">Start seeing operations live.</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                Use one system for guard actions and dashboard oversight: shifts, scans, incidents, alerts, and reports.
              </p>
            </div>
            <div className="md:col-span-4">
              <div className="panel p-6 corner-bracket relative">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">// NEXT_STEP()</div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Add your first sites and guards, then monitor activity from one dashboard.
                </p>
                <Button asChild size="lg" className="mt-5 w-full bg-accent font-mono text-xs uppercase tracking-[0.22em] text-accent-foreground hover:bg-accent/90 shadow-[0_0_30px_-4px_hsl(var(--accent)/0.6)]">
                  <Link to="/login">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="mt-2 w-full font-mono text-[11px] uppercase tracking-[0.2em]">
                  <Link to="/contact">Speak to operations →</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}