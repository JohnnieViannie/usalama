import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { deleteSiteSurvey, getSiteSurvey, patchSiteSurvey } from "@/lib/corporateApi";
import type { SiteSecuritySurveyRow, SiteSurveyPhoto, SiteSurveyReview } from "@/lib/corporateTypes";
import { exportSiteSurveyPdf } from "@/lib/exportSiteSurveyPdf";
import {
  formatPayloadValue,
  getPayloadValue,
  stepsForSection,
  SURVEY_SECTIONS,
} from "@/lib/siteSurveySchema";
import { getFieldMeta, getGuardRecommendation } from "@/lib/surveyFieldMeta";
import { toast } from "sonner";
import { ArrowLeft, Download, Pencil, Trash2 } from "lucide-react";

function SectionPhotos({ photos }: { photos: SiteSurveyPhoto[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (photos.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-medium mb-2">Photos</p>
      <div className="flex flex-wrap gap-2">
        {photos.map((p) => (
          <button
            key={p.id}
            type="button"
            className="rounded-lg overflow-hidden border border-border hover:opacity-90"
            onClick={() => setLightbox(p.url)}
          >
            <img src={p.url} alt="" className="h-20 w-20 object-cover" />
          </button>
        ))}
      </div>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
          role="presentation"
        >
          <img src={lightbox} alt="Evidence" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default function SiteSurveyDetail() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const id = Number(surveyId);
  const [row, setRow] = useState<SiteSecuritySurveyRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewSummary, setReviewSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [payloadJson, setPayloadJson] = useState("{}");
  const [editStatus, setEditStatus] = useState("draft");
  const [deleting, setDeleting] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const load = async () => {
    if (!id || Number.isNaN(id)) return;
    setLoading(true);
    try {
      const data = await getSiteSurvey(id);
      setRow(data);
      setReviewSummary(data.review?.summary ?? "");
      setPayloadJson(JSON.stringify(data.payload ?? {}, null, 2));
      setEditStatus(data.status);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load survey");
      setRow(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  const saveReview = async () => {
    if (!row) return;
    setSaving(true);
    try {
      const review: SiteSurveyReview = {
        ...row.review,
        summary: reviewSummary,
        reviewedAt: new Date().toISOString(),
      };
      const updated = await patchSiteSurvey(row.id, { review });
      setRow(updated);
      toast.success("Review saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const savePayload = async () => {
    if (!row) return;
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadJson) as Record<string, unknown>;
    } catch {
      toast.error("Invalid JSON in survey payload");
      return;
    }
    setSaving(true);
    try {
      const updated = await patchSiteSurvey(row.id, {
        payload,
        status: editStatus,
      });
      setRow(updated);
      setPayloadJson(JSON.stringify(updated.payload ?? {}, null, 2));
      setEditStatus(updated.status);
      setEditOpen(false);
      toast.success("Survey updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!row) return;
    setPdfLoading(true);
    try {
      await exportSiteSurveyPdf(row, row.siteName ?? row.siteId);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF export failed");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!row) return;
    if (
      !window.confirm(
        `Delete survey #${row.id} for ${row.siteName ?? row.siteId}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeleting(true);
    try {
      await deleteSiteSurvey(row.id);
      toast.success("Survey deleted");
      navigate("/corporate/site-surveys");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground p-8">Loading survey…</p>
      </DashboardLayout>
    );
  }

  if (!row) {
    return (
      <DashboardLayout>
        <p className="p-8">Survey not found.</p>
        <Button variant="outline" asChild>
          <Link to="/corporate/site-surveys">Back to list</Link>
        </Button>
      </DashboardLayout>
    );
  }

  const payload = row.payload ?? {};
  const siteLabel = row.siteName ?? row.siteId;

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" asChild>
            <Link to="/corporate/site-surveys">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to surveys
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{siteLabel}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submitted by {row.createdByName?.trim() || "guard (name pending)"} from the Movara guard app
          </p>
          <p className="text-muted-foreground text-xs mt-1">
            Survey #{row.id}
            {row.submittedAt ? ` · Submitted ${row.submittedAt}` : ` · Last updated ${row.updatedAt}`}
          </p>
          <Badge className="mt-2" variant={row.status === "submitted" ? "default" : "secondary"}>
            {row.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={pdfLoading || saving || deleting}
            onClick={() => void handleDownloadPdf()}
          >
            <Download className="mr-2 h-4 w-4" />
            {pdfLoading ? "Generating PDF…" : "Download PDF"}
          </Button>
          <Button variant="outline" onClick={() => setEditOpen((v) => !v)}>
            <Pencil className="mr-2 h-4 w-4" />
            {editOpen ? "Hide editor" : "Edit survey"}
          </Button>
          <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>

      {editOpen && (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Edit survey data</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update answers or status. Changes are saved to the server and appear on the detail view below.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xs space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">draft</SelectItem>
                  <SelectItem value="submitted">submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payload-json">Payload (JSON)</Label>
              <Textarea
                id="payload-json"
                className="font-mono text-xs min-h-[280px]"
                value={payloadJson}
                onChange={(e) => setPayloadJson(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void savePayload()} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPayloadJson(JSON.stringify(row.payload ?? {}, null, 2));
                  setEditStatus(row.status);
                  setEditOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {SURVEY_SECTIONS.filter((s) => s.id !== "intro").map((section) => {
        const steps = stepsForSection(section.id).filter((s) => s.kind !== "intro");
        const sectionPhotos = (row.photos ?? []).filter((p) => p.sectionId === section.id);
        const matrixStep = steps.find((s) => s.kind === "deployment_matrix");
        const matrixVal = matrixStep
          ? (getPayloadValue(payload, matrixStep.payloadKey) as {
              area?: string;
              riskLevel?: string;
              deployment?: string;
            }[])
          : null;

        return (
          <Card key={section.id} className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
              {section.objective && (
                <p className="text-sm text-muted-foreground">{section.objective}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {matrixStep && Array.isArray(matrixVal) && matrixVal.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Area</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead>Deployment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matrixVal.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.area ?? "—"}</TableCell>
                        <TableCell>{r.riskLevel ?? "—"}</TableCell>
                        <TableCell>{r.deployment ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {steps
                .filter((s) => s.kind !== "deployment_matrix")
                .map((step) => {
                  const val = getPayloadValue(payload, step.payloadKey);
                  const guardRec = getGuardRecommendation(payload, step.id);
                  const hasAnswer =
                    val != null && val !== "" && !(Array.isArray(val) && val.length === 0);
                  if (!hasAnswer && !guardRec) return null;
                  return (
                    <div key={step.id} className="border-b border-border/60 pb-3 last:border-0">
                      <p className="font-medium text-sm">{step.label}</p>
                      {hasAnswer ? (
                        <p className="text-sm mt-1 whitespace-pre-wrap">
                          {formatPayloadValue(val, step)}
                        </p>
                      ) : null}
                      {guardRec ? (
                        <p className="text-sm mt-2 p-2 rounded-md bg-primary/5 border border-primary/20">
                          <span className="font-medium">Guard recommendation: </span>
                          {guardRec}
                        </p>
                      ) : null}
                      {getFieldMeta(step).requiresPhoto && (
                        <p className="text-xs text-muted-foreground mt-1 italic">Photo evidence requested</p>
                      )}
                    </div>
                  );
                })}

              <SectionPhotos photos={sectionPhotos} />
            </CardContent>
          </Card>
        );
      })}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Client review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="review">Summary notes</Label>
            <Textarea
              id="review"
              className="mt-2"
              rows={4}
              value={reviewSummary}
              onChange={(e) => setReviewSummary(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void saveReview()} disabled={saving}>
              {saving ? "Saving…" : "Save review"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/corporate/site-surveys")}>
              Back to list
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
