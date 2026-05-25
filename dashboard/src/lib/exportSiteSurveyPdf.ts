import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { SiteSecuritySurveyRow, SiteSurveyPhoto } from "@/lib/corporateTypes";
import {
  formatPayloadValue,
  getPayloadValue,
  stepsForSection,
  SURVEY_SECTIONS,
} from "@/lib/siteSurveySchema";
import { getGuardRecommendation } from "@/lib/surveyFieldMeta";

const NAVY: [number, number, number] = [11, 19, 35];
const ACCENT: [number, number, number] = [59, 130, 246];
const GRAY: [number, number, number] = [100, 116, 139];
const LIGHT_BG: [number, number, number] = [241, 245, 249];
const REC_BG: [number, number, number] = [239, 246, 255];

const MARGIN = 48;
const FOOTER_H = 36;
const LINE = 14;

type SectionInfo = { id: string; title: string; objective?: string; index: number };

function authHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  const raw = localStorage.getItem("movara_auth");
  if (raw) {
    try {
      const { token } = JSON.parse(raw) as { token?: string };
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {
      /* ignore */
    }
  }
  return headers;
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/logo.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}

async function loadImageDataUrl(url: string): Promise<{ dataUrl: string; format: "JPEG" | "PNG" } | null> {
  try {
    const res = await fetch(url, { headers: authHeaders(), credentials: "include" });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size) return null;
    const dataUrl = await blobToDataUrl(blob);
    const format: "JPEG" | "PNG" = blob.type.includes("png") ? "PNG" : "JPEG";
    return { dataUrl, format };
  } catch {
    return null;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

function sectionHasContent(
  sectionId: string,
  payload: Record<string, unknown>,
  photos: SiteSurveyPhoto[],
): boolean {
  const steps = stepsForSection(sectionId).filter((s) => s.kind !== "intro");
  for (const step of steps) {
    const val = getPayloadValue(payload, step.payloadKey);
    if (val != null && val !== "" && !(Array.isArray(val) && val.length === 0)) return true;
    if (getGuardRecommendation(payload, step.id)) return true;
  }
  return photos.some((p) => p.sectionId === sectionId);
}

function buildSectionsWithContent(
  payload: Record<string, unknown>,
  photos: SiteSurveyPhoto[],
): SectionInfo[] {
  let idx = 0;
  const out: SectionInfo[] = [];
  for (const section of SURVEY_SECTIONS) {
    if (section.id === "intro") continue;
    if (!sectionHasContent(section.id, payload, photos)) continue;
    idx += 1;
    out.push({ id: section.id, title: section.title, objective: section.objective, index: idx });
  }
  return out;
}

class PdfLayout {
  doc: jsPDF;
  y: number;
  readonly pageW: number;
  readonly pageH: number;
  readonly maxW: number;
  readonly footerMeta: string;

  constructor(doc: jsPDF, footerMeta: string) {
    this.doc = doc;
    this.pageW = doc.internal.pageSize.getWidth();
    this.pageH = doc.internal.pageSize.getHeight();
    this.maxW = this.pageW - MARGIN * 2;
    this.footerMeta = footerMeta;
    this.y = MARGIN;
  }

  contentBottom() {
    return this.pageH - MARGIN - FOOTER_H;
  }

  newPage() {
    this.doc.addPage();
    this.y = MARGIN;
  }

  ensureSpace(needed: number) {
    if (this.y + needed > this.contentBottom()) {
      this.newPage();
    }
  }

  addWrapped(
    text: string,
    opts?: { bold?: boolean; size?: number; color?: [number, number, number]; indent?: number },
  ) {
    const indent = opts?.indent ?? 0;
    const x = MARGIN + indent;
    const w = this.maxW - indent;
    this.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    this.doc.setFontSize(opts?.size ?? 10);
    if (opts?.color) this.doc.setTextColor(...opts.color);
    else this.doc.setTextColor(30, 41, 59);

    const lines = this.doc.splitTextToSize(text, w) as string[];
    for (const line of lines) {
      this.ensureSpace(LINE);
      this.doc.text(line, x, this.y);
      this.y += LINE;
    }
  }

  drawRule(gap = 8) {
    this.ensureSpace(gap + 4);
    this.doc.setDrawColor(...ACCENT);
    this.doc.setLineWidth(0.75);
    this.doc.line(MARGIN, this.y, MARGIN + this.maxW, this.y);
    this.y += gap;
  }

  drawCover(row: SiteSecuritySurveyRow, siteLabel: string, logoDataUrl: string | null) {
    const d = this.doc;
    d.setFillColor(...NAVY);
    d.rect(0, 0, this.pageW, 150, "F");

    if (logoDataUrl) {
      try {
        d.addImage(logoDataUrl, "PNG", MARGIN, 28, 44, 44);
      } catch {
        /* optional logo */
      }
    }

    d.setTextColor(255, 255, 255);
    d.setFont("helvetica", "bold");
    d.setFontSize(22);
    d.text("Security Site Assessment", MARGIN, logoDataUrl ? 92 : 52);

    d.setFontSize(14);
    d.setFont("helvetica", "normal");
    d.text(siteLabel, MARGIN, logoDataUrl ? 114 : 74);

    d.setFontSize(10);
    const status = row.status === "submitted" ? "Submitted" : "Draft";
    d.text(
      `Survey #${row.id}  ·  ${status}  ·  ${row.createdByName?.trim() || "Guard"}`,
      MARGIN,
      logoDataUrl ? 132 : 92,
    );
    const when = row.submittedAt ?? row.updatedAt;
    if (when) d.text(`Date: ${when}`, MARGIN, logoDataUrl ? 146 : 106);

    this.y = 175;
    d.setTextColor(30, 41, 59);
    d.setFontSize(9);
    d.text("Detect · Prevent · Protect · Respond · Report · Improve", MARGIN, this.y);
    this.y += 28;

    autoTable(d, {
      startY: this.y,
      margin: { left: MARGIN, right: MARGIN },
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 110 } },
      body: [
        ["Site", siteLabel],
        ["Survey ID", String(row.id)],
        ["Guard", row.createdByName?.trim() || "—"],
        ["Status", status],
        ["Last updated", row.updatedAt],
        ...(row.submittedAt ? [["Submitted", row.submittedAt]] : []),
      ],
    });
    this.y = (d as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  }

  drawTableOfContents(sections: SectionInfo[]) {
    this.newPage();
    this.addWrapped("Table of contents", { bold: true, size: 16 });
    this.y += 6;
    for (const s of sections) {
      this.addWrapped(`${s.index}. ${s.title}`, { size: 11 });
      if (s.objective) {
        this.addWrapped(s.objective, { size: 9, color: GRAY, indent: 14 });
      }
    }
    this.y += 12;
  }

  drawSectionHeader(section: SectionInfo) {
    this.ensureSpace(56);
    if (this.y > MARGIN + 20) {
      this.y += 16;
    }
    const d = this.doc;
    const barH = 28;
    d.setFillColor(...NAVY);
    d.rect(MARGIN, this.y - 16, this.maxW, barH, "F");
    d.setTextColor(255, 255, 255);
    d.setFont("helvetica", "bold");
    d.setFontSize(13);
    d.text(`${section.index}. ${section.title}`, MARGIN + 10, this.y + 2);
    this.y += barH - 8;

    if (section.objective) {
      d.setTextColor(...GRAY);
      d.setFont("helvetica", "italic");
      d.setFontSize(9);
      const lines = d.splitTextToSize(section.objective, this.maxW) as string[];
      for (const line of lines) {
        this.ensureSpace(LINE);
        d.text(line, MARGIN, this.y);
        this.y += LINE - 2;
      }
    }
    this.drawRule(10);
  }

  drawQuestionBlock(label: string, answer: string, guardRec?: string) {
    this.ensureSpace(40);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(30, 41, 59);
    const labelLines = this.doc.splitTextToSize(label, this.maxW) as string[];
    for (const line of labelLines) {
      this.ensureSpace(LINE);
      this.doc.text(line, MARGIN, this.y);
      this.y += LINE;
    }
    this.doc.setDrawColor(200, 210, 220);
    this.doc.setLineWidth(0.5);
    this.doc.line(MARGIN, this.y, MARGIN + this.maxW, this.y);
    this.y += 8;

    this.addWrapped(answer, { size: 10, indent: 4 });

    if (guardRec?.trim()) {
      this.drawRecommendationBox(guardRec.trim());
    }
    this.y += 6;
  }

  drawRecommendationBox(text: string) {
    const pad = 8;
    const lines = this.doc.splitTextToSize(`Guard recommendation: ${text}`, this.maxW - pad * 2 - 6) as string[];
    const boxH = lines.length * LINE + pad * 2;
    this.ensureSpace(boxH + 4);

    const x = MARGIN;
    const w = this.maxW;
    this.doc.setFillColor(...REC_BG);
    this.doc.rect(x, this.y, w, boxH, "F");
    this.doc.setFillColor(...ACCENT);
    this.doc.rect(x, this.y, 4, boxH, "F");

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.doc.setTextColor(30, 41, 59);
    let ty = this.y + pad + 8;
    for (const line of lines) {
      this.doc.text(line, x + pad + 6, ty);
      ty += LINE;
    }
    this.y += boxH + 8;
  }

  drawDeploymentMatrix(rows: { area?: string; riskLevel?: string; deployment?: string }[]) {
    if (rows.length === 0) return;
    this.ensureSpace(60);
    autoTable(this.doc, {
      startY: this.y,
      margin: { left: MARGIN, right: MARGIN },
      head: [["Area / zone", "Risk level", "Deployment"]],
      body: rows.map((r) => [r.area ?? "—", r.riskLevel ?? "—", r.deployment ?? "—"]),
      theme: "grid",
      headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9, cellPadding: 5 },
      alternateRowStyles: { fillColor: LIGHT_BG },
    });
    this.y = (this.doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14;
  }

  async drawPhotoGrid(photos: SiteSurveyPhoto[], sectionTitle: string) {
    if (photos.length === 0) return;
    this.ensureSpace(40);
    this.addWrapped("Photo evidence", { bold: true, size: 11 });
    this.y += 4;

    const gap = 12;
    const cols = 2;
    const imgW = (this.maxW - gap) / cols;
    const imgH = imgW * 0.72;
    const captionH = 22;
    const rowH = imgH + captionH + gap;

    let col = 0;
    let rowStartY = this.y;

    for (const photo of photos) {
      if (col === 0) {
        this.ensureSpace(rowH);
        rowStartY = this.y;
      }
      const x = MARGIN + col * (imgW + gap);
      const yImg = rowStartY;

      const loaded = await loadImageDataUrl(photo.url);
      if (loaded) {
        try {
          this.doc.addImage(loaded.dataUrl, loaded.format, x, yImg, imgW, imgH);
          this.doc.setDrawColor(220, 220, 220);
          this.doc.setLineWidth(0.5);
          this.doc.rect(x, yImg, imgW, imgH, "S");
        } catch {
          this.drawPhotoPlaceholder(x, yImg, imgW, imgH);
        }
      } else {
        this.drawPhotoPlaceholder(x, yImg, imgW, imgH);
      }

      this.doc.setFontSize(8);
      this.doc.setTextColor(...GRAY);
      const cap = photo.fieldId ? `${sectionTitle} · ${photo.fieldId}` : sectionTitle;
      const capLines = this.doc.splitTextToSize(cap, imgW) as string[];
      let cy = yImg + imgH + 10;
      for (const line of capLines.slice(0, 2)) {
        this.doc.text(line, x, cy);
        cy += 10;
      }

      col += 1;
      if (col >= cols) {
        col = 0;
        this.y = rowStartY + rowH;
      }
    }
    if (col > 0) {
      this.y = rowStartY + rowH;
    }
    this.y += 8;
  }

  drawPhotoPlaceholder(x: number, y: number, w: number, h: number) {
    this.doc.setFillColor(...LIGHT_BG);
    this.doc.rect(x, y, w, h, "F");
    this.doc.setFontSize(9);
    this.doc.setTextColor(...GRAY);
    this.doc.text("Image unavailable", x + w / 2, y + h / 2, { align: "center" });
  }

  drawClientReview(summary: string, sectionIndex: number, reviewedAt?: string) {
    this.newPage();
    const section: SectionInfo = {
      id: "review",
      title: "Client review",
      objective: "Summary notes from the security client.",
      index: sectionIndex,
    };
    this.drawSectionHeader(section);
    this.addWrapped(summary, { size: 10 });
    if (reviewedAt) {
      this.y += 6;
      this.addWrapped(`Reviewed: ${reviewedAt}`, { size: 9, color: GRAY });
    }
  }

  applyFooters() {
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i);
      this.doc.setDrawColor(220, 220, 220);
      this.doc.setLineWidth(0.5);
      this.doc.line(MARGIN, this.pageH - FOOTER_H, this.pageW - MARGIN, this.pageH - FOOTER_H);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8);
      this.doc.setTextColor(...GRAY);
      this.doc.text(this.footerMeta, MARGIN, this.pageH - 18);
      this.doc.text(`Page ${i} of ${total}`, this.pageW - MARGIN, this.pageH - 18, { align: "right" });
    }
  }
}

