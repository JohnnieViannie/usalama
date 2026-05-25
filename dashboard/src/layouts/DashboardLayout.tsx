import { ReactNode, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import PlatformTypeOnboarding from "@/components/PlatformTypeOnboarding";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogOut } from "lucide-react";
import {
  logout,
  type OrganizationType,
  requireClientSession,
  sessionNeedsOrganizationType,
  setCompanyOrganizationType,
  updateSessionOrganization,
} from "@/lib/auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function DashboardLayout({ children, title }: { children: ReactNode; title: string }) {
  const navigate = useNavigate();
  const session = requireClientSession();
  const [platformType, setPlatformType] = useState<OrganizationType | null>(null);
  const [savingPlatform, setSavingPlatform] = useState(false);
  const needsPlatformType = session ? sessionNeedsOrganizationType(session) : false;

  if (!session) return <Navigate to="/login" replace />;

  const savePlatformType = async () => {
    if (!platformType) return toast.error("Please select how you will use the platform");
    setSavingPlatform(true);
    try {
      const result = await setCompanyOrganizationType(session.email, platformType);
      updateSessionOrganization(result.organizationType, result.corporateSecurityEnabled);
      toast.success("Platform preference saved");
      window.location.reload();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to save platform type";
      if (message.toLowerCase().includes("verified")) {
        logout();
        navigate(`/login?verify=1&email=${encodeURIComponent(session.email)}`);
        toast.error("Verify your email before continuing.");
        return;
      }
      toast.error(message);
    } finally {
      setSavingPlatform(false);
    }
  };

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider>
      <Dialog open={needsPlatformType}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>How will you use MovaraHub?</DialogTitle>
            <DialogDescription>
              Choose your organization type so we can show the right tools in your dashboard.
            </DialogDescription>
          </DialogHeader>
          <PlatformTypeOnboarding
            value={platformType}
            onChange={setPlatformType}
            onContinue={savePlatformType}
            loading={savingPlatform}
          />
        </DialogContent>
      </Dialog>
      <div className="flex min-h-screen w-full min-w-0 overflow-x-clip bg-muted/30">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-3 backdrop-blur sm:gap-3 sm:px-4">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <SidebarTrigger />
              <h1 className="truncate text-sm font-semibold sm:text-base">{title}</h1>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 sm:px-3">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left sm:block">
                    <div className="text-xs font-medium leading-none">{session.name}</div>
                    <div className="text-[10px] text-muted-foreground">{session.company}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{session.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="min-w-0 flex-1 p-3 sm:p-4 md:p-6">{children}</main>
          <footer className="mt-auto border-t border-border bg-background/90 px-3 py-3 text-center text-[11px] text-muted-foreground sm:px-4 sm:text-left">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 sm:flex-row">
              <span>© {new Date().getFullYear()} MovaraHub</span>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                <Link to="/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="underline-offset-4 hover:text-foreground hover:underline">
                  Terms of Service
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
