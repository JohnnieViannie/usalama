import MarketingLayout from "@/components/MarketingLayout";
import { Mail, Phone, MapPin, ArrowRight, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const channels = [
  { icon: Phone, code: "CH-01", label: "Operations Support Line", value: "+254 700 000 000", note: "Deployment and account support" },
  { icon: Mail, code: "CH-02", label: "Support Email", value: "hello@movarasec.com", note: "Platform and rollout inquiries" },
  { icon: MapPin, code: "CH-03", label: "Operations Office", value: "Westlands, Nairobi", note: "Meetings by appointment" },
];

export default function Contact() {
  const [sending, setSending] = useState(false);
  return (
    <MarketingLayout>
      <section className="relative overflow-hidden border-b border-border" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 tactical-grid opacity-40" />
        <div className="container relative py-20">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em]">
            <span className="flex items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent">
              <Crosshair className="h-3 w-3" /> OPEN CHANNEL
            </span>
            <span className="text-muted-foreground">SECURE COMMUNICATION</span>
          </div>
          <h1 className="mt-8 text-5xl font-bold uppercase leading-[0.95] md:text-7xl" style={{ fontFamily: "Oswald, sans-serif" }}>
            Talk to the MovaraHub Team.<br />
            <span className="text-accent">Plan your rollout with us.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Reach us for onboarding, site setup, guard workflows, dashboard rollout, or ongoing operational support.
          </p>
        </div>
      </section>

      <section className="border-b border-border py-12">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {channels.map((c) => (
              <div key={c.code} className="group relative panel p-6 corner-bracket hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center border border-accent/30 bg-accent/5 text-accent">
                    <c.icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{c.code}</span>
                </div>
                <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {c.label}
                </div>
                <div className="mt-1 text-xl font-semibold tracking-tight text-foreground">{c.value}</div>
                <p className="mt-2 text-sm text-muted-foreground">{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">// SUBMIT_BRIEF</div>
            <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.95] md:text-5xl" style={{ fontFamily: "Oswald, sans-serif" }}>
              Send your<br />operations brief.
            </h2>
            <p className="mt-6 max-w-sm text-muted-foreground leading-relaxed">
              Share your current setup, number of guards, sites, and what you need to improve. We will reply with a practical rollout approach.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSending(true);
              setTimeout(() => {
                setSending(false);
                toast.success("Brief received. Our team will respond shortly.");
                (e.target as HTMLFormElement).reset();
              }, 700);
            }}
            className="md:col-span-7 panel p-8 corner-bracket relative space-y-5"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">// Contact name</label>
                <Input required className="mt-2 bg-background border-border focus:border-accent" placeholder="Jane Mwangi" />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">// Company</label>
                <Input required className="mt-2 bg-background border-border focus:border-accent" placeholder="SecureGuard Ltd" />
              </div>
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">// Email</label>
              <Input required type="email" className="mt-2 bg-background border-border focus:border-accent" placeholder="jane@firm.co" />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">// Operations brief</label>
              <Textarea required rows={5} className="mt-2 bg-background border-border focus:border-accent" placeholder="We run 80 guards across 12 sites. We need better shift visibility, verified checkpoint scans, and live dashboard monitoring." />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="bg-accent font-mono text-xs uppercase tracking-[0.22em] text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_-4px_hsl(var(--accent)/0.6)]"
            >
              {sending ? "Sending..." : <>Send Brief <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>}
            </Button>
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}
