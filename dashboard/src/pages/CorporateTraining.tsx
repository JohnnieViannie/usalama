import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  fetchGuardTrainingCertificateHtml,
  getCompanyTrainingSettings,
  getTrainingModule,
  listTrainingModules,
  listTrainingProgressTeam,
  saveCompanyTrainingSettings,
} from "@/lib/corporateApi";
import type {
  OrgTrainingSettings,
  TrainingModuleDetail,
  TrainingModuleRow,
  TrainingTeamResponse,
} from "@/lib/corporateTypes";
import { toast } from "sonner";
import { BookOpen, GraduationCap, RefreshCw, Settings2, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";

function statusBadge(status: string) {
  switch (status) {
    case "passed":
      return <Badge className="bg-green-600">Passed</Badge>;
    case "in_progress":
      return <Badge variant="secondary">In progress</Badge>;
    case "failed":
      return <Badge variant="destructive">Failed quiz</Badge>;
    default:
      return <Badge variant="outline">Not started</Badge>;
  }
}

export default function CorporateTraining() {
  const [team, setTeam] = useState<TrainingTeamResponse | null>(null);
  const [modules, setModules] = useState<TrainingModuleRow[]>([]);
  const [preview, setPreview] = useState<TrainingModuleDetail | null>(null);
  const [previewSection, setPreviewSection] = useState(0);
  const [settings, setSettings] = useState<OrgTrainingSettings>({
    organizationDisplayName: "",
    centralSecurityEmail: "",
    ticketingSystemUrl: "",
    anonymousHotline: "",
    dataRetentionDays: 30,
    legislationReference: "applicable data protection law",
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, m, s] = await Promise.all([
        listTrainingProgressTeam(),
        listTrainingModules(),
        getCompanyTrainingSettings(),
      ]);
      setTeam(t);
      setModules(m);
      setSettings(s);
      const primary = m.find((x) => x.moduleType === "structured") ?? m[0];
      if (primary) {
        const detail = await getTrainingModule(primary.id);
        setPreview(detail);
        setPreviewSection(0);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load training data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await saveCompanyTrainingSettings(settings);
      toast.success("Training settings saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const summary = team?.summary;
  const sections = preview?.content?.sections ?? [];
  const currentSection = sections[previewSection];

  return (
    <DashboardLayout title="Security training">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Configure organisation training settings and monitor guard completion. Guards complete
          courses in the mobile app.
        </p>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className="mr-1 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview" className="gap-1">
              <Users className="h-4 w-4" /> Team progress
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1">
              <Settings2 className="h-4 w-4" /> Organisation
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-1">
              <BookOpen className="h-4 w-4" /> Module preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {summary && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Linked guards</CardDescription>
                    <CardTitle className="text-2xl">{summary.totalGuards}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Passed</CardDescription>
                    <CardTitle className="text-2xl">
                      {summary.passedCount}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        ({summary.passedPercent}%)
                      </span>
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>In progress</CardDescription>
                    <CardTitle className="text-2xl">{summary.inProgressCount}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Expiring ≤ 30 days</CardDescription>
                    <CardTitle className="text-2xl">{summary.expiringWithin30Days}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
            )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                    <TableHead>Guard</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Certified</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Cert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {(team?.guards ?? []).length === 0 ? (
                <TableRow>
                      <TableCell colSpan={8} className="text-muted-foreground">
                        No linked guards. Link guards from the Guards page first.
                  </TableCell>
                </TableRow>
              ) : (
                    team?.guards.map((g) => (
                      <TableRow key={g.guardId}>
                        <TableCell>
                          <div className="font-medium">{g.name}</div>
                          <div className="text-xs text-muted-foreground">{g.email}</div>
                        </TableCell>
                        <TableCell>{g.siteName ?? "—"}</TableCell>
                        <TableCell className="w-36">
                          <Progress value={g.progressPercent} className="h-2" />
                          <span className="text-xs text-muted-foreground">{g.progressPercent}%</span>
                        </TableCell>
                        <TableCell>{statusBadge(g.status)}</TableCell>
                        <TableCell>{g.quizScore != null ? `${g.quizScore}%` : "—"}</TableCell>
                    <TableCell>
                          {g.certifiedAt ? new Date(g.certifiedAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                          {g.certExpiresAt ? new Date(g.certExpiresAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                          {g.status === "passed" && g.moduleId ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const html = await fetchGuardTrainingCertificateHtml(
                                    g.moduleId!,
                                    g.guardId,
                                  );
                                  const w = window.open("", "_blank");
                                  if (w) {
                                    w.document.write(html);
                                    w.document.close();
                                  }
                                } catch (e) {
                                  toast.error(
                                    e instanceof Error ? e.message : "Certificate unavailable",
                                  );
                                }
                              }}
                            >
                        View
                      </Button>
                          ) : (
                            "—"
                          )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

            {modules[0] && (
              <p className="text-xs text-muted-foreground">
                Primary module: <strong>{modules[0].title}</strong> · Passing score{" "}
                {modules[0].meta?.passingScore ?? 80}%
              </p>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Organisation training settings</CardTitle>
                <CardDescription>
                  These values replace placeholders in training content shown to guards on mobile.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid max-w-xl gap-4">
                <div className="space-y-1.5">
                  <Label>Organisation display name</Label>
                  <Input
                    value={settings.organizationDisplayName}
                    onChange={(e) =>
                      setSettings({ ...settings, organizationDisplayName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Central security email</Label>
                  <Input
                    type="email"
                    value={settings.centralSecurityEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, centralSecurityEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Ticketing / incident portal URL</Label>
                  <Input
                    value={settings.ticketingSystemUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, ticketingSystemUrl: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Anonymous hotline (optional)</Label>
                  <Input
                    value={settings.anonymousHotline}
                    onChange={(e) =>
                      setSettings({ ...settings, anonymousHotline: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>CCTV retention (days)</Label>
                    <Input
                      type="number"
                      value={settings.dataRetentionDays}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          dataRetentionDays: Number(e.target.value) || 30,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Legislation reference</Label>
                    <Input
                      value={settings.legislationReference}
                      onChange={(e) =>
                        setSettings({ ...settings, legislationReference: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button onClick={() => void saveSettings()} disabled={savingSettings}>
                  {savingSettings ? "Saving…" : "Save settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview">
            {preview && (
              <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <GraduationCap className="h-4 w-4" />
                      Sections
                    </CardTitle>
                    <CardDescription>{preview.title}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 p-2">
                    {sections.map((s, i) => (
                      <Button
                        key={s.id}
                        variant={previewSection === i ? "secondary" : "ghost"}
                        className="h-auto w-full justify-start whitespace-normal py-2 text-left text-sm"
                        onClick={() => setPreviewSection(i)}
                      >
                        {i + 1}. {s.title}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>{currentSection?.title}</CardTitle>
                    <CardDescription>Read-only preview (same content guards see)</CardDescription>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                    {currentSection && (
                      <>
                        <ReactMarkdown>{currentSection.contentMd}</ReactMarkdown>
                        {currentSection.takeaways?.length > 0 && (
                          <div className="mt-6 rounded-lg border bg-muted/40 p-4 not-prose">
                            <p className="mb-2 text-sm font-semibold">Key takeaways</p>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                              {currentSection.takeaways.map((t) => (
                                <li key={t}>{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
}
