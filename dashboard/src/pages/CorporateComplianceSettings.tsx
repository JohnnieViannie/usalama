import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCompanyComplianceSettings, saveCompanyComplianceSettings } from "@/lib/corporateApi";
import type { OrgComplianceSettings } from "@/lib/corporateTypes";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function CorporateComplianceSettings() {
  const [form, setForm] = useState<OrgComplianceSettings>({
    organizationDisplayName: "",
    centralSecurityEmail: "",
    ticketingSystemUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const data = await getCompanyComplianceSettings();
        setForm(data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await saveCompanyComplianceSettings(form);
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Compliance organisation settings">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/corporate/compliance-audits">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to audits
        </Link>
      </Button>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Configurable fields</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <>
              <div>
                <Label>Organisation display name</Label>
                <Input
                  value={form.organizationDisplayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, organizationDisplayName: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Central security email</Label>
                <Input
                  type="email"
                  value={form.centralSecurityEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, centralSecurityEmail: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Ticketing / incident reporting URL</Label>
                <Input
                  value={form.ticketingSystemUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ticketingSystemUrl: e.target.value }))
                  }
                />
              </div>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
