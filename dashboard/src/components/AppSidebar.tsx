import {
  LayoutDashboard,
  Shield,
  QrCode,
  CalendarClock,
  Footprints,
  AlertTriangle,
  CarFront,
  Siren,
  Settings,
  ClipboardList,
  FileCheck,
  GraduationCap,
  Users,
  FileSearch,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { apiGet } from "@/lib/api";

const operationsItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Guards", url: "/guards", icon: Shield },
  { title: "Sites & Checkpoints", url: "/checkpoints", icon: QrCode },
  { title: "Shifts", url: "/shifts", icon: CalendarClock },
  { title: "Patrols", url: "/patrols", icon: Footprints },
  { title: "Incidents", url: "/incidents", icon: AlertTriangle },
  { title: "Investigations", url: "/incidents/investigations", icon: FileSearch },
  { title: "Entrance Registration", url: "/entrance-analytics", icon: CarFront },
  { title: "Alerts", url: "/alerts", icon: Siren },
  { title: "Settings", url: "/settings", icon: Settings },
];

const corporateItems = [
  { title: "Security survey", url: "/corporate/site-surveys", icon: ClipboardList },
  { title: "Physical audits", url: "/corporate/compliance-audits", icon: FileCheck },
  { title: "Training", url: "/corporate/training", icon: GraduationCap },
  { title: "Visitor sessions", url: "/corporate/visitor-sessions", icon: Users },
];

type NavItem = { title: string; url: string; icon: LucideIcon };

function NavGroup({
  label,
  items,
  collapsed,
  unreadReports,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
  unreadReports: number;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end
                  className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span>{item.title}</span>
                      {item.url === "/incidents" && unreadReports > 0 && (
                        <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                          {unreadReports}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  useLocation();
  const [unreadReports, setUnreadReports] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await apiGet<{ unread?: number }>("/incidents/unread-count/");
        if (active) setUnreadReports(Number(data.unread ?? 0));
      } catch {
        if (active) setUnreadReports(0);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <img src="/logo.png" alt="MovaraHub logo" className="h-8 w-8 rounded-md object-cover" />
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold text-sidebar-foreground">MovaraHub</div>
              <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">GuardTech OS</div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup
          label="Operations"
          items={operationsItems}
          collapsed={collapsed}
          unreadReports={unreadReports}
        />
        <NavGroup
          label="Corporate Security Platform"
          items={corporateItems}
          collapsed={collapsed}
          unreadReports={unreadReports}
        />
      </SidebarContent>
    </Sidebar>
  );
}
