import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Lock, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `relative font-mono text-[11px] uppercase tracking-[0.22em] transition-colors hover:text-accent ${
      isActive
        ? "text-accent after:absolute after:-bottom-[22px] after:left-0 after:right-0 after:h-[2px] after:bg-accent"
        : "text-muted-foreground"
    }`;

  const mobileLinkCls = ({ isActive }: { isActive: boolean }) =>
    `block border-l-2 px-4 py-3 font-mono text-xs uppercase tracking-[0.22em] transition-colors ${
      isActive
        ? "border-accent bg-accent/10 text-accent"
        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
    }`;

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
      {/* Tactical command bar */}


      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between gap-3 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-2 group sm:gap-3">
            <div className="relative">
              <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-md border border-accent/40 bg-card sm:h-11 sm:w-11">
                <img src="/logo.png" alt="MovaraHub logo" className="h-7 w-7 object-contain sm:h-9 sm:w-9" />
              </div>
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </div>
            <div className="min-w-0 leading-none">
              <div className="truncate text-base font-bold tracking-wide uppercase sm:text-lg" style={{ fontFamily: "Oswald, sans-serif" }}>
                Movara<span className="text-accent">Hub</span>
              </div>
              <div className="mt-1 hidden font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground sm:block">
                ◆ Guard App + Operations Dashboard
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/features" className={linkCls}>Capabilities</NavLink>
            <NavLink to="/how-it-works" className={linkCls}>Operations</NavLink>
            <NavLink to="/pricing" className={linkCls}>Plans</NavLink>
            <NavLink to="/contact" className={linkCls}>Contact</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden font-mono text-[11px] uppercase tracking-[0.2em] sm:inline-flex">
              <Link to="/login"><Lock className="mr-1.5 h-3.5 w-3.5" />Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="hidden bg-accent font-mono text-[11px] uppercase tracking-[0.2em] text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_-4px_hsl(var(--accent)/0.5)] md:inline-flex"
            >
              <Link to="/login">Get Started</Link>
            </Button>

            {/* Mobile menu trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-border bg-card/50 md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[82%] max-w-sm border-l-border bg-background p-0">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">// NAVIGATION</span>
                </div>
                <nav className="flex flex-col py-3">
                  <NavLink to="/features" onClick={() => setOpen(false)} className={mobileLinkCls}>Capabilities</NavLink>
                  <NavLink to="/how-it-works" onClick={() => setOpen(false)} className={mobileLinkCls}>Operations</NavLink>
                  <NavLink to="/pricing" onClick={() => setOpen(false)} className={mobileLinkCls}>Plans</NavLink>
                  <NavLink to="/contact" onClick={() => setOpen(false)} className={mobileLinkCls}>Contact</NavLink>
                </nav>
                <div className="mt-2 space-y-2 border-t border-border px-5 py-5">
                  <Button asChild variant="outline" className="w-full border-border font-mono text-[11px] uppercase tracking-[0.2em]" onClick={() => setOpen(false)}>
                    <Link to="/login"><Lock className="mr-1.5 h-3.5 w-3.5" />Sign in</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-accent font-mono text-[11px] uppercase tracking-[0.2em] text-accent-foreground hover:bg-accent/90"
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/login">Get Started</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="min-w-0 flex-1">{children}</main>

      <footer className="mt-24 min-w-0 border-t border-border bg-card/30">
        <div className="container py-14">
          <div className="grid min-w-0 gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-md border border-accent/40 bg-card">
                  <img src="/logo.png" alt="MovaraHub logo" className="h-9 w-9 object-contain" />
                </div>
                <span className="text-xl font-bold uppercase tracking-wide" style={{ fontFamily: "Oswald, sans-serif" }}>
                  Movara<span className="text-accent">Hub</span>
                </span>
              </div>
              <p className="mt-5 max-w-sm text-sm text-muted-foreground leading-relaxed">
                Run guard operations with one connected workflow: field actions in the mobile app, live visibility and reporting in the dashboard.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Offline-first", "QR + GPS verification", "Live ops view", "Audit-ready logs"].map((b) => (
                  <span key={b} className="border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">PLATFORM</div>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground">Capabilities</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Plans</Link></li>
                <li><Link to="/login" className="hover:text-foreground">Sign in</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">COMPANY</div>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><Link to="/how-it-works" className="hover:text-foreground">Operations</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">LEGAL</div>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
            <div className="md:col-span-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">24/7 OPS DESK</div>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                
                <li>hello@movarasec.com</li>
               
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="container flex min-w-0 flex-col items-center justify-between gap-3 py-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground md:flex-row">
            <div className="max-w-full text-center break-words md:text-left">
              © {new Date().getFullYear()} MovaraHub Security Systems · Lic. PSIA-KE-2847
              <span className="mx-2 hidden text-border md:inline">|</span>
              <span className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 md:mt-0 md:inline-flex md:justify-start">
                <Link to="/privacy" className="hover:text-foreground">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-foreground">
                  Terms
                </Link>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              All systems nominal
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
