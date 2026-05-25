import { useEffect, useRef, useState } from "react";
import GuardAppScreen from "./GuardAppScreen";

/** Scroll-driven phone mockup. Computes 0→1 progress as the section
 *  travels through the viewport, then forwards it to the app screen. */
export default function PhoneMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [autoProgress, setAutoProgress] = useState(0);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = vh + rect.height;
      const passed = vh - rect.top;
      const p = Math.min(1, Math.max(0, passed / total));
      setScrollProgress(p);
      setInView(rect.bottom > 0 && rect.top < vh);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Continuous auto-cycle: full loop every 16s (4s per stage)
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const loop = (t: number) => {
      const elapsed = (t - start) / 16000;
      setAutoProgress(elapsed - Math.floor(elapsed));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  // Blend: auto runs always, scroll nudges it forward when user scrolls past
  const progress = autoProgress;

  const stages = [
    { k: "IDLE", l: "Shift Active" },
    { k: "SCAN", l: "Checkpoint Scan" },
    { k: "REPORT", l: "Incident Capture" },
    { k: "SYNC", l: "Offline Sync" },
  ];
  const activeStage = progress < 0.25 ? 0 : progress < 0.5 ? 1 : progress < 0.75 ? 2 : 3;

  return (
    <section
      ref={ref}
      className="relative min-w-0 overflow-hidden border-b border-border bg-card/20"
    >
      <div className="absolute inset-0 tactical-grid opacity-25" />
      <div className="container relative grid gap-12 py-16 sm:py-20 md:grid-cols-12 md:py-32">
        {/* LEFT — narrative */}
        <div className="md:col-span-6 md:sticky md:top-24 md:self-start">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
            // GUARD_APP / FIELD_SIM
          </div>
          <h2
            className="mt-4 text-3xl font-bold uppercase leading-[0.95] sm:text-4xl md:text-6xl"
            style={{ fontFamily: "Oswald, sans-serif" }}
          >
          
            <span className="text-accent">a guard's shift</span><br />
            in real time
          </h2>
          <p className="mt-6 max-w-md text-muted-foreground leading-relaxed">
            This is the actual flow your team will use in the field — start a shift, scan checkpoints,
            capture incidents, and sync the queue when back online.
          </p>

          {/* Stage tracker */}
          <div className="mt-10 space-y-2">
            {stages.map((s, i) => {
              const active = i === activeStage;
              const done = i < activeStage;
              return (
                <div
                  key={s.k}
                  className={`flex items-center gap-4 border px-4 py-3 transition-colors ${
                    active
                      ? "border-accent bg-accent/10"
                      : done
                      ? "border-success/40 bg-success/5"
                      : "border-border bg-card/40"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center border font-mono text-[11px] ${
                      active
                        ? "border-accent text-accent"
                        : done
                        ? "border-success text-success"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Stage {s.k}
                    </div>
                    <div
                      className={`text-sm font-semibold uppercase tracking-tight ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                      style={{ fontFamily: "Oswald, sans-serif" }}
                    >
                      {s.l}
                    </div>
                  </div>
                  {active && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                      ● Live
                    </span>
                  )}
                </div>
              );
            })}
          </div>

         
        </div>

        {/* RIGHT — phone */}
        <div className="flex min-w-0 justify-center overflow-x-clip md:col-span-6 md:sticky md:top-24 md:self-start">
          <PhoneFrame>
            <GuardAppScreen progress={progress} />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative origin-top scale-[0.68] max-[400px]:scale-[0.72] sm:scale-90 md:scale-100">
      {/* corner brackets */}
      <div className="pointer-events-none absolute -inset-6 corner-bracket" />
      <div
        className="relative h-[640px] w-[310px] rounded-[44px] border-[10px] border-[hsl(215,30%,8%)] bg-[hsl(215,40%,7%)] shadow-[0_30px_80px_-20px_hsl(215,50%,2%/0.9),0_0_0_1px_hsl(var(--accent)/0.15),0_0_60px_-10px_hsl(var(--accent)/0.25)]"
      >
        {/* notch */}
        <div className="absolute left-1/2 top-0 z-30 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[hsl(215,30%,8%)]" />
        {/* side buttons */}
        <div className="absolute -left-[14px] top-24 h-10 w-1 rounded-l bg-[hsl(215,30%,8%)]" />
        <div className="absolute -left-[14px] top-40 h-16 w-1 rounded-l bg-[hsl(215,30%,8%)]" />
        <div className="absolute -right-[14px] top-32 h-20 w-1 rounded-r bg-[hsl(215,30%,8%)]" />
        {/* screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[34px]">
          {children}
          {/* screen reflection */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}