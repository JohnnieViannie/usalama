import type { ComplianceSchemaJson } from "@/lib/corporateTypes";
import type { ReqCell, ReqReview } from "@/components/compliance/AuditScoringMatrix";

export function fieldScore(answers: Record<string, unknown>, reqId: string): number | null {
  const reqs = answers.requirements as Record<string, ReqCell> | undefined;
  const v = reqs?.[reqId]?.score;
  return typeof v === "number" ? v : null;
}

export function qaRemarkText(rev: ReqReview): string {
  return (rev.qaRemark?.trim() || rev.auditorRecommendations?.trim() || "");
}

export function hasMismatch(
  answers: Record<string, unknown>,
  reviewReqs: Record<string, ReqReview>,
  reqId: string,
): boolean {
  const fs = fieldScore(answers, reqId);
  const qa = reviewReqs[reqId]?.score;
  return fs !== null && typeof qa === "number" && fs !== qa;
}

export function computeLocalReviewProgress(
  schema: ComplianceSchemaJson | undefined,
  reviewReqs: Record<string, ReqReview>,
  answers: Record<string, unknown>,
) {
  let total = 0;
  let qaScored = 0;
  let mismatchCount = 0;
  let remarkRequiredPending = 0;
  for (const sec of schema?.sections ?? []) {
    for (const req of sec.requirements) {
      total++;
      const qa = reviewReqs[req.id]?.score;
      if (typeof qa === "number") qaScored++;
      if (hasMismatch(answers, reviewReqs, req.id)) {
        mismatchCount++;
        if (!qaRemarkText(reviewReqs[req.id] ?? {})) remarkRequiredPending++;
      }
    }
  }
  return {
    requirementsTotal: total,
    qaScored,
    qaComplete: total > 0 && qaScored >= total,
    mismatchCount,
    remarkRequiredPending,
  };
}

export function collectClientReviewIssues(
  schema: ComplianceSchemaJson | undefined,
  reviewReqs: Record<string, ReqReview>,
  answers: Record<string, unknown>,
): string[] {
  const issues: string[] = [];
  for (const sec of schema?.sections ?? []) {
    for (const req of sec.requirements) {
      const qa = reviewReqs[req.id]?.score;
      if (typeof qa !== "number") {
        issues.push(`QA score required: ${req.id}`);
        continue;
      }
      if (hasMismatch(answers, reviewReqs, req.id) && !qaRemarkText(reviewReqs[req.id] ?? {})) {
        issues.push(`QA remark required for ${req.id} (field vs QA score differ)`);
      }
    }
  }
  return issues;
}

export type ChangedControl = {
  id: string;
  label: string;
  fieldScore: number;
  qaScore: number;
};

export function listChangedControls(
  schema: ComplianceSchemaJson | undefined,
  reviewReqs: Record<string, ReqReview>,
  answers: Record<string, unknown>,
): ChangedControl[] {
  const out: ChangedControl[] = [];
  for (const sec of schema?.sections ?? []) {
    for (const req of sec.requirements) {
      const fs = fieldScore(answers, req.id);
      const qa = reviewReqs[req.id]?.score;
      if (fs !== null && typeof qa === "number" && fs !== qa) {
        out.push({ id: req.id, label: req.label, fieldScore: fs, qaScore: qa });
      }
    }
  }
  return out;
}

export function fieldPercentFromAnswers(
  schema: ComplianceSchemaJson | undefined,
  answers: Record<string, unknown>,
): number {
  let totalMax = 0;
  let totalAchieved = 0;
  for (const sec of schema?.sections ?? []) {
    for (const req of sec.requirements) {
      const max = req.maxPoints ?? 2;
      totalMax += max;
      const s = fieldScore(answers, req.id);
      if (typeof s === "number") totalAchieved += s;
    }
  }
  return totalMax > 0 ? Math.round((totalAchieved / totalMax) * 1000) / 10 : 0;
}