function renderSectionBody(
  layout: PdfLayout,
  section: SectionInfo,
  payload: Record<string, unknown>,
  photos: SiteSurveyPhoto[],
) {
  const steps = stepsForSection(section.id).filter((s) => s.kind !== "intro");

  const matrixStep = steps.find((s) => s.kind === "deployment_matrix");
  if (matrixStep) {
    const val = getPayloadValue(payload, matrixStep.payloadKey);
    if (Array.isArray(val) && val.length > 0) {
      layout.drawDeploymentMatrix(
        val as { area?: string; riskLevel?: string; deployment?: string }[],
      );
    }
  }

  for (const step of steps) {
    if (step.kind === "deployment_matrix") continue;
    const val = getPayloadValue(payload, step.payloadKey);
    const guardRec = getGuardRecommendation(payload, step.id);
    const hasAnswer = val != null && val !== "" && !(Array.isArray(val) && val.length === 0);
    if (!hasAnswer && !guardRec) continue;
    const answer = hasAnswer ? formatPayloadValue(val, step) : "—";
    layout.drawQuestionBlock(step.label, answer, guardRec ?? undefined);
  }

  const sectionPhotos = photos.filter((p) => p.sectionId === section.id);
  return sectionPhotos;
}

export async function exportSiteSurveyPdf(
  row: SiteSecuritySurveyRow,
  siteLabel: string,
): Promise<void> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const payload = row.payload ?? {};
  const photos = row.photos ?? [];
  const footerMeta = `Movara · Survey #${row.id} · ${siteLabel}`;
  const layout = new PdfLayout(doc, footerMeta);

  const [logoDataUrl, sections] = await Promise.all([
    loadLogoDataUrl(),
    Promise.resolve(buildSectionsWithContent(payload, photos)),
  ]);

  layout.drawCover(row, siteLabel, logoDataUrl);

  if (sections.length > 0) {
    layout.drawTableOfContents(sections);
  }

  for (const section of sections) {
    layout.drawSectionHeader(section);
    const sectionPhotos = renderSectionBody(layout, section, payload, photos);
    await layout.drawPhotoGrid(sectionPhotos, section.title);
  }

  if (row.review?.summary?.trim()) {
    layout.drawClientReview(row.review.summary.trim(), sections.length + 1, row.review.reviewedAt);
  }

  layout.applyFooters();
  doc.save(`site-survey-${row.id}-${siteLabel.replace(/[^\w.-]+/g, "-").slice(0, 40)}.pdf`);
}
