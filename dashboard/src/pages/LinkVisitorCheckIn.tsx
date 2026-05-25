import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { apiGetAnonymous, apiPostAnonymous } from "@/lib/api";

type PublicMeta = {
  title: string;
  eventName?: string;
  siteName?: string;
  token: string;
};

export default function LinkVisitorCheckIn() {
  const { token = "" } = useParams();

  const [meta, setMeta] = useState<PublicMeta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ checkoutCode: string; siteName: string; message?: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMeta = useCallback(async () => {
    if (!token) {
      setMetaError("Missing registration link.");
      return;
    }
    try {
      const m = await apiGetAnonymous<PublicMeta>(`/public-registration/${token}/`);
      setMeta(m);
      setMetaError(null);
    } catch (e) {
      setMetaError(e instanceof Error ? e.message : "Invalid or expired link");
    }
  }, [token]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  const checkIn = async () => {
    if (!token) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await apiPostAnonymous<{
        ok: boolean;
        checkoutCode: string;
        siteName: string;
        message?: string;
      }>("/visitor-sessions/", { registrationToken: token });
      setDone({
        checkoutCode: res.checkoutCode,
        siteName: res.siteName,
        message: res.message,
      });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Check-in failed");
    } finally {
      setBusy(false);
    }
  };

  const headline = meta
    ? [meta.title, meta.eventName].filter(Boolean).join(" · ") || "Visitor sign-in"
    : "Visitor sign-in";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Visitor sign-in</h1>
        {meta && <p className="mt-2 text-sm text-muted-foreground">{headline}</p>}
        {meta?.siteName ? <p className="text-sm text-muted-foreground">{meta.siteName}</p> : null}

        {metaError && <p className="mt-4 text-sm text-destructive">{metaError}</p>}

        {!done && meta && !metaError && (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Tap below to register your visit. You will receive a short code — keep it until you leave, then use the
              scan-out QR for this link and enter the code to sign out.
            </p>
            {actionError && <p className="text-sm text-destructive">{actionError}</p>}
            <Button className="w-full" onClick={() => void checkIn()} disabled={busy}>
              {busy ? "Working…" : "Sign in"}
            </Button>
          </div>
        )}

        {done && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">You are signed in.</p>
            <div className="rounded-lg bg-muted p-4 text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Your checkout code</div>
              <div className="mt-1 font-mono text-2xl font-bold tracking-widest">{done.checkoutCode}</div>
            </div>
            {done.message && <p className="text-sm text-muted-foreground">{done.message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
