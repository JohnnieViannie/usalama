import { useEffect, useState } from "react";
import { QrCode, AlertTriangle, Siren, RefreshCw, MapPin, Radio, Wifi, BatteryFull, Signal, CheckCircle2, type LucideIcon } from "lucide-react";

interface Props {
  /** 0 → 1 scroll progress across the mockup section */
  progress: number;
}

/** Stage map (each ~25% of progress):
 *  0.00–0.25 idle      — home screen, panic banner pulse
 *  0.25–0.50 scan      — QR scanner with laser sweep, "VERIFIED" toast
 *  0.50–0.75 incident  — camera viewfinder + shutter flash
 *  0.75–1.00 sync      — sync queue counts down, all green */
export default function GuardAppScreen({ progress }: Props) {
  const stage = progress < 0.25 ? 0 : progress < 0.5 ? 1 : progress < 0.75 ? 2 : 3;
  const local = Math.min(1, Math.max(0, (progress - stage * 0.25) / 0.25));

  // Live ticking shift timer (always running)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const totalSec = 15791 + tick; // ~04:23:11 base
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");

  // Drifting GPS coords for realism
  const lat = (-1.2921 + Math.sin(tick / 4) * 0.0004).toFixed(4);
  const lng = (36.8219 + Math.cos(tick / 4) * 0.0004).toFixed(4);

  // Battery slowly draining
  const battery = 87 - Math.floor(tick / 30) % 10;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[hsl(215,40%,7%)] text-foreground font-sans">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 font-mono text-[10px] tracking-wider text-foreground/80">
        <span className="tabular-nums">{`${hh}:${mm}`}</span>
        <span className="flex items-center gap-1">
          <Signal className="h-3 w-3" />
          <Wifi className="h-3 w-3" />
          <BatteryFull className="h-3.5 w-3.5" />
          <span className="tabular-nums text-[9px]">{battery}%</span>
        </span>
      </div>

      {/* App header */}
      <div className="px-5 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Guard ID · 0142</div>
            <h3 className="mt-0.5 text-base font-bold uppercase tracking-tight" style={{ fontFamily: "Oswald, sans-serif" }}>
              On Duty · Site S1
            </h3>
          </div>
          <div className="relative">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <div className="absolute inset-0 h-2.5 w-2.5 animate-ping rounded-full bg-success opacity-75" />
          </div>
        </div>

        {/* Shift card */}
        <div className="mt-3 border border-border bg-card/80 p-3">
          <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>Shift · Night Patrol</span>
            <span className="text-success">● Active</span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: "Oswald, sans-serif" }}>
              {hh}:{mm}:{ss}
            </div>
            <button className="bg-accent px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              End Shift
            </button>
          </div>
          {/* Live GPS pulse line */}
          <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              GPS LOCK
            </span>
            <span className="tabular-nums text-foreground/70">{lat}, {lng}</span>
          </div>
        </div>
      </div>

      {/* Action grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 px-5">
        <ActionTile icon={QrCode} label="Scan QR" active={stage === 1} />
        <ActionTile icon={AlertTriangle} label="Incident" active={stage === 2} />
        <ActionTile icon={Siren} label="Panic" active={false} accent />
        <ActionTile icon={RefreshCw} label="Sync" active={stage === 3} spin={stage === 3} />
      </div>

      {/* Last activity */}
      <div className="mt-3 px-5">
        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          <span>Live Feed</span>
          <span className="text-accent">● {tick % 2 === 0 ? "RX" : "TX"}</span>
        </div>
        <LiveFeed tick={tick} />
      </div>

      {/* Panic banner — always present */}
      <div className="absolute inset-x-3 bottom-3 border border-destructive/60 bg-destructive/15 px-3 py-2">
        <div className="flex items-center gap-2">
          <Siren className="h-3.5 w-3.5 text-destructive animate-pulse" />
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-destructive">Hold to trigger panic</div>
        </div>
        <div className="mt-1 text-[10px] text-foreground/80">Control room receives alert + GPS instantly.</div>
      </div>

      {/* ===== STAGE OVERLAYS ===== */}

      {/* Stage 1 — QR scan overlay */}
      {stage === 1 && (
        <div className="absolute inset-0 z-20 bg-[hsl(215,45%,4%)]/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 pt-12 font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="text-accent">◀ Scan Checkpoint</span>
            <span className="text-muted-foreground">Gate-B</span>
          </div>
          <div className="mx-auto mt-8 aspect-square w-[70%] relative">
            {/* viewfinder corners */}
            {[
              "top-0 left-0 border-l-2 border-t-2",
              "top-0 right-0 border-r-2 border-t-2",
              "bottom-0 left-0 border-l-2 border-b-2",
              "bottom-0 right-0 border-r-2 border-b-2",
            ].map((c, i) => (
              <span key={i} className={`absolute ${c} h-6 w-6 border-accent`} />
            ))}
            {/* fake QR */}
            <div className="absolute inset-4 grid grid-cols-8 grid-rows-8 gap-px opacity-60">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className={`${(i * 7) % 3 === 0 ? "bg-foreground" : "bg-transparent"}`} />
              ))}
            </div>
            {/* laser sweep */}
            <div
              className="absolute inset-x-0 h-0.5 bg-accent shadow-[0_0_12px_2px_hsl(var(--accent))]"
              style={{ top: `${local * 100}%` }}
            />
          </div>
          {local > 0.85 && (
            <div className="mx-5 mt-6 flex items-center gap-2 border border-success/50 bg-success/15 px-3 py-2 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-success">Checkpoint verified · GPS OK</span>
            </div>
          )}
        </div>
      )}

      {/* Stage 2 — Incident camera */}
      {stage === 2 && (
        <div className="absolute inset-0 z-20 bg-[hsl(215,45%,4%)]/95">
          <div className="flex items-center justify-between px-5 pt-12 font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="text-accent">◀ New Incident</span>
            <span className="text-muted-foreground">Photo Evidence</span>
          </div>
          <div className="mx-auto mt-6 aspect-[3/4] w-[80%] relative overflow-hidden border border-border bg-[hsl(215,30%,12%)]">
            <div className="absolute inset-0 tactical-grid opacity-50" />
            {/* viewfinder reticle */}
            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 border border-accent/80">
              <span className="absolute -top-1 left-1/2 h-2 w-px -translate-x-1/2 bg-accent" />
              <span className="absolute -bottom-1 left-1/2 h-2 w-px -translate-x-1/2 bg-accent" />
              <span className="absolute -left-1 top-1/2 h-px w-2 -translate-y-1/2 bg-accent" />
              <span className="absolute -right-1 top-1/2 h-px w-2 -translate-y-1/2 bg-accent" />
            </div>
            <div className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-wider text-accent">REC ● 00:0{Math.floor(local * 9)}</div>
            <div className="absolute bottom-2 right-2 font-mono text-[9px] text-muted-foreground">-1.2921, 36.8219</div>
            {/* shutter flash */}
            {local > 0.7 && local < 0.85 && <div className="absolute inset-0 bg-foreground animate-fade-out" />}
          </div>
          <div className="mx-5 mt-4">
            <div className="border border-border bg-card/80 p-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-accent">▸</span> Type: <span className="text-foreground">Suspicious Activity</span>
            </div>
          </div>
          {local > 0.85 && (
            <div className="mx-5 mt-3 flex items-center gap-2 border border-success/50 bg-success/15 px-3 py-2 animate-fade-in">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-success">Report queued for sync</span>
            </div>
          )}
        </div>
      )}

      {/* Stage 3 — Sync overlay */}
      {stage === 3 && (
        <div className="absolute inset-0 z-20 bg-[hsl(215,45%,4%)]/95">
          <div className="flex items-center justify-between px-5 pt-12 font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="text-accent">◀ Offline Queue</span>
            <span className="text-success">● Online</span>
          </div>
          <div className="mx-auto mt-10 grid place-items-center">
            <div className="relative grid h-24 w-24 place-items-center rounded-full border border-accent/40">
              <RefreshCw className="h-10 w-10 text-accent" style={{ animation: "spin 1.2s linear infinite" }} />
              <div className="absolute -inset-2 rounded-full border border-accent/20 radar-sweep opacity-60" />
            </div>
            <div className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Syncing events · {Math.max(0, Math.ceil((1 - local) * 6))} remaining
            </div>
          </div>
          <div className="mx-5 mt-6 space-y-1.5 font-mono text-[10px]">
            {[
              { l: "checkpoint_scan · GATE-A", done: local > 0.15 },
              { l: "incident_4521 · photo+gps", done: local > 0.35 },
              { l: "route_ping · 03:41:55", done: local > 0.55 },
              { l: "shift_event · start", done: local > 0.75 },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between border border-border bg-card/60 px-3 py-1.5">
                <span className="text-foreground/80">{row.l}</span>
                {row.done ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Radio className="h-3.5 w-3.5 text-accent animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionTile({
  icon: Icon,
  label,
  active,
  accent,
  spin,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  accent?: boolean;
  spin?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-1.5 border bg-card/60 py-3 transition-all ${
        active
          ? "border-accent bg-accent/15 shadow-[0_0_20px_-4px_hsl(var(--accent)/0.7)]"
          : accent
          ? "border-destructive/40 bg-destructive/10"
          : "border-border"
      }`}
    >
      <Icon
        className={`h-5 w-5 ${active ? "text-accent" : accent ? "text-destructive" : "text-foreground/80"} ${spin ? "animate-spin" : ""}`}
        strokeWidth={1.6}
      />
      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {active && (
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))]" />
      )}
    </div>
  );
}

function LiveFeed({ tick }: { tick: number }) {
  // Rolling event feed — newest on top, items shift every second
  const events = [
    { t: "Gate-A scan", k: "ok" },
    { t: "Route ping", k: "ok" },
    { t: "Motion · Zone-3", k: "warn" },
    { t: "Heartbeat", k: "ok" },
    { t: "Gate-B scan", k: "ok" },
    { t: "Door sensor", k: "warn" },
  ];
  const offset = tick % events.length;
  const visible = [0, 1, 2].map((i) => events[(offset + i) % events.length]);

  return (
    <div className="mt-1 space-y-1 overflow-hidden">
      {visible.map((e, i) => (
        <div
          key={`${tick}-${i}`}
          className="flex items-center gap-2 border border-border bg-card/60 px-3 py-1.5 animate-fade-in"
          style={{ opacity: 1 - i * 0.25 }}
        >
          <MapPin className={`h-3 w-3 ${e.k === "warn" ? "text-destructive" : "text-accent"}`} />
          <span className="text-[10px] text-foreground/85">{e.t}</span>
          <span className="ml-auto font-mono text-[9px] tabular-nums text-muted-foreground">
            {String(Math.floor(tick / 60) % 60).padStart(2, "0")}:{String((tick + i * 11) % 60).padStart(2, "0")}
          </span>
          <span className={`h-1.5 w-1.5 rounded-full ${e.k === "warn" ? "bg-destructive animate-pulse" : "bg-success"}`} />
        </div>
      ))}
    </div>
  );
}