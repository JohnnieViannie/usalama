import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LegalDocument } from "@/legal/LegalDocument";
import { LEGAL_EFFECTIVE_DATE, LEGAL_PRODUCT_NAME, LEGAL_SUPPORT_EMAIL } from "@/legal/legalMeta";
import { privacySections } from "@/legal/privacySections";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/40">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/terms">Terms of Service</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="container max-w-3xl py-10 sm:py-14">
        <LegalDocument
          title="Privacy Policy"
          subtitle={`${LEGAL_PRODUCT_NAME} · Effective ${LEGAL_EFFECTIVE_DATE} · Contact: ${LEGAL_SUPPORT_EMAIL}`}
          sections={privacySections}
        />
      </div>
    </div>
  );
}
