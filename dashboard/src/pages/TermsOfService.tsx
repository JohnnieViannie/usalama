import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LegalDocument } from "@/legal/LegalDocument";
import { LEGAL_EFFECTIVE_DATE, LEGAL_PRODUCT_NAME, LEGAL_SUPPORT_EMAIL, LEGAL_TERMS_VERSION } from "@/legal/legalMeta";
import { termsSections } from "@/legal/termsSections";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/40">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-4">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Home
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/privacy">Privacy Policy</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="container max-w-3xl py-10 sm:py-14">
        <LegalDocument
          title="Terms of Service"
          subtitle={`${LEGAL_PRODUCT_NAME} · Version ${LEGAL_TERMS_VERSION} · Effective ${LEGAL_EFFECTIVE_DATE} · Contact: ${LEGAL_SUPPORT_EMAIL}`}
          sections={termsSections}
        />
      </div>
    </div>
  );
}
