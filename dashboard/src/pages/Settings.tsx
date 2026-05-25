import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "sonner";
import { Settings as SettingsIcon, Edit, Key, CreditCard } from "lucide-react";

type CompanySettings = {
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  policeEmail: string;
};

export default function Settings() {
  const [company, setCompany] = useState<CompanySettings>({
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    policeEmail: "",
  });
  const [editCompany, setEditCompany] = useState<CompanySettings>({
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    policeEmail: "",
  });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [activeDialog, setActiveDialog] = useState<"company" | "password" | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<CompanySettings>("/company-settings/");
        setCompany(data);
        setEditCompany(data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load settings");
      }
    })();
  }, []);

  const saveCompany = async () => {
    try {
      setSaving(true);
      const data = await apiPost<CompanySettings>("/company-settings/", editCompany);
      setCompany(data);
      setEditCompany(data);
      setActiveDialog(null);
      toast.success("Company profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = () => {
    toast.info("Password change is not enabled yet");
    setActiveDialog(null);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Info Card - Read Only */}
        <div className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold">Company Information</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This information appears on client reports
              </p>
            </div>
            <Dialog open={activeDialog === "company"} onOpenChange={(open) => !open && setActiveDialog(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setActiveDialog("company")}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit company profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your company information here.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Company name</Label>
                    <Input
                      value={editCompany.companyName}
                      onChange={(e) => setEditCompany({ ...editCompany, companyName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact email</Label>
                    <Input
                      type="email"
                      value={editCompany.contactEmail}
                      onChange={(e) => setEditCompany({ ...editCompany, contactEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact phone</Label>
                    <Input
                      value={editCompany.contactPhone}
                      onChange={(e) => setEditCompany({ ...editCompany, contactPhone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Police email</Label>
                    <Input
                      type="email"
                      value={editCompany.policeEmail}
                      onChange={(e) => setEditCompany({ ...editCompany, policeEmail: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      rows={3}
                      value={editCompany.address}
                      onChange={(e) => setEditCompany({ ...editCompany, address: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setEditCompany(company);
                    setActiveDialog(null);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={() => void saveCompany()} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-4 space-y-3">
            <div className="border-b pb-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Company name
              </Label>
              <p className="mt-1 font-medium">{company.companyName || "Not set"}</p>
            </div>
            <div className="border-b pb-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Contact email
              </Label>
              <p className="mt-1">{company.contactEmail || "Not set"}</p>
            </div>
            <div className="border-b pb-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Contact phone
              </Label>
              <p className="mt-1">{company.contactPhone || "Not set"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Police email
              </Label>
              <p className="mt-1">{company.policeEmail || "Not set"}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Address
              </Label>
              <p className="mt-1 whitespace-pre-wrap">{company.address || "Not set"}</p>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <h3 className="text-base font-semibold">Subscription</h3>
          <div className="mt-3 rounded-lg border bg-muted/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  Current plan
                </div>
                <div className="mt-1 text-lg font-semibold">Pro</div>
              </div>
              <Badge className="bg-accent/15 text-accent hover:bg-accent/15">Active</Badge>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">$149/mo · Renews monthly</div>
          </div>
          <Button variant="outline" className="mt-4 w-full">
            <CreditCard className="h-4 w-4 mr-2" />
            Manage plan
          </Button>
        </div>

        {/* Password Change Card */}
        <div className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)] lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Change your password or manage security settings
              </p>
            </div>
            <Dialog open={activeDialog === "password"} onOpenChange={(open) => !open && setActiveDialog(null)}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setActiveDialog("password")}>
                  <Key className="h-4 w-4 mr-2" />
                  Change password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                  <DialogTitle>Change password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and choose a new one.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Current password</Label>
                    <Input
                      type="password"
                      value={pw.current}
                      onChange={(e) => setPw({ ...pw, current: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New password</Label>
                    <Input
                      type="password"
                      value={pw.next}
                      onChange={(e) => setPw({ ...pw, next: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm new password</Label>
                    <Input
                      type="password"
                      value={pw.confirm}
                      onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setPw({ current: "", next: "", confirm: "" });
                    setActiveDialog(null);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={changePassword}>Update password</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600">🔒</div>
              <div className="text-sm">
                <p className="font-medium">Security tip</p>
                <p className="text-muted-foreground mt-1">
                  Use a strong, unique password that you don't use on other websites.
                  Enable two-factor authentication for additional security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}